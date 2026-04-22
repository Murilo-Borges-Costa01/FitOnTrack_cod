import { Avaliacao } from "../models/avaliacaoM.js";
import { Personal } from "../models/personalM.js";
import { Aluno } from "../models/alunoM.js";

// Listar todas as avaliações (admin)
export async function listar(req, res) {
    res.json(await Avaliacao.findAll());
}

// Criar nova avaliação (aluno avaliando personal)
export async function criar(req, res) {
    try {
        const { personal_id, estrelas, comentario, anonimo = true } = req.body;
        const aluno_id = req.session?.user?.id ?? req.body.aluno_id ?? req.body.id;
        const tipoUsuario = req.session?.user?.tipo;
        const estrelasNumero = Number(estrelas);

        console.log(aluno_id)

        if (!aluno_id) {
            return res.status(401).json({ erro: "Não autenticado" });
        }

        if (tipoUsuario && tipoUsuario !== "aluno") {
            return res.status(403).json({ erro: "Apenas alunos podem avaliar personal" });
        }

        if (!personal_id || !Number.isFinite(estrelasNumero) || estrelasNumero < 1 || estrelasNumero > 5) {
            return res.status(400).json({ erro: "Dados inválidos. Estrelas devem ser de 1 a 5." });
        }

        // Verifica se aluno já avaliou este personal
        const avaliacaoExistente = await Avaliacao.findOne({
            where: { aluno_id, personal_id }
        });

        if (avaliacaoExistente) {
            return res.status(400).json({ erro: "Você já avaliou este personal" });
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

        res.status(201).json({ mensagem: "Avaliação criada com sucesso", avaliacao });
    } catch (error) {
        console.error("Erro ao criar avaliação:", error);
        res.status(500).json({ erro: "Erro ao criar avaliação" });
    }
}

// Listar avaliações de um personal (sem mostrar dados do aluno se for anônimo)
export async function listarAvaliacoesPessoal(req, res) {
    try {
        const { personal_id } = req.params;
        const userId = req.session?.user?.id;
        const userTipo = req.session?.user?.tipo;

        const avaliacoes = await Avaliacao.findAll({
            where: { personal_id }
        });

        // Se quem está vendo é o pessoal, mostra tudo
        // Se é outro aluno, mostra apenas comentários (sem dados pessoais do avaliador)
        const avaliacoesFormatadas = avaliacoes.map(av => {
            const avObj = av.toJSON();
            
            // Se é anônimo, remove dados do aluno
            if (av.anonimo) {
                delete avObj.aluno_id;
                delete avObj.avaliador_id;
            }
            
            return avObj;
        });

        res.json(avaliacoesFormatadas);
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);
        res.status(500).json({ erro: "Erro ao listar avaliações" });
    }
}

// Obter média de estrelas de um personal
export async function obterMediaEstrelas(req, res) {
    try {
        const { personal_id } = req.params;

        const avaliacoes = await Avaliacao.findAll({
            where: { personal_id }
        });

        if (avaliacoes.length === 0) {
            return res.json({ media: 0, total: 0 });
        }

        const soma = avaliacoes.reduce((acc, av) => acc + av.estrelas, 0);
        const media = (soma / avaliacoes.length).toFixed(2);

        res.json({ media: parseFloat(media), total: avaliacoes.length });
    } catch (error) {
        console.error("Erro ao calcular média:", error);
        res.status(500).json({ erro: "Erro ao calcular média" });
    }
}

// Obter avaliação do aluno para um personal (se existir)
export async function obterMinhaAvaliacao(req, res) {
    try {
        const aluno_id = req.session?.user?.id;
        const { personal_id } = req.params;

        if (!aluno_id) {
            return res.status(401).json({ erro: "Não autenticado" });
        }

        const avaliacao = await Avaliacao.findOne({
            where: { aluno_id, personal_id }
        });

        if (!avaliacao) {
            return res.json(null);
        }

        res.json(avaliacao);
    } catch (error) {
        console.error("Erro ao obter avaliação:", error);
        res.status(500).json({ erro: "Erro ao obter avaliação" });
    }
}

// Deletar avaliação (aluno pode deletar sua própria)
export async function deletar(req, res) {
    try {
        const { id } = req.params;
        const userId = req.session?.user?.id;

        const avaliacao = await Avaliacao.findByPk(id);

        if (!avaliacao) {
            return res.status(404).json({ erro: "Avaliação não encontrada" });
        }

        if (avaliacao.aluno_id !== userId) {
            return res.status(403).json({ erro: "Você não pode deletar esta avaliação" });
        }

        await avaliacao.destroy();
        res.json({ mensagem: "Avaliação deletada com sucesso" });
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        res.status(500).json({ erro: "Erro ao deletar avaliação" });
    }
}