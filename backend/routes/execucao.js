import { Router } from "express";
import { iniciar, registrar } from "../controllers/execucaoController.js";

const router = Router();

router.post("/execucao", iniciar);
router.post("/execucao-exercicio", registrar);

export default router;