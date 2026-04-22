import { Genero } from "../models/generoM.js";

export async function listar(req, res) {
    const dados = await Genero.findAll();
    res.json(dados);
}

export async function buscarPorId(req, res) {
    const dado = await Genero.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ erro: "Nao encontrado" });
    res.json(dado);
}

export async function criar(req, res) {
    const { nome } = req.body;

    const existe = await Genero.findOne({ where: { nome } });
    if (existe) return res.status(400).json({ erro: "Genero ja cadastrado" });

    const genero = await Genero.create({ nome });
    res.status(201).json(genero);
}

export async function atualizar(req, res) {
    const [linhas] = await Genero.update(req.body, { where: { id: req.params.id } });

    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json({ mensagem: "Atualizado" });
}

export async function deletar(req, res) {
    const linhas = await Genero.destroy({ where: { id: req.params.id } });
    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json();
}
