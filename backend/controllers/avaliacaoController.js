import { Avaliacao } from "../models/avaliacaoM.js";

export async function listar(req, res) {
    res.json(await Avaliacao.findAll());
}

export async function criar(req, res) {
    try {
        const { personal_id, estrelas, comentario, anonimo = true } = req.body;
        const aluno_id = req.session?.user?.id ?? req.body.aluno_id ?? req.body.id;
        const tipoUsuario = req.session?.user?.tipo;
        const estrelasNumero = Number(estrelas);

        if (!aluno_id) {
            return res.status(401).json({ erro: "Nao autenticado" });
        }

        if (tipoUsuario && tipoUsuario !== "aluno") {
            return res.status(403).json({ erro: "Apenas alunos podem avaliar personal" });
        }

        if (!personal_id || !Number.isFinite(estrelasNumero) || estrelasNumero < 1 || estrelasNumero > 5) {
            return res.status(400).json({ erro: "Dados invalidos. Estrelas devem ser de 1 a 5." });
        }

        const avaliacaoExistente = await Avaliacao.findOne({
            where: { aluno_id, personal_id }
        });

        if (avaliacaoExistente) {
            await avaliacaoExistente.update({
                estrelas: estrelasNumero,
                comentario,
                anonimo,
                data_criacao: new Date()
            });

            return res.json({
                mensagem: "Avaliacao atualizada com sucesso",
                avaliacao: avaliacaoExistente
            });
        }

        const avaliacao = await Avaliacao.create({
            aluno_id,
            personal_id,
            avaliador_tipo: "aluno",
            avaliador_id: aluno_id,
            estrelas: estrelasNumero,
            comentario,
            anonimo
        });

        res.status(201).json({ mensagem: "Avaliacao criada com sucesso", avaliacao });
    } catch (error) {
        console.error("Erro ao salvar avaliacao:", error);
        res.status(500).json({ erro: "Erro ao salvar avaliacao" });
    }
}

export async function listarAvaliacoesPessoal(req, res) {
    try {
        const { personal_id } = req.params;

        const avaliacoes = await Avaliacao.findAll({
            where: { personal_id }
        });

        const avaliacoesFormatadas = avaliacoes.map((avaliacao) => {
            const avaliacaoJson = avaliacao.toJSON();

            if (avaliacao.anonimo) {
                delete avaliacaoJson.aluno_id;
                delete avaliacaoJson.avaliador_id;
            }

            return avaliacaoJson;
        });

        res.json(avaliacoesFormatadas);
    } catch (error) {
        console.error("Erro ao listar avaliacoes:", error);
        res.status(500).json({ erro: "Erro ao listar avaliacoes" });
    }
}

export async function obterMediaEstrelas(req, res) {
    try {
        const { personal_id } = req.params;

        const avaliacoes = await Avaliacao.findAll({
            where: { personal_id }
        });

        if (avaliacoes.length === 0) {
            return res.json({ media: 0, total: 0 });
        }

        const soma = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.estrelas, 0);
        const media = (soma / avaliacoes.length).toFixed(2);

        res.json({ media: parseFloat(media), total: avaliacoes.length });
    } catch (error) {
        console.error("Erro ao calcular media:", error);
        res.status(500).json({ erro: "Erro ao calcular media" });
    }
}

export async function obterMinhaAvaliacao(req, res) {
    try {
        const aluno_id = req.session?.user?.id;
        const { personal_id } = req.params;

        if (!aluno_id) {
            return res.status(401).json({ erro: "Nao autenticado" });
        }

        const avaliacao = await Avaliacao.findOne({
            where: { aluno_id, personal_id }
        });

        if (!avaliacao) {
            return res.json(null);
        }

        res.json(avaliacao);
    } catch (error) {
        console.error("Erro ao obter avaliacao:", error);
        res.status(500).json({ erro: "Erro ao obter avaliacao" });
    }
}

export async function deletar(req, res) {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.id;

        const avaliacao = await Avaliacao.findByPk(id);

        if (!avaliacao) {
            return res.status(404).json({ erro: "Avaliacao nao encontrada" });
        }

        if (avaliacao.aluno_id !== userId) {
            return res.status(403).json({ erro: "Voce nao pode deletar esta avaliacao" });
        }

        await avaliacao.destroy();
        res.json({ mensagem: "Avaliacao deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar avaliacao:", error);
        res.status(500).json({ erro: "Erro ao deletar avaliacao" });
    }
}
