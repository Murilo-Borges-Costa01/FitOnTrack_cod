import { TreinoExercicio } from "../models/treinoExercicioM.js";

export async function adicionar(req, res) {
    try {
        const dados = await TreinoExercicio.create(req.body);
        res.status(201).json(dados);
    } catch {
        res.status(500).json({ erro: "Erro ao adicionar exercício no treino" });
    }
}