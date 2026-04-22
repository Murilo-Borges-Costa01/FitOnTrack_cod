import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";
import { setStatus, valueOrFallback, attachBackNavigation, attachRouteTargets, resolveImagePath } from "../ui.js";

const perfilContainer = document.querySelector("#perfil-personal-container");
const statusElement = document.querySelector("#perfil-personal-status");

function renderPerfilPersonal(personal) {
    perfilContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: var(--spacing-2xl);">
            <img
                src="${resolveImagePath(personal.imagem, "assets/images/Aparecer.png")}"
                alt="Foto do Personal"
                style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; margin-bottom: var(--spacing-lg);"
            />
            <h2>${valueOrFallback(personal.nome)}</h2>
            <p style="color: var(--color-text-secondary); margin: var(--spacing-md) 0;">
                ${valueOrFallback(personal.especialidade, "Especialidade não informada")}
            </p>
        </div>

        <div class="form-group">
            <label class="form-label">Email</label>
            <div style="padding: var(--spacing-md); background-color: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <p>${valueOrFallback(personal.email)}</p>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">CREF</label>
            <div style="padding: var(--spacing-md); background-color: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <p>${valueOrFallback(personal.cref)}</p>
            </div>
        </div>

        ${personal.certificados ? `
        <div class="form-group">
            <label class="form-label">Certificados</label>
            <div style="padding: var(--spacing-md); background-color: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-md);">
                <p>${personal.certificados}</p>
            </div>
        </div>
        ` : ''}

        <div class="text-center mt-xl mb-xl">
            <button id="avaliar-btn" class="btn btn-success btn-lg" type="button" style="background-color: #DAA520; margin-bottom: 10px;">⭐ Avaliar Personal</button>
        </div>

        <div class="text-center mt-xl mb-xl">
            <button id="desvinc-btn" class="btn btn-danger btn-lg" type="button">Desvincular do Personal</button>
        </div>
    `;

    const avaliarBtn = document.querySelector("#avaliar-btn");
    if (avaliarBtn) {
        avaliarBtn.addEventListener("click", () => {
            window.location.href = "/frontend/pages/aluno/avaliar-personal.html";
        });
    }

    const desvincBtn = document.querySelector("#desvinc-btn");
    if (desvincBtn) {
        desvincBtn.addEventListener("click", () => desvinculaPersonal(personal.id));
    }
}

async function desvinculaPersonal(personalId) {
    const session = getSession();
    if (!session || session.role !== "aluno" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    const confirmacao = confirm("Tem certeza que deseja desvincular deste personal? Suas informações serão mantidas.");
    if (!confirmacao) return;

    setStatus(statusElement, "Desvinculando...", "loading");

    try {
        await api.delete(`/alunos/${session.user.id}/desvincular-personal`);
        setStatus(statusElement, "Desvinculado com sucesso! ✅", "success");
        
        setTimeout(() => {
            // Usar window.location para garantir reload completo
            window.location.href = "/frontend/pages/aluno/meu-personal.html";
        }, 1000);
    } catch (error) {
        setStatus(statusElement, error.message || "Erro ao desvincular", "error");
    }
}

async function carregarPersonal() {
    const session = getSession();

    if (!session || session.role !== "aluno" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    setStatus(statusElement, "Carregando informações do personal...", "loading");

    try {
        // Buscar dados do aluno para pegar personal_id
        const aluno = await api.get(`/alunos/${session.user.id}`);

        if (!aluno.personal_id) {
            setStatus(statusElement, "Você não possui um personal vinculado no momento.", "info");
            perfilContainer.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-2xl);">
                    <p>Você não possui um personal vinculado.</p>
                    <p style="color: var(--color-text-secondary); font-size: 0.9em; margin-top: var(--spacing-md);">
                        Procure por um personal disponível e solicite para que ele o vincule.
                    </p>
                </div>
            `;
            return;
        }

        // Buscar dados do personal
        const personal = await api.get(`/personais/${aluno.personal_id}`);

        renderPerfilPersonal(personal);
        setStatus(statusElement, "", "");
    } catch (error) {
        setStatus(statusElement, error.message || "Não foi possível carregar as informações do personal.", "error");
    }
}

attachBackNavigation();
attachRouteTargets();
carregarPersonal();
