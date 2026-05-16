import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendAssetsDir = path.join(__dirname, "../../frontend/assets");
const uploadRootDir = path.join(frontendAssetsDir, "uploads");
const allowedMimeTypes = new Set(["image/jpeg", "image/png"]);
const maxFileSizeInBytes = 5 * 1024 * 1024;
const allowedEntities = new Set(["alunos", "personais", "treinos"]);

function ensureDirectory(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }
}

function buildStorage(entity) {
    return multer.diskStorage({
        destination: (req, file, callback) => {
            const targetDirectory = path.join(uploadRootDir, entity);
            ensureDirectory(targetDirectory);
            callback(null, targetDirectory);
        },
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname || "").toLowerCase() || ".png";
            const safeBaseName = (path.basename(file.originalname || "imagem", extension) || "imagem")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9_-]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();

            callback(null, `${Date.now()}-${safeBaseName || "imagem"}${extension}`);
        }
    });
}

function fileFilter(req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
        callback(new Error("Envie uma imagem JPG ou PNG."));
        return;
    }

    callback(null, true);
}

export function uploadImagem(entity) {
    return multer({
        storage: buildStorage(entity),
        fileFilter,
        limits: { fileSize: maxFileSizeInBytes }
    }).single("imagem");
}

export function uploadImagemDinamica(req, res, next) {
    if (!allowedEntities.has(req.params.tipo)) {
        res.status(400).json({ erro: "Tipo de upload nao suportado." });
        return;
    }

    return uploadImagem(req.params.tipo)(req, res, next);
}

export function tratarErroUpload(error, req, res, next) {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            res.status(400).json({ erro: "A imagem deve ter no maximo 5 MB." });
            return;
        }

        res.status(400).json({ erro: "Nao foi possivel processar o upload da imagem." });
        return;
    }

    if (error?.message) {
        res.status(400).json({ erro: error.message });
        return;
    }

    next(error);
}

export function getUploadedImagePath(file) {
    if (!file?.filename) {
        return null;
    }

    const entity = path.basename(path.dirname(file.path));
    return `assets/uploads/${entity}/${file.filename}`;
}
