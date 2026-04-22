import { sequelize } from "../config/banco.js";
import { Aluno } from "../models/alunoM.js";
import { Exercicio } from "../models/exercicioM.js";
import { Personal } from "../models/personalM.js";
import { Treino } from "../models/treinoM.js";
import { TreinoExercicio } from "../models/treinoExercicioM.js";
import { getUploadedImagePath } from "../middlewares/uploadImagem.js";
import { normalizeRequiredString, parseJsonArray, parseNonNegativeNumber, parseRequiredNumber } from "../utils/requestParsers.js";

function buildTreinoPayload(body, file, { isUpdate = false } = {}) {
    const payload = {};

    if (!isUpdate || body.nome !== undefined) {
        payload.nome = normalizeRequiredString(body.nome);
    }

    if (!isUpdate || body.aluno_id !== undefined) {
        payload.aluno_id = parseRequiredNumber(body.aluno_id, "Aluno");
    }

    if (!isUpdate || body.personal_id !== undefined) {
        payload.personal_id = parseRequiredNumber(body.personal_id, "Personal");
    }

    const imagePath = getUploadedImagePath(file);
    if (imagePath) {
        payload.imagem = imagePath;
    }

    return payload;
}

function normalizeExercicios(rawExercicios) {
    return parseJsonArray(rawExercicios).map((item) => ({
        exercicio_id: parseRequiredNumber(item.exercicio_id, "Exercicio"),
        series: parseRequiredNumber(item.series, "Series"),
        repeticoes: parseRequiredNumber(item.repeticoes, "Repeticoes"),
        carga: parseNonNegativeNumber(item.carga ?? 0, "Carga"),
        descanso: parseRequiredNumber(item.descanso, "Descanso")
    }));
}

export async function listar(req, res) {
    const treinos = await Treino.findAll({
        include: [
            {
                model: Aluno,
                attributes: ["id", "nome", "imagem"]
            },
            {
                model: Personal,
                attributes: ["id", "nome", "imagem"]
            }
        ],
        order: [["id", "DESC"]]
    });

    res.json(treinos);
}

export async function buscarPorId(req, res) {
    const treino = await Treino.findByPk(req.params.id, {
        include: [
            {
                model: Aluno,
                attributes: ["id", "nome", "email", "imagem"]
            },
            {
                model: Personal,
                attributes: ["id", "nome", "email", "imagem", "cref"]
            },
            {
                model: Exercicio,
                attributes: ["id", "nome", "descricao", "imagem", "grupo_muscular_id"],
                through: {
                    attributes: ["id", "series", "repeticoes", "carga", "descanso"]
                }
            }
        ]
    });

    if (!treino) {
        return res.status(404).json({ erro: "Nao encontrado" });
    }

    res.json(treino);
}

export async function criar(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const payload = buildTreinoPayload(req.body, req.file);
        const exercicios = normalizeExercicios(req.body.exercicios);

        if (!payload.nome || !payload.aluno_id || !payload.personal_id) {
            await transaction.rollback();
            return res.status(400).json({ erro: "Informe nome, aluno e personal." });
        }

        if (!exercicios.length) {
            await transaction.rollback();
            return res.status(400).json({ erro: "Selecione pelo menos um exercicio." });
        }

        const treino = await Treino.create(payload, { transaction });

        await TreinoExercicio.bulkCreate(
            exercicios.map((item) => ({ ...item, treino_id: treino.id })),
            { transaction }
        );

        await transaction.commit();
        res.status(201).json(treino);
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ erro: error.message || "Nao foi possivel criar o treino." });
    }
}

export async function atualizar(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const treino = await Treino.findByPk(req.params.id, { transaction });

        if (!treino) {
            await transaction.rollback();
            return res.status(404).json({ erro: "Nao encontrado" });
        }

        const dados = buildTreinoPayload(req.body, req.file, { isUpdate: true });
        const exercicios = normalizeExercicios(req.body.exercicios);

        const mergedNome = dados.nome ?? treino.nome;
        const mergedAlunoId = dados.aluno_id ?? treino.aluno_id;
        const mergedPersonalId = dados.personal_id ?? treino.personal_id;

        if (!mergedNome || !mergedAlunoId || !mergedPersonalId) {
            await transaction.rollback();
            return res.status(400).json({ erro: "Informe nome, aluno e personal." });
        }

        if (!exercicios.length) {
            await transaction.rollback();
            return res.status(400).json({ erro: "Selecione pelo menos um exercicio." });
        }

        await treino.update(dados, { transaction });
        await TreinoExercicio.destroy({ where: { treino_id: treino.id }, transaction });
        await TreinoExercicio.bulkCreate(
            exercicios.map((item) => ({ ...item, treino_id: treino.id })),
            { transaction }
        );

        await transaction.commit();
        res.json({ mensagem: "Treino atualizado", treino });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ erro: error.message || "Nao foi possivel atualizar o treino." });
    }
}

export async function deletar(req, res) {
    try {
        const linhas = await Treino.destroy({ where: { id: req.params.id } });

        if (!linhas) {
            return res.status(404).json({ erro: "Nao encontrado" });
        }

        res.json({ mensagem: "Treino deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: error.message || "Nao foi possivel deletar o treino." });
    }
}

/**
 * PATCH /api/treinos/:id/anexar-aluno
 * Anexa um treino a um aluno
 */
export async function anexarAAluno(req, res) {
    try {
        const treino = await Treino.findByPk(req.params.id);

        if (!treino) {
            return res.status(404).json({ erro: "Treino nao encontrado" });
        }

        const { aluno_id } = req.body;

        if (!aluno_id) {
            return res.status(400).json({ erro: "ID do aluno é obrigatorio" });
        }

        const aluno = await Aluno.findByPk(aluno_id);
        if (!aluno) {
            return res.status(404).json({ erro: "Aluno nao encontrado" });
        }

        await treino.update({ aluno_id: parseInt(aluno_id) });

        res.json({ mensagem: "Treino anexado ao aluno com sucesso", treino });
    } catch (error) {
        res.status(400).json({ erro: error.message || "Nao foi possivel anexar o treino." });
    }
}
