import bcrypt from "bcryptjs";
import { Aluno } from "../models/alunoM.js";
import { getUploadedImagePath } from "../middlewares/uploadImagem.js";
import {
    normalizeOptionalString,
    normalizeRequiredString,
    parseOptionalNumber,
    parseRequiredNumber
} from "../utils/requestParsers.js";

function buildAlunoPayload(body, file, { isUpdate = false } = {}) {
    const payload = {};

    if (!isUpdate || body.nome !== undefined) {
        payload.nome = normalizeRequiredString(body.nome);
    }

    if (!isUpdate || body.email !== undefined) {
        payload.email = normalizeRequiredString(body.email).toLowerCase();
    }

    if (!isUpdate || body.genero_id !== undefined) {
        payload.genero_id = parseRequiredNumber(body.genero_id, "Genero");
    }

    if (!isUpdate || body.objetivo_id !== undefined) {
        payload.objetivo_id = parseRequiredNumber(body.objetivo_id, "Objetivo");
    }

    if (!isUpdate || body.altura !== undefined) {
        payload.altura = isUpdate
            ? parseOptionalNumber(body.altura, "Altura")
            : parseRequiredNumber(body.altura, "Altura");
    }

    if (!isUpdate || body.massa !== undefined) {
        payload.massa = isUpdate
            ? parseOptionalNumber(body.massa, "Massa")
            : parseRequiredNumber(body.massa, "Massa");
    }

    if (!isUpdate || body.problema_saude !== undefined) {
        payload.problema_saude = normalizeOptionalString(body.problema_saude);
    }

    const imagePath = getUploadedImagePath(file);
    if (imagePath) {
        payload.imagem = imagePath;
    }

    return payload;
}

export async function listar(req, res) {
    const dados = await Aluno.findAll();
    res.json(dados);
}

export async function buscarPorId(req, res) {
    const dado = await Aluno.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ erro: "Nao encontrado" });
    res.json(dado);
}

export async function criar(req, res) {
    try {
        const payload = buildAlunoPayload(req.body, req.file);
        const senha = normalizeRequiredString(req.body.senha);

        if (!payload.nome || !payload.email || !senha || !payload.genero_id || !payload.objetivo_id || !payload.altura || !payload.massa) {
            return res.status(400).json({ erro: "Preencha todos os campos obrigatorios." });
        }

        const existe = await Aluno.findOne({ where: { email: payload.email } });
        if (existe) return res.status(400).json({ erro: "Email ja cadastrado" });

        const hash = await bcrypt.hash(senha, 10);
        const aluno = await Aluno.create({ ...payload, senha: hash });
        res.status(201).json(aluno);
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel cadastrar o aluno." });
    }
}

export async function atualizar(req, res) {
    try {
        const aluno = await Aluno.findByPk(req.params.id);
        if (!aluno) return res.status(404).json({ erro: "Nao encontrado" });

        const dados = buildAlunoPayload(req.body, req.file, { isUpdate: true });

        if (dados.email) {
            const existente = await Aluno.findOne({ where: { email: dados.email } });
            if (existente && existente.id !== aluno.id) {
                return res.status(400).json({ erro: "Email ja cadastrado" });
            }
        }

        if (req.body.senha) {
            dados.senha = await bcrypt.hash(normalizeRequiredString(req.body.senha), 10);
        }

        const mergedAltura = dados.altura ?? aluno.altura;
        const mergedMassa = dados.massa ?? aluno.massa;

        if (!Number.isFinite(Number(mergedAltura)) || Number(mergedAltura) <= 0) {
            return res.status(400).json({ erro: "Altura deve ser um numero valido maior que zero." });
        }

        if (!Number.isFinite(Number(mergedMassa)) || Number(mergedMassa) <= 0) {
            return res.status(400).json({ erro: "Massa deve ser um numero valido maior que zero." });
        }

        await aluno.update(dados);
        res.json({ mensagem: "Atualizado", aluno });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel atualizar o aluno." });
    }
}

export async function deletar(req, res) {
    try {
        const aluno = await Aluno.findByPk(req.params.id);
        if (!aluno) return res.status(404).json({ erro: "Nao encontrado" });

        // Importar modelos de relação aqui dentro para evitar circular imports
        const { Treino } = await import("../models/treinoM.js");
        const { Avaliacao } = await import("../models/avaliacaoM.js");

        // 1. Deletar todos os treinos do aluno
        await Treino.destroy({ where: { aluno_id: req.params.id } });

        // 2. Deletar todas as avaliações do aluno
        await Avaliacao.destroy({ where: { aluno_id: req.params.id } });

        // 3. Deletar o aluno (personal_id será automaticamente desvinculado)
        await Aluno.destroy({ where: { id: req.params.id } });

        res.json({ mensagem: "Conta deletada com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: error.message || "Nao foi possivel deletar a conta." });
    }
}

export async function login(req, res) {
    const { email, senha } = req.body;

    const aluno = await Aluno.findOne({ where: { email } });
    if (!aluno) return res.status(401).json({ erro: "Invalido" });

    const ok = await bcrypt.compare(senha, aluno.senha);
    if (!ok) return res.status(401).json({ erro: "Invalido" });

    req.session.user = {
        id: aluno.id,
        tipo: "aluno"
    };

    res.json({ id: aluno.id, nome: aluno.nome, email: aluno.email });
}

export async function redefinirSenha(req, res) {
    try {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({ erro: "Email e nova senha sao obrigatorios." });
        }

        const aluno = await Aluno.findOne({ where: { email: email.toLowerCase() } });
        if (!aluno) {
            return res.status(404).json({ erro: "Email nao encontrado" });
        }

        const hash = await bcrypt.hash(novaSenha, 10);
        await aluno.update({ senha: hash });

        res.json({ mensagem: "Senha redefinida com sucesso" });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel redefinir a senha." });
    }
}

// ====== ENDPOINTS DE RELAÇÃO PERSONAL-ALUNO ======

/**
 * GET /api/alunos/disponiveis
 * Lista todos os alunos que NÃO tem um personal vinculado
 */
export async function listarDisponiveis(req, res) {
    try {
        const alunos = await Aluno.findAll({
            where: { personal_id: null },
            attributes: { exclude: ["senha"] },
            include: ["genero", "objetivo"]
        });
        res.json(alunos);
    } catch (error) {
        res.status(500).json({ erro: error.message || "Erro ao listar alunos disponiveis" });
    }
}

/**
 * POST /api/alunos/:id/vincular-personal
 * Vincula um aluno a um personal
 * Body: { personal_id }
 */
export async function vincularPersonal(req, res) {
    try {
        const { personal_id } = req.body;

        if (!personal_id) {
            return res.status(400).json({ erro: "personal_id é obrigatório" });
        }

        const aluno = await Aluno.findByPk(req.params.id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno nao encontrado" });
        }

        // Verificar se o aluno já tem um personal
        if (aluno.personal_id !== null) {
            return res.status(400).json({ 
                erro: "Este aluno ja esta vinculado a um personal. Desvincule primeiro." 
            });
        }

        // Atualizar aluno
        await aluno.update({ personal_id });

        const alunoAtualizado = await Aluno.findByPk(req.params.id, {
            attributes: { exclude: ["senha"] },
            include: ["personal", "genero", "objetivo"]
        });

        res.json({ 
            mensagem: "Aluno vinculado ao personal com sucesso",
            aluno: alunoAtualizado 
        });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Erro ao vincular aluno" });
    }
}

/**
 * DELETE /api/alunos/:id/desvincular-personal
 * Desvincul um aluno do seu personal
 */
export async function desvinculaPersonal(req, res) {
    try {
        const aluno = await Aluno.findByPk(req.params.id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno nao encontrado" });
        }

        if (aluno.personal_id === null) {
            return res.status(400).json({ erro: "Este aluno nao possui um personal vinculado" });
        }

        await aluno.update({ personal_id: null });

        res.json({ mensagem: "Aluno desvinculado do personal com sucesso" });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Erro ao desvincular aluno" });
    }
}
