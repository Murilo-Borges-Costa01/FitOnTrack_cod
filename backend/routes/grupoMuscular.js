import { Router } from "express";
import * as controller from "../controllers/grupoMuscularController.js";

const router = Router();

router.get("/grupos-musculares", controller.listar);
router.get("/grupos-musculares/:id", controller.buscarPorId);
router.post("/grupos-musculares", controller.criar);
router.patch("/grupos-musculares/:id", controller.atualizar);
router.delete("/grupos-musculares/:id", controller.deletar);

export default router;
