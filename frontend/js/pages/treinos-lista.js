import { api } from "../api.js";
import { consumeFlashMessage, getSession, redirectTo } from "../session.js";
import { setStatus, valueOrFallback, attachRouteTargets, showToast } from "../ui.js";

const grid = document.querySelector("#treinos-grid");
const statusElement = document.querySelector("#treinos-status");
const createButton = document.querySelector("#treino-add-button");
const anexarButton = document.querySelector("#anexar-treino-button");
const role = document.body.dataset.role;

function filtrarTreinos(treinos, session) {
    if (session.role === "personal") {
        return treinos.filter((treino) => String(treino.personal_id) === String(session.user.id));
    }

    return treinos.filter((treino) => String(treino.aluno_id) === String(session.user.id));
}

function renderTreinos(treinos) {
    grid.innerHTML = treinos.map((treino) => `
        <button class="btn btn-primary btn-lg btn-block" type="button" data-treino-id="${treino.id}">
            ${valueOrFallback(treino.nome, "Treino sem nome")}
            <img src="assets/images/visualizar.png" alt="" height="20" width="20" />
        </button>
    `).join("");

    document.querySelectorAll("[data-treino-id]").forEach((button) => {
        button.addEventListener("click", () => {
            const treinoId = button.dataset.treinoId;
            const destino = role === "personal"
                ? `/pages/personal/visuTreinos.html?treino=${treinoId}`
                : `/pages/aluno/exemploTreinoA.html?treino=${treinoId}`;

            redirectTo(destino);
        });
    });
}

async function carregarTreinos() {
    const session = getSession();

    if (!session || session.role !== role) {
        redirectTo("/");
        return;
    }

    setStatus(statusElement, "Carregando treinos...", "loading");

    try {
        const treinos = await api.get("/treinos");
        const treinosFiltrados = filtrarTreinos(treinos, session);
        renderTreinos(treinosFiltrados);
        setStatus(statusElement, treinosFiltrados.length ? "" : "Nenhum treino encontrado.", "info");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os treinos.", "error");
    }
}

if (createButton) {
    createButton.addEventListener("click", () => {
        redirectTo("/pages/personal/criarTreinos.html");
    });
}

if (anexarButton) {
    anexarButton.addEventListener("click", () => {
        redirectTo("/pages/personal/selecionarTreinoAnexar.html");
    });
}

attachRouteTargets();
carregarTreinos();

const flashMessage = consumeFlashMessage();
if (flashMessage?.message) {
    showToast(flashMessage.message, flashMessage.type || "success");
}
