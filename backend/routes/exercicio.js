import { Router } from "express";
import * as controller from "../controllers/exercicioController.js";

const router = Router();

router.get("/exercicios", controller.listar);
router.post("/exercicios", controller.criar);
router.patch("/exercicios/:id", controller.atualizar);
router.delete("/exercicios/:id", controller.deletar);

export default router;