import { Router } from "express";
import * as controller from "../controllers/objetivoController.js";

const router = Router();

router.get("/objetivos", controller.listar);
router.get("/objetivos/:id", controller.buscarPorId);
router.post("/objetivos", controller.criar);
router.patch("/objetivos/:id", controller.atualizar);
router.delete("/objetivos/:id", controller.deletar);

export default router;
