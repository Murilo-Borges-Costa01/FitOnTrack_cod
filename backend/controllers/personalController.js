import bcrypt from "bcryptjs";
import { Personal } from "../models/personalM.js";
import { Aluno } from "../models/alunoM.js";
import { getUploadedImagePath } from "../middlewares/uploadImagem.js";
import { normalizeRequiredString, normalizeOptionalString, parseRequiredNumber, normalizeCref } from "../utils/requestParsers.js";

function buildPersonalPayload(body, file, { isUpdate = false } = {}) {
    const payload = {};

    if (!isUpdate || body.cref !== undefined) {
        payload.cref = normalizeCref(body.cref);
    }

    if (!isUpdate || body.nome !== undefined) {
        payload.nome = normalizeRequiredString(body.nome);
    }

    if (!isUpdate || body.email !== undefined) {
        payload.email = normalizeRequiredString(body.email).toLowerCase();
    }

    if (!isUpdate || body.genero_id !== undefined) {
        payload.genero_id = parseRequiredNumber(body.genero_id, "Genero");
    }

    if (!isUpdate || body.certificados !== undefined) {
        payload.certificados = normalizeOptionalString(body.certificados);
    }

    if (!isUpdate || body.especialidade !== undefined) {
        payload.especialidade = normalizeOptionalString(body.especialidade);
    }

    const imagePath = getUploadedImagePath(file);
    if (imagePath) {
        payload.imagem = imagePath;
    }

    return payload;
}

export async function listar(req, res) {
    res.json(await Personal.findAll());
}

export async function buscarPorId(req, res) {
    const dado = await Personal.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ erro: "Nao encontrado" });
    res.json(dado);
}

export async function criar(req, res) {
    try {
        const payload = buildPersonalPayload(req.body, req.file);
        const senha = normalizeRequiredString(req.body.senha);

        if (!payload.cref || !payload.nome || !payload.email || !senha || !payload.genero_id) {
            return res.status(400).json({ erro: "Preencha todos os campos obrigatorios." });
        }

        const existentePorEmail = await Personal.findOne({ where: { email: payload.email } });
        if (existentePorEmail) {
            return res.status(400).json({ erro: "Email ja cadastrado" });
        }

        const existentePorCref = await Personal.findOne({ where: { cref: payload.cref } });
        if (existentePorCref) {
            return res.status(400).json({ erro: "CREF ja cadastrado" });
        }

        const hash = await bcrypt.hash(senha, 10);
        const personal = await Personal.create({ ...payload, senha: hash });

        res.status(201).json(personal);
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel cadastrar o personal." });
    }
}

export async function atualizar(req, res) {
    try {
        const personal = await Personal.findByPk(req.params.id);
        if (!personal) return res.status(404).json({ erro: "Nao encontrado" });

        const dados = buildPersonalPayload(req.body, req.file, { isUpdate: true });

        if (dados.email) {
            const existentePorEmail = await Personal.findOne({ where: { email: dados.email } });
            if (existentePorEmail && existentePorEmail.id !== personal.id) {
                return res.status(400).json({ erro: "Email ja cadastrado" });
            }
        }

        if (dados.cref) {
            const existentePorCref = await Personal.findOne({ where: { cref: dados.cref } });
            if (existentePorCref && existentePorCref.id !== personal.id) {
                return res.status(400).json({ erro: "CREF ja cadastrado" });
            }
        }

        if (req.body.senha) {
            dados.senha = await bcrypt.hash(normalizeRequiredString(req.body.senha), 10);
        }

        await personal.update(dados);
        res.json({ mensagem: "Atualizado", personal });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel atualizar o personal." });
    }
}

export async function deletar(req, res) {
    try {
        const personal = await Personal.findByPk(req.params.id);
        if (!personal) return res.status(404).json({ erro: "Nao encontrado" });

        // Importar modelos de relação aqui dentro para evitar circular imports
        const { Treino } = await import("../models/treinoM.js");
        const { Avaliacao } = await import("../models/avaliacaoM.js");

        // 1. Deletar todos os treinos criados por este personal
        await Treino.destroy({ where: { personal_id: req.params.id } });

        // 2. Deletar todas as avaliações do personal
        await Avaliacao.destroy({ where: { personal_id: req.params.id } });

        // 3. Desvincular todos os alunos (colocar personal_id deles como null)
        await Aluno.update(
            { personal_id: null },
            { where: { personal_id: req.params.id } }
        );

        // 4. Deletar o personal
        await Personal.destroy({ where: { id: req.params.id } });

        res.json({ mensagem: "Conta deletada com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: error.message || "Nao foi possivel deletar a conta." });
    }
}

export async function login(req, res) {
    const { email, senha } = req.body;

    const user = await Personal.findOne({ where: { email } });
    if (!user) return res.status(401).json({ erro: "Invalido" });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ erro: "Invalido" });

    req.session.user = {
        id: user.id,
        tipo: "personal"
    };

    res.json({ id: user.id, nome: user.nome, email: user.email });
}

export async function redefinirSenha(req, res) {
    try {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({ erro: "Email e nova senha sao obrigatorios." });
        }

        const personal = await Personal.findOne({ where: { email: email.toLowerCase() } });
        if (!personal) {
            return res.status(404).json({ erro: "Email nao encontrado" });
        }

        const hash = await bcrypt.hash(novaSenha, 10);
        await personal.update({ senha: hash });

        res.json({ mensagem: "Senha redefinida com sucesso" });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel redefinir a senha." });
    }
}

// ====== ENDPOINTS DE GESTÃO DE ALUNOS ======

/**
 * GET /api/personais/:id/alunos
 * Lista todos os alunos vinculados ao personal
 */
export async function listarAlunos(req, res) {
    try {
        const personal = await Personal.findByPk(req.params.id);
        if (!personal) {
            return res.status(404).json({ erro: "Personal nao encontrado" });
        }

        const alunos = await Aluno.findAll({
            where: { personal_id: req.params.id },
            attributes: { exclude: ["senha"] },
            include: ["genero", "objetivo"]
        });

        res.json(alunos);
    } catch (error) {
        res.status(500).json({ erro: error.message || "Erro ao listar alunos" });
    }
}

/**
 * POST /api/personais/:id/alunos/vincular
 * Vincula um aluno ao personal
 * Body: { aluno_id }
 */
export async function vincularAluno(req, res) {
    try {
        const { aluno_id } = req.body;
        const personal_id = req.params.id;

        if (!aluno_id) {
            return res.status(400).json({ erro: "aluno_id é obrigatório" });
        }

        // Verificar se personal existe
        const personal = await Personal.findByPk(personal_id);
        if (!personal) {
            return res.status(404).json({ erro: "Personal nao encontrado" });
        }

        // Verificar se aluno existe
        const aluno = await Aluno.findByPk(aluno_id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno nao encontrado" });
        }

        // Verificar se aluno já tem um personal
        if (aluno.personal_id !== null) {
            return res.status(400).json({ 
                erro: "Este aluno ja esta vinculado a outro personal" 
            });
        }

        // Vincular aluno
        await aluno.update({ personal_id });

        const alunoAtualizado = await Aluno.findByPk(aluno_id, {
            attributes: { exclude: ["senha"] },
            include: ["personal", "genero", "objetivo"]
        });

        res.json({ 
            mensagem: "Aluno vinculado com sucesso",
            aluno: alunoAtualizado 
        });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Erro ao vincular aluno" });
    }
}

/**
 * DELETE /api/personais/:id/alunos/:aluno_id/desvincular
 * Desvincula um aluno do personal
 */
export async function desvinculaAluno(req, res) {
    try {
        const { id: personal_id, aluno_id } = req.params;

        const aluno = await Aluno.findByPk(aluno_id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno nao encontrado" });
        }

        // Verificar se o aluno realmente pertence a este personal
        if (aluno.personal_id !== parseInt(personal_id)) {
            return res.status(403).json({ 
                erro: "Este aluno nao esta vinculado a este personal" 
            });
        }

        await aluno.update({ personal_id: null });

        res.json({ mensagem: "Aluno desvinculado com sucesso" });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Erro ao desvincular aluno" });
    }
}
