import { api } from "../api.js";
import { getSession, redirectTo } from "../session.js";
import { createLookup, setStatus, valueOrFallback, attachBackNavigation, attachRouteTargets, resolveImagePath } from "../ui.js";

const grid = document.querySelector("#alunos-grid");
const statusElement = document.querySelector("#alunos-status");

function getTreinoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("treino");
}

function renderAlunos(alunos, objetivosPorId) {
    if (alunos.length === 0) {
        grid.innerHTML = `<p class="text-center" style="grid-column: 1/-1;">Nenhum aluno vinculado</p>`;
        return;
    }

    grid.innerHTML = alunos.map((aluno) => `
        <button class="card aluno-card" type="button" data-aluno-id="${aluno.id}">
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

    setupInteractions();
}

function setupInteractions() {
    const cards = Array.from(document.querySelectorAll(".aluno-card"));

    cards.forEach((card) => {
        card.addEventListener("click", async () => {
            const alunoId = card.dataset.alunoId;
            const treinoId = getTreinoId();

            if (!treinoId) {
                setStatus(statusElement, "Nenhum treino foi selecionado.", "error");
                return;
            }

            await anexarTreinoAAluno(treinoId, alunoId);
        });
    });
}

async function anexarTreinoAAluno(treinoId, alunoId) {
    const session = getSession();
    if (!session || session.role !== "personal" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    setStatus(statusElement, "Anexando treino ao aluno...", "loading");

    try {
        await api.patch(`/treinos/${treinoId}/anexar-aluno`, {
            aluno_id: parseInt(alunoId)
        });

        setStatus(statusElement, "✅ Treino anexado com sucesso!", "success");
        
        setTimeout(() => {
            redirectTo("/pages/personal/TreinosdoPersonal.html");
        }, 1500);
    } catch (error) {
        setStatus(statusElement, error.message || "Erro ao anexar treino", "error");
    }
}

async function carregarAlunos() {
    const session = getSession();
    const treinoId = getTreinoId();

    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    if (!treinoId) {
        setStatus(statusElement, "Nenhum treino foi selecionado.", "error");
        return;
    }

    setStatus(statusElement, "Carregando alunos...", "loading");

    try {
        const [alunos, objetivos] = await Promise.all([
            api.get(`/personais/${session.user.id}/alunos`),
            api.get("/objetivos")
        ]);

        const objetivosPorId = createLookup(objetivos);
        renderAlunos(alunos, objetivosPorId);
        
        if (alunos.length === 0) {
            setStatus(statusElement, "Você não tem alunos vinculados para anexar treinos.", "info");
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
