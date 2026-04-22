import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";
import { attachBackNavigation, attachRouteTargets, resolveImagePath, setImagePreview, setStatus, valueOrFallback } from "../ui.js";

const titleElement = document.querySelector("#treino-detalhe-titulo");
const statusElement = document.querySelector("#treino-detalhe-status");
const gridElement = document.querySelector("#treino-detalhe-grid");
const treinoImageElement = document.querySelector("#treino-detalhe-imagem");
const editButton = document.querySelector("#treino-editar-button");
const deletarButton = document.querySelector("#treino-deletar-button");
const role = document.body.dataset.role;

function getTreinoId() {
    return new URL(window.location.href).searchParams.get("treino");
}

function renderExercicios(exercicios) {
    if (!gridElement) return;

    gridElement.innerHTML = exercicios.map((exercicio) => {
        const configuracao = exercicio.treino_exercicios || {};

        return `
            <div class="card">
                <div class="text-center mb-md">
                    <img
                        src="${resolveImagePath(exercicio.imagem, "assets/images/visualizar.png")}"
                        alt="${valueOrFallback(exercicio.nome, "Exercicio")}"
                        height="100"
                        width="100"
                        style="border-radius: var(--radius-md); object-fit: cover;"
                    />
                </div>
                <div class="text-center">
                    <h3 style="margin-bottom: var(--spacing-sm);">${valueOrFallback(exercicio.nome, "Exercicio")}</h3>
                    <p class="text-left">
                        <strong>Series:</strong> ${valueOrFallback(configuracao.series)}<br/>
                        <strong>Repeticoes:</strong> ${valueOrFallback(configuracao.repeticoes)}<br/>
                        <strong>Carga:</strong> ${valueOrFallback(configuracao.carga, "0")}<br/>
                        <strong>Descanso:</strong> ${valueOrFallback(configuracao.descanso)}s
                    </p>
                    <p class="text-secondary">${valueOrFallback(exercicio.descricao, "Sem descricao cadastrada.")}</p>
                </div>
            </div>
        `;
    }).join("");
}

async function deletarTreino(treinoId) {
    const confirmacao = confirm("Tem certeza que deseja deletar este treino? Essa ação é irreversível.");
    if (!confirmacao) return;

    setStatus(statusElement, "Deletando treino...", "loading");

    try {
        await api.delete(`/treinos/${treinoId}`);
        setStatus(statusElement, "Treino deletado com sucesso! Redirecionando...", "success");
        setTimeout(() => {
            // Usar window.location para garantir reload completo
            window.location.href = "/frontend/pages/personal/TreinosdoPersonal.html";
        }, 1000);
    } catch (error) {
        setStatus(
            statusElement,
            error.message || "Nao foi possivel deletar o treino.",
            "error"
        );
    }
}

async function carregarTreino() {
    const session = getSession();
    const treinoId = getTreinoId();

    if (!session || session.role !== role) {
        redirectTo("/");
        return;
    }

    if (!treinoId) {
        setStatus(statusElement, "Nenhum treino foi informado.", "error");
        return;
    }

    setStatus(statusElement, "Carregando treino...", "loading");

    try {
        const treino = await api.get(`/treinos/${treinoId}`);

        const pertenceAoUsuario = role === "personal"
            ? String(treino.personal_id) === String(session.user.id)
            : String(treino.aluno_id) === String(session.user.id);

        if (!pertenceAoUsuario) {
            redirectTo(role === "personal" ? "/pages/personal/TreinosdoPersonal.html" : "/pages/aluno/treinos_aluno.html");
            return;
        }

        if (titleElement) {
            titleElement.textContent = valueOrFallback(treino.nome, "Treino");
        }

        if (treinoImageElement) {
            setImagePreview(treinoImageElement, treino.imagem, "assets/images/TREINOS.png");
        }

        if (editButton) {
            if (role === "personal") {
                editButton.classList.remove("d-none");
                editButton.addEventListener("click", () => {
                    redirectTo(`/pages/personal/criarTreinos.html?treino=${treino.id}`);
                });
            } else {
                editButton.classList.add("d-none");
            }
        }

        if (deletarButton) {
            if (role === "personal") {
                deletarButton.classList.remove("d-none");
                deletarButton.addEventListener("click", () => {
                    deletarTreino(treino.id);
                });
            } else {
                deletarButton.classList.add("d-none");
            }
        }

        renderExercicios(treino.exercicios || []);
        setStatus(statusElement, (treino.exercicios || []).length ? "" : "Nenhum exercicio cadastrado neste treino.", "info");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar o treino.", "error");
    }
}

attachBackNavigation();
attachRouteTargets();
carregarTreino();
