import { Router } from "express";
import { adicionar } from "../controllers/treinoExercicioController.js";

const router = Router();

router.post("/treino-exercicios", adicionar);

export default router;