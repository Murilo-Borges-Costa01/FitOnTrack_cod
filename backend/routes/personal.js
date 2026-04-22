import { Router } from "express";
import * as controller from "../controllers/personalController.js";
import { uploadImagem } from "../middlewares/uploadImagem.js";

const router = Router();

router.get("/personais", controller.listar);
router.get("/personais/:id", controller.buscarPorId);
router.post("/personais", uploadImagem("personais"), controller.criar);
router.patch("/personais/:id", uploadImagem("personais"), controller.atualizar);
router.delete("/personais/:id", controller.deletar);
router.post("/auth/personal", controller.login);
router.post("/reset-senha/personal", controller.redefinirSenha);

// Endpoints de gestão de alunos
router.get("/personais/:id/alunos", controller.listarAlunos);
router.post("/personais/:id/alunos/vincular", controller.vincularAluno);
router.delete("/personais/:id/alunos/:aluno_id/desvincular", controller.desvinculaAluno);

export default router;


// import { Router } from 'express';
// import {
//     criarPersonal,
//     deletarPersonal,
//     atualizarPersonal,
//     mostrarPersonais,
//     loginPersonal,
//     buscarPersonalPorId
// } from '../controllers/personalControler.js';

// const router = Router();

// // CRUD
// router.post('/personais', criarPersonal);
// router.get('/personais', mostrarPersonais);
// router.get('/personais/:id', buscarPersonalPorId);
// router.patch('/personais/:id', atualizarPersonal);
// router.delete('/personais/:id', deletarPersonal);

// // LOGIN
// router.post('/auth/personal', loginPersonal);

// export default router;
