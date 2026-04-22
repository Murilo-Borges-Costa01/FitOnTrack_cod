import { Objetivo } from "../models/objetivoM.js";

export async function listar(req, res) {
    const dados = await Objetivo.findAll();
    res.json(dados);
}

export async function buscarPorId(req, res) {
    const dado = await Objetivo.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ erro: "Nao encontrado" });
    res.json(dado);
}

export async function criar(req, res) {
    const { nome } = req.body;

    const existe = await Objetivo.findOne({ where: { nome } });
    if (existe) return res.status(400).json({ erro: "Objetivo ja cadastrado" });

    const objetivo = await Objetivo.create({ nome });
    res.status(201).json(objetivo);
}

export async function atualizar(req, res) {
    const [linhas] = await Objetivo.update(req.body, { where: { id: req.params.id } });

    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json({ mensagem: "Atualizado" });
}

export async function deletar(req, res) {
    const linhas = await Objetivo.destroy({ where: { id: req.params.id } });
    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json();
}
