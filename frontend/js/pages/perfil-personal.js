import { api } from "../api.js";
import { clearSession, consumeFlashMessage, getSession, redirectTo } from "../session.js";
import { attachRouteTargets, confirmAction, createLookup, setImagePreview, setStatus, showToast, valueOrFallback } from "../ui.js";

const statusElement = document.querySelector("#perfil-personal-status");
const logoutButton = document.querySelector("#perfil-personal-logout");
const deletarButton = document.querySelector("#perfil-personal-deletar");
const avaliacoesButton = document.querySelector("#perfil-personal-avaliacoes");

function preencherTexto(id, value) {
    const element = document.querySelector(id);
    if (element) {
        element.textContent = valueOrFallback(value);
    }
}

async function carregarPerfil() {
    const session = getSession();

    if (!session || session.role !== "personal" || !session.user?.id) {
        redirectTo("/");
        return;
    }

    setStatus(statusElement, "Carregando perfil...", "loading");

    try {
        const [personal, generos] = await Promise.all([
            api.get(`/personais/${session.user.id}`),
            api.get("/generos")
        ]);

        const generosPorId = createLookup(generos);

        preencherTexto("#perfil-personal-nome", personal.nome);
        preencherTexto("#perfil-personal-email", personal.email);
        preencherTexto("#perfil-personal-certificados", personal.certificados);
        preencherTexto("#perfil-personal-especialidade", personal.especialidade);
        preencherTexto("#perfil-personal-genero", generosPorId[personal.genero_id]);
        preencherTexto("#perfil-personal-cref", personal.cref);
        setImagePreview(document.querySelector("#perfil-personal-imagem"), personal.imagem, "assets/images/Aparecer.png");

        setStatus(statusElement, "", "info");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar o perfil.", "error");
    }
}

async function deletarConta() {
    const session = getSession();
    
    const confirmacao = await confirmAction(
        "Tem certeza que deseja deletar sua conta? Essa ação é irreversível. Seus alunos serão desvinculados e poderão receber novos personais. Todos os treinos e avaliações serão deletados.",
        {
            title: "Deletar conta",
            confirmButtonText: "Sim, deletar",
            cancelButtonText: "Cancelar",
        }
    );
    
    if (!confirmacao) return;

    setStatus(statusElement, "Deletando conta...", "loading");

    try {
        await api.delete(`/personais/${session.user.id}`);
        setStatus(statusElement, "Conta deletada com sucesso! Redirecionando...", "success");
        showToast("Conta deletada com sucesso.", "success");
        setTimeout(() => {
            clearSession();
            redirectTo("/");
        }, 2000);
    } catch (error) {
        setStatus(
            statusElement,
            error.message || "Nao foi possivel deletar a conta.",
            "error"
        );
    }
}

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await api.post("/auth/logout", {});
        } catch {
            // Mesmo que o backend nao tenha sessao ativa, limpamos o estado local.
        }

        clearSession();
        redirectTo("/");
    });
}

if (deletarButton) {
    deletarButton.addEventListener("click", deletarConta);
}

if (avaliacoesButton) {
    avaliacoesButton.addEventListener("click", () => {
        redirectTo("pages/personal/avaliacoes-pessoal.html");
    });
}

attachRouteTargets();
carregarPerfil();

const flashMessage = consumeFlashMessage();
if (flashMessage?.message) {
    showToast(flashMessage.message, flashMessage.type || "success");
}
