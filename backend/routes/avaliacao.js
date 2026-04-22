import { Router } from "express";
import * as controller from "../controllers/avaliacaoController.js";

const router = Router();

// Admin
router.get("/avaliacoes", controller.listar);

// Criar avaliação
router.post("/avaliacoes", controller.criar);

// Listar avaliações de um personal
router.get("/personais/:personal_id/avaliacoes", controller.listarAvaliacoesPessoal);

// Obter média de estrelas com total
router.get("/personais/:personal_id/media-estrelas", controller.obterMediaEstrelas);

// Obter minha avaliação para um personal
router.get("/personais/:personal_id/minha-avaliacao", controller.obterMinhaAvaliacao);

// Deletar avaliação
router.delete("/avaliacoes/:id", controller.deletar);

export default router;
