import { api } from "../api.js";
import { getSession, redirectTo, saveSelectedAlunoId } from "../session.js";
import { createLookup, setStatus, valueOrFallback, attachBackNavigation, attachRouteTargets, resolveImagePath, setButtonLoading } from "../ui.js";

const grid = document.querySelector("#alunos-grid");
const statusElement = document.querySelector("#alunos-status");
const saveButton = document.querySelector("#aluno-escolher-submit");
const pageMode = document.body.dataset.pageMode || "listar";

function renderAlunos(alunos, objetivosPorId, isSelectionMode = false) {
    if (alunos.length === 0) {
        grid.innerHTML = `<p class="text-center" style="grid-column: 1/-1;">Nenhum aluno disponível</p>`;
        return;
    }

    grid.innerHTML = alunos.map((aluno) => `
        <button class="card aluno-card" type="button" data-aluno-id="${aluno.id}" ${isSelectionMode ? 'data-selectable="true"' : ''}>
            <div class="flex-center gap-md" style="flex-direction: column;">
                <img
                    src="${resolveImagePath(aluno.imagem, "/frontend/assets/images/Aparecer.png")}"
                    alt="Aluno"
                    height="120"
                    width="120"
                    style="border-radius: 50%; object-fit: cover;"
                />
                <div class="text-center">
                    <h3 class="mb-sm">${valueOrFallback(aluno.nome)}</h3>
                    <p class="mt-0">${valueOrFallback(objetivosPorId[aluno.objetivo_id])}</p>
                </div>
            </div>
        </button>
    `).join("");
}

function setupInteractions() {
    const cards = Array.from(document.querySelectorAll(".aluno-card"));
    let selectedAlunoId = null;

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const alunoId = card.dataset.alunoId;

            // Modo de seleção para vincular
            if (card.dataset.selectable === "true") {
                selectedAlunoId = alunoId;
                cards.forEach((item) => item.classList.remove("card-selected"));
                card.classList.add("card-selected");
                saveSelectedAlunoId(alunoId);
                setStatus(statusElement, "Aluno selecionado. Clique em Salvar para vincular.", "success");
                return;
            }

            // Modo de visualização dos alunos já vinculados
            saveSelectedAlunoId(alunoId);
            redirectTo(`/pages/personal/alunoDoPersonal.html?aluno=${alunoId}`);
        });
    });

    // Botão salvar (apenas em modo de seleção)
    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            if (!selectedAlunoId) {
                setStatus(statusElement, "Selecione um aluno antes de continuar.", "error");
                return;
            }

            await vincularAlunoAPersonal(selectedAlunoId);
        });
    }
}

async function vincularAlunoAPersonal(alunoId) {
    const session = getSession();
    if (!session || session.role !== "personal" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    setButtonLoading(saveButton, true, "Vinculando...");
    setStatus(statusElement, "Vinculando aluno ao seu perfil...", "loading");

    try {
        await api.post(`/personais/${session.user.id}/alunos/vincular`, {
            aluno_id: parseInt(alunoId)
        });

        setStatus(statusElement, "✅ Aluno vinculado com sucesso!", "success");
        
        // Redirecionar após 1.5 segundos
        setTimeout(() => {
            redirectTo("/pages/personal/meusAlunos.html");
        }, 1500);
    } catch (error) {
        setStatus(statusElement, error.message || "Erro ao vincular o aluno", "error");
        setButtonLoading(saveButton, false);
    }
}

async function carregarAlunos() {
    const session = getSession();

    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    setStatus(statusElement, "Carregando alunos...", "loading");

    try {
        let endpoint = "/alunos";
        
        // Modo "escolher": carrega apenas alunos disponíveis (SEM personal)
        if (pageMode === "escolher") {
            endpoint = "/alunos/disponiveis";
        } else {
            // Modo "listar": carrega alunos do personal logado
            endpoint = `/personais/${session.user.id}/alunos`;
        }

        const [alunosList, objetivos] = await Promise.all([
            api.get(endpoint),
            api.get("/objetivos")
        ]);

        const objetivosPorId = createLookup(objetivos);
        renderAlunos(alunosList, objetivosPorId, pageMode === "escolher");
        setupInteractions();
        
        if (alunosList.length === 0) {
            if (pageMode === "escolher") {
                setStatus(statusElement, "Nenhum aluno disponível para vincular no momento.", "info");
            } else {
                setStatus(statusElement, "Você ainda não tem alunos vinculados.", "info");
            }
        } else {
            setStatus(statusElement, "", "");
        }
    } catch (error) {
        setStatus(statusElement, error.message || "Não foi possível carregar os alunos.", "error");
    }
}

attachBackNavigation();
attachRouteTargets();
carregarAlunos();
