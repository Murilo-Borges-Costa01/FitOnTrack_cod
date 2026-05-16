import fs from "fs";
import path from "path";
import express from "express";

const router = express.Router();
const logsDir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "logs");

function ensureLogsDir() {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
}

router.post("/debug/log", express.json(), (req, res) => {
    try {
        ensureLogsDir();
        const payload = {
            timestamp: Date.now(),
            ip: req.ip,
            headers: req.headers,
            body: req.body
        };

        const out = JSON.stringify(payload) + "\n";
        fs.appendFileSync(path.join(logsDir, "debug_log.jsonl"), out, { encoding: "utf8" });

        res.json({ ok: true });
    } catch (err) {
        console.error("Erro ao gravar debug log:", err);
        res.status(500).json({ erro: "Nao foi possivel gravar o log de debug." });
    }
});

export default router;
