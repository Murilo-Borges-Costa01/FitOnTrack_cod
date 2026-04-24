import cors from "cors";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "./config/banco.js";
import "./models/associations.js";

import alunoRoutes from "./routes/aluno.js";
import avaliacaoRoutes from "./routes/avaliacao.js";
import exercicioRoutes from "./routes/exercicio.js";
import execucaoRoutes from "./routes/execucao.js";
import generoRoutes from "./routes/genero.js";
import grupoMuscularRoutes from "./routes/grupoMuscular.js";
import objetivoRoutes from "./routes/objetivo.js";
import personalRoutes from "./routes/personal.js";
import treinoExercicioRoutes from "./routes/treinoExercicio.js";
import treinoRoutes from "./routes/treino.js";
import uploadRoutes from "./routes/upload.js";
import { tratarErroUpload } from "./middlewares/uploadImagem.js";
import { ensureSchemaCompatibility } from "./utils/schemaSync.js";
import { seedConteudoPadrao } from "./utils/seedConteudoPadrao.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "../frontend");
const frontendPagesDir = path.join(frontendDir, "pages");
const frontendAssetsDir = path.join(frontendDir, "assets");
const frontendJsDir = path.join(frontendDir, "js");

app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const allowed =
            /^http:\/\/localhost:\d+$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

        if (allowed) {
            return callback(null, true);
        }

        return callback(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || "fitontrack-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false
    }
}));

app.use("/pages", express.static(frontendPagesDir));
app.use("/assets", express.static(frontendAssetsDir));
app.use("/js", express.static(frontendJsDir));
app.use(express.static(frontendDir));

app.use("/api", alunoRoutes);
app.use("/api", personalRoutes);
app.use("/api", exercicioRoutes);
app.use("/api", treinoRoutes);
app.use("/api", avaliacaoRoutes);
app.use("/api", treinoExercicioRoutes);
app.use("/api", execucaoRoutes);
app.use("/api", objetivoRoutes);
app.use("/api", generoRoutes);
app.use("/api", grupoMuscularRoutes);
app.use("/api", uploadRoutes);
app.use(tratarErroUpload);

app.get("/api/auth/session", (req, res) => {
    if (!req.session?.user) {
        return res.status(401).json({ erro: "Nao autenticado" });
    }

    res.json({ user: req.session.user });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({ erro: "Nao foi possivel encerrar a sessao." });
        }

        res.clearCookie("connect.sid");
        res.json({ mensagem: "Sessao encerrada com sucesso" });
    });
});

app.get("/views/cadastro/inicial.html", (req, res) => {
    res.redirect(301, "/");
});

app.get(/^\/views\/(.+)$/, (req, res) => {
    res.redirect(301, `/pages/${req.params[0]}`);
});

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendDir, "index.html"));
});

sequelize.sync({ alter: false })
    .then(() => ensureSchemaCompatibility())
    .then(() => seedConteudoPadrao())
    .then(() => {
        console.log("Sincronizacao do banco concluida.");
        app.listen(port, () => {
            console.log(`Servidor rodando na porta ${port}`);
        });
    })
    .catch((err) => {
        console.error("Erro ao sincronizar o banco:", err);
        process.exit(1);
    });
