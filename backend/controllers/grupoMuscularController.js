import { GrupoMuscular } from "../models/grupoMuscularM.js";

export async function listar(req, res) {
    const dados = await GrupoMuscular.findAll();
    res.json(dados);
}

export async function buscarPorId(req, res) {
    const dado = await GrupoMuscular.findByPk(req.params.id);
    if (!dado) return res.status(404).json({ erro: "Nao encontrado" });
    res.json(dado);
}

export async function criar(req, res) {
    const { nome } = req.body;

    const existe = await GrupoMuscular.findOne({ where: { nome } });
    if (existe) return res.status(400).json({ erro: "Grupo muscular ja cadastrado" });

    const grupoMuscular = await GrupoMuscular.create({ nome });
    res.status(201).json(grupoMuscular);
}

export async function atualizar(req, res) {
    const [linhas] = await GrupoMuscular.update(req.body, { where: { id: req.params.id } });

    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json({ mensagem: "Atualizado" });
}

export async function deletar(req, res) {
    const linhas = await GrupoMuscular.destroy({ where: { id: req.params.id } });
    if (!linhas) return res.status(404).json({ erro: "Nao encontrado" });
    res.json();
}
