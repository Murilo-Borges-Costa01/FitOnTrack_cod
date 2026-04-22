import { ExecucaoTreino, ExecucaoExercicio } from "../models/execucaoM.js";

export async function iniciar(req, res) {
    const exec = await ExecucaoTreino.create({
        treino_id: req.body.treino_id
    });
    res.status(201).json(exec);
}

export async function registrar(req, res) {
    const dados = await ExecucaoExercicio.create(req.body);
    res.status(201).json(dados);
}