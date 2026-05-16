import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";
import { setStatus } from "../ui.js";
import { showAlert, showToast } from "../alerts.js";

// avaliar-personal.js - Logic for student rating their personal trainer

const statusElement = document.getElementById('status-message');
let estrelasSelect = 0;

function resolvePersonalImageUrl(personal) {
    const apiBase = (api.baseUrl() || 'http://localhost:3000').replace(/\/+$/, '');
    const fallback = `${apiBase}/assets/images/Aparecer.png`;
    const rawImage = (personal?.foto_perfil || personal?.imagem || '').trim();

    if (!rawImage) {
        return fallback;
    }

    if (/^(https?:|data:|blob:)/i.test(rawImage)) {
        return rawImage;
    }

    if (rawImage.startsWith('/assets/uploads/')) {
        return `${apiBase}${rawImage}`;
    }

    if (rawImage.startsWith('assets/uploads/')) {
        return `${apiBase}/${rawImage}`;
    }

    if (rawImage.startsWith('/frontend/assets/')) {
        return rawImage;
    }

    const fileName = rawImage
        .replace(/^\/+/, '')
        .replace(/^assets\/uploads\/personais\//, '')
        .replace(/^uploads\/personais\//, '');

    return `${apiBase}/assets/uploads/personais/${fileName}`;
}

// Helper para definir status com timeout
function setStatusMessage(element, message, type) {
    element.textContent = message;
    element.className = `status-message ${type}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const session = getSession();
    
    if (!session || !session.user) {
        setStatusMessage(statusElement, "Você não está autenticado", "error");
        showAlert({
            icon: "error",
            title: "Você não está autenticado",
            text: "Faça login novamente para avaliar o personal.",
        });
        setTimeout(() => {
            redirectTo('pages/cadastro/inicial.html');
        }, 2000);
        return;
    }

    // Carrega informações do personal
    await carregarPessoalInfo();
    setupStarRating();
    setupForm();
});

async function carregarPessoalInfo() {
    try {
        const session = getSession();
        const aluno = await api.get(`/alunos/${session.user.id}`);

        if (!aluno.personal_id) {
            setStatusMessage(statusElement, "Você não tem um personal vinculado", "error");
            showAlert({
                icon: "warning",
                title: "Nenhum personal vinculado",
                text: "Você precisa estar vinculado a um personal para enviar uma avaliação.",
            });
            setTimeout(() => window.history.back(), 2000);
            return;
        }

        const personal = await api.get(`/personais/${aluno.personal_id}`);

        const pessoalInfoDiv = document.getElementById('pessoal-info');
        
        const fotoUrl = resolvePersonalImageUrl(personal);

        pessoalInfoDiv.innerHTML = `
            <img src="${fotoUrl}" 
                 alt="${personal.nome}" 
                 onerror="this.src='${resolvePersonalImageUrl({})}'"
                 style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; background: #333;">
            <div>
                <div class="pessoal-nome">${personal.nome || 'Personal'}</div>
                <div class="pessoal-cref">CREF: ${personal.cref || 'Não informado'}</div>
            </div>
        `;

        // Carrega avaliação existente se houver
        try {
            const minhaAvaliacao = await api.get(`/personais/${aluno.personal_id}/minha-avaliacao`);
            if (minhaAvaliacao) {
                setStatusMessage(statusElement, "ℹ️ Você já avaliou este personal. Atualize seus dados e clique em Enviar novamente.", "info");
                showToast("Você já avaliou este personal.", "info", 3200);
                document.getElementById('input-estrelas').value = minhaAvaliacao.estrelas;
                document.getElementById('comentario').value = minhaAvaliacao.comentario || '';
                atualizarExibicaoEstrelas(minhaAvaliacao.estrelas);
            }
        } catch (error) {
            // Sem avaliação prévia, é normal
            console.log('Sem avaliação prévia');
        }
    } catch (error) {
        console.error('Erro ao carregar info do personal:', error);
        setStatusMessage(statusElement, "Erro ao carregar informações do personal", "error");
    }
}

function setupStarRating() {
    const starsContainer = document.getElementById('stars-container');
    const stars = starsContainer.querySelectorAll('.star');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            estrelasSelect = parseInt(star.dataset.value);
            document.getElementById('input-estrelas').value = estrelasSelect;
            atualizarExibicaoEstrelas(estrelasSelect);
        });

        star.addEventListener('mouseenter', () => {
            const hoverValue = parseInt(star.dataset.value);
            stars.forEach((s, index) => {
                if (index < hoverValue) {
                    s.style.opacity = '1';
                } else {
                    s.style.opacity = '0.5';
                }
            });
        });
    });

    starsContainer.addEventListener('mouseleave', () => {
        atualizarExibicaoEstrelas(estrelasSelect);
    });
}

function atualizarExibicaoEstrelas(valor) {
    const starsContainer = document.getElementById('stars-container');
    const stars = starsContainer.querySelectorAll('.star');

    stars.forEach((star, index) => {
        if (index < valor) {
            star.classList.add('active');
            star.style.opacity = '1';
        } else {
            star.classList.remove('active');
            star.style.opacity = '0.5';
        }
    });

    const msg = document.getElementById('estrelas-selecionadas');
    if (valor > 0) {
        msg.textContent = `${valor} ${valor === 1 ? 'estrela' : 'estrelas'} selecionadas`;
    } else {
        msg.textContent = 'Selecione uma classificação';
    }
}

function setupForm() {
    document.getElementById('form-avaliacao').addEventListener('submit', async (e) => {
        e.preventDefault();

        const estrelas = parseInt(document.getElementById('input-estrelas').value);
        const comentario = document.getElementById('comentario').value;

        if (!estrelas) {
            setStatusMessage(statusElement, "Por favor, selecione uma classificação", "error");
            showAlert({
                icon: "warning",
                title: "Classificação obrigatória",
                text: "Selecione uma quantidade de estrelas antes de enviar a avaliação.",
            });
            return;
        }

        await enviarAvaliacao(estrelas, comentario);
    });
}

async function enviarAvaliacao(estrelas, comentario) {
    try {
        const session = getSession();
        const aluno = await api.get(`/alunos/${session.user.id}`);

        setStatusMessage(statusElement, "Enviando avaliação...", "loading");

        const payload = {
            aluno_id: session.user.id,
            personal_id: aluno.personal_id,
            estrelas,
            comentario: comentario || null,
            anonimo: true
        };

      

        console.log('Enviando payload:', payload);

        const resposta = await api.post('/avaliacoes', payload);

        console.log('Resposta:', resposta);

        setStatusMessage(statusElement, "Avaliação enviada com sucesso! Obrigado por avaliar.", "success");
        await showAlert({
            icon: "success",
            title: "Avaliação enviada!",
            text: "Obrigado por avaliar seu personal.",
            timer: 1800,
            showConfirmButton: false,
        });

        // Limpa form após sucesso
        document.getElementById('form-avaliacao').reset();
        atualizarExibicaoEstrelas(0);
        document.getElementById('estrelas-selecionadas').textContent = 'Selecione uma classificação';

        redirectTo("pages/aluno/meu-personal.html");
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        setStatusMessage(statusElement, error.message || "Erro ao enviar avaliação", "error");
        showAlert({
            icon: "error",
            title: "Erro ao enviar avaliação",
            text: error.message || "Não foi possível enviar a avaliação.",
        });
    }
}
