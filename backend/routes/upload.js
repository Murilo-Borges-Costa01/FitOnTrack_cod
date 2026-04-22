import { Router } from "express";
import { getUploadedImagePath, uploadImagemDinamica } from "../middlewares/uploadImagem.js";

const router = Router();

router.post("/uploads/imagens/:tipo", uploadImagemDinamica, (req, res) => {
    const imagePath = getUploadedImagePath(req.file);

    if (!imagePath) {
        return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
    }

    res.status(201).json({ imagem: imagePath });
});

export default router;
