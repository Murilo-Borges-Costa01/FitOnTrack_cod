import { Router } from "express";
import * as controller from "../controllers/generoController.js";

const router = Router();

router.get("/generos", controller.listar);
router.get("/generos/:id", controller.buscarPorId);
router.post("/generos", controller.criar);
router.patch("/generos/:id", controller.atualizar);
router.delete("/generos/:id", controller.deletar);

export default router;
