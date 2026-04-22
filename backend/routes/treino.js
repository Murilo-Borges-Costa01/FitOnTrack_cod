import { Router } from "express";
import * as controller from "../controllers/treinoController.js";
import { uploadImagem } from "../middlewares/uploadImagem.js";

const router = Router();

router.get("/treinos", controller.listar);
router.post("/treinos", uploadImagem("treinos"), controller.criar);
router.patch("/treinos/:id/anexar-aluno", controller.anexarAAluno);
router.patch("/treinos/:id", uploadImagem("treinos"), controller.atualizar);
router.get("/treinos/:id", controller.buscarPorId);
router.delete("/treinos/:id", controller.deletar);

export default router;
