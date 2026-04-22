import { Exercicio } from "../models/exercicioM.js";
import { normalizeOptionalString, normalizeRequiredString, parseRequiredNumber } from "../utils/requestParsers.js";

function buildExercicioPayload(body, { isUpdate = false } = {}) {
    const payload = {};

    if (!isUpdate || body.nome !== undefined) {
        payload.nome = normalizeRequiredString(body.nome);
    }

    if (!isUpdate || body.descricao !== undefined) {
        payload.descricao = normalizeOptionalString(body.descricao);
    }

    if (!isUpdate || body.grupo_muscular_id !== undefined) {
        payload.grupo_muscular_id = body.grupo_muscular_id === null || body.grupo_muscular_id === ""
            ? null
            : parseRequiredNumber(body.grupo_muscular_id, "Grupo muscular");
    }

    if (!isUpdate || body.imagem !== undefined) {
        payload.imagem = normalizeOptionalString(body.imagem);
    }

    return payload;
}

export async function listar(req, res) {
    res.json(await Exercicio.findAll());
}

export async function criar(req, res) {
    try {
        const dados = buildExercicioPayload(req.body);

        if (!dados.nome) {
            return res.status(400).json({ erro: "Nome do exercicio e obrigatorio." });
        }

        const exercicio = await Exercicio.create(dados);
        res.status(201).json(exercicio);
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel criar o exercicio." });
    }
}

export async function atualizar(req, res) {
    try {
        const exercicio = await Exercicio.findByPk(req.params.id);

        if (!exercicio) {
            return res.status(404).json({ erro: "Nao encontrado" });
        }

        const dados = buildExercicioPayload(req.body, { isUpdate: true });

        if (dados.nome !== undefined && !dados.nome) {
            return res.status(400).json({ erro: "Nome do exercicio e obrigatorio." });
        }

        if (!Object.keys(dados).length) {
            return res.status(400).json({ erro: "Nenhum campo para atualizar." });
        }

        await exercicio.update(dados);
        res.json({ mensagem: "Exercicio atualizado", exercicio });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel atualizar o exercicio." });
    }
}

export async function deletar(req, res) {
    const linhas = await Exercicio.destroy({ where: { id: req.params.id } });
    if (!linhas) return res.status(404).json({ erro: "Não encontrado" });
    res.json();
}