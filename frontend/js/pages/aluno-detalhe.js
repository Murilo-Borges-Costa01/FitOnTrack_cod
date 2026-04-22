import { api } from "../api.js";
import { getSelectedAlunoId, getSession, redirectTo } from "../session.js";
import { createLookup, setStatus, valueOrFallback, attachBackNavigation, attachRouteTargets, resolveImagePath } from "../ui.js";

const statusElement = document.querySelector("#aluno-detalhe-status");
const desvincularBtn = document.querySelector("#desvincular-aluno-btn");

function getAlunoId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("aluno") || getSelectedAlunoId();
}

function preencherTexto(id, value) {
    const element = document.querySelector(id);
    if (element) {
        element.textContent = valueOrFallback(value);
    }
}

async function desvincularAluno(alunoId) {
    const session = getSession();
    if (!session || session.role !== "personal" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    const confirmacao = confirm("Tem certeza que deseja desvincular este aluno? Ele ficará disponível para outros personais.");
    if (!confirmacao) return;

    setStatus(statusElement, "Desvinculando aluno...", "loading");

    try {
        await api.delete(`/personais/${session.user.id}/alunos/${alunoId}/desvincular`);
        setStatus(statusElement, "Aluno desvinculado com sucesso! ✅", "success");
        
        setTimeout(() => {
            // Usar window.location para garantir reload completo
            window.location.href = "/frontend/pages/personal/meusAlunos.html";
        }, 1000);
    } catch (error) {
        setStatus(statusElement, error.message || "Erro ao desvincular aluno", "error");
    }
}

async function carregarAluno() {
    const session = getSession();
    const alunoId = getAlunoId();

    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    if (!alunoId) {
        setStatus(statusElement, "Nenhum aluno foi selecionado.", "error");
        return;
    }

    setStatus(statusElement, "Carregando aluno...", "loading");

    try {
        const [aluno, generos, objetivos] = await Promise.all([
            api.get(`/alunos/${alunoId}`),
            api.get("/generos"),
            api.get("/objetivos")
        ]);

        const generosPorId = createLookup(generos);
        const objetivosPorId = createLookup(objetivos);

        preencherTexto("#aluno-detalhe-nome", aluno.nome);
        preencherTexto("#aluno-detalhe-email", aluno.email);
        preencherTexto("#aluno-detalhe-altura", aluno.altura);
        preencherTexto("#aluno-detalhe-massa", aluno.massa);
        preencherTexto("#aluno-detalhe-saude", aluno.problema_saude);
        preencherTexto("#aluno-detalhe-genero", generosPorId[aluno.genero_id]);
        preencherTexto("#aluno-detalhe-objetivo", objetivosPorId[aluno.objetivo_id]);

        const imageElement = document.querySelector("img[alt='Aluno']");
        console.log(aluno)
        if (imageElement) {
            imageElement.src = resolveImagePath(aluno.imagem, "assets/images/Aparecer.png");
        }

        // Mostrar botão de desvincular se for um personal
        if (desvincularBtn && session.role === "personal") {
            desvincularBtn.style.display = "block";
            desvincularBtn.addEventListener("click", () => {
                desvincularAluno(alunoId);
            });
        }

        setStatus(statusElement, "", "info");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar o aluno.", "error");
    }
}

attachBackNavigation();
attachRouteTargets();
carregarAluno();
