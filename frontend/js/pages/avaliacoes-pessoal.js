import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";

// avaliacoes-pessoal.js - Logic for personal trainer viewing their ratings

let avaliacoes = [];

document.addEventListener('DOMContentLoaded', async () => {
    const session = getSession();

    if (!session || !session.user || session.role !== 'personal') {
        redirectTo('pages/cadastro/inicial.html');
        return;
    }

    await carregarAvaliações();
    setupFiltroOrdenacao();
});

async function carregarAvaliações() {
    try {
        const session = getSession();

        console.log('Carregando avaliações para:', session.user.id);

        // Carrega média de estrelas
        const mediaData = await api.get(`/personais/${session.user.id}/media-estrelas`);
        console.log('Média:', mediaData);
        exibirMediaGeral(mediaData.media, mediaData.total);

        // Carrega avaliações
        avaliacoes = await api.get(`/personais/${session.user.id}/avaliacoes`);
        console.log('Avaliações carregadas:', avaliacoes);

        // Ordena por data decrescente por padrão
        avaliacoes.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));

        exibirAvaliacoes(avaliacoes);
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        document.getElementById('avaliacoes-lista').innerHTML =
            '<div class="sem-avaliacoes">Erro ao carregar avaliações. Tente recarregar a página.</div>';
    }
}

function exibirMediaGeral(media, total) {
    const mediaValor = document.getElementById('media-valor');
    const starsDisplay = document.getElementById('stars-display');
    const mediaInfo = document.getElementById('media-info');

    const mediaPrecisa = parseFloat(media);
    mediaValor.textContent = mediaPrecisa.toFixed(1);

    // Exibe estrelas preenchidas e vazias
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(mediaPrecisa)) {
            starsHtml += '⭐';
        } else {
            starsHtml += '☆';
        }
    }
    starsDisplay.textContent = starsHtml;

    mediaInfo.innerHTML = `<strong>${total}</strong> ${total === 1 ? 'avaliação' : 'avaliações'}`;
}

function exibirAvaliacoes(avaliacoes) {
    const lista = document.getElementById('avaliacoes-lista');

    if (avaliacoes.length === 0) {
        lista.innerHTML = '<div class="sem-avaliacoes">Nenhuma avaliação ainda. Seus alunos poderão avaliar em breve!</div>';
        return;
    }

    lista.innerHTML = avaliacoes.map(av => criarCardAvaliacao(av)).join('');
}

function criarCardAvaliacao(avaliacao) {
    const data = new Date(avaliacao.data_criacao);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= avaliacao.estrelas) {
            starsHtml += '⭐';
        } else {
            starsHtml += '☆';
        }
    }

    const comentarioHtml = avaliacao.comentario
        ? `<div class="avaliacao-comentario">"${avaliacao.comentario}"</div>`
        : '<div class="avaliacao-comentario vazio">(sem comentário)</div>';

    const anonímoStatus = avaliacao.anonimo
        ? '<div class="avaliacao-anonima">🔒 Avaliação Anônima</div>'
        : '';

    return `
        <div class="avaliacao-card">
            <div class="avaliacao-header">
                <div>
                    <div class="avaliacao-estrelas">${starsHtml}</div>
                    ${anonímoStatus}
                </div>
                <div>
                    <div class="avaliacao-data">${dataFormatada} às ${horaFormatada}</div>
                </div>
            </div>
            ${comentarioHtml}
        </div>
    `;
}

function setupFiltroOrdenacao() {
    document.getElementById('filtro-ordenacao').addEventListener('change', (e) => {
        const opcao = e.target.value;
        let avaliacoesOrdenadas = [...avaliacoes];

        switch (opcao) {
            case 'recente':
                avaliacoesOrdenadas.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
                break;
            case 'antigas':
                avaliacoesOrdenadas.sort((a, b) => new Date(a.data_criacao) - new Date(b.data_criacao));
                break;
            case 'maior-estrelas':
                avaliacoesOrdenadas.sort((a, b) => b.estrelas - a.estrelas);
                break;
            case 'menor-estrelas':
                avaliacoesOrdenadas.sort((a, b) => a.estrelas - b.estrelas);
                break;
        }

        exibirAvaliacoes(avaliacoesOrdenadas);
    });
}
