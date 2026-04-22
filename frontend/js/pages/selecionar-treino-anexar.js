import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";
import { setStatus, valueOrFallback, attachBackNavigation, attachRouteTargets } from "../ui.js";

const grid = document.querySelector("#treinos-grid");
const statusElement = document.querySelector("#treinos-status");
const role = document.body.dataset.role;

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
            redirectTo(`/pages/personal/anexarTreinoAluno.html?treino=${treinoId}`);
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
        const treinosFiltrados = treinos.filter((treino) => String(treino.personal_id) === String(session.user.id));
        
        renderTreinos(treinosFiltrados);
        setStatus(statusElement, treinosFiltrados.length ? "" : "Nenhum treino encontrado.", "info");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os treinos.", "error");
    }
}

attachBackNavigation();
attachRouteTargets();
carregarTreinos();
