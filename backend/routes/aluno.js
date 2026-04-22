import { Router } from "express";
import * as controller from "../controllers/alunoController.js";
import { uploadImagem } from "../middlewares/uploadImagem.js";

const router = Router();

router.get("/alunos", controller.listar);
router.get("/alunos/disponiveis", controller.listarDisponiveis);
router.get("/alunos/:id", controller.buscarPorId);
router.post("/alunos", uploadImagem("alunos"), controller.criar);
router.patch("/alunos/:id", uploadImagem("alunos"), controller.atualizar);
router.delete("/alunos/:id", controller.deletar);
router.post("/auth/aluno", controller.login);
router.post("/reset-senha/aluno", controller.redefinirSenha);

// Endpoints de relação Personal-Aluno
router.post("/alunos/:id/vincular-personal", controller.vincularPersonal);
router.delete("/alunos/:id/desvincular-personal", controller.desvinculaPersonal);

export default router;

// import { Router } from 'express';
// import {
//     atualizarAluno,
//     mostrarAlunos,
//     criarAlunos,
//     deletarAluno,
//     loginAluno,
//     buscarAlunoPorId
// } from '../controllers/AlunoController.js';

// const router = Router();

// // CRUD
// router.post('/alunos', criarAlunos);
// router.get('/alunos', mostrarAlunos);
// router.get('/alunos/:id', buscarAlunoPorId);
// router.patch('/alunos/:id', atualizarAluno);
// router.delete('/alunos/:id', deletarAluno);

// // LOGIN
// router.post('/auth/aluno', loginAluno);

// export default router;
