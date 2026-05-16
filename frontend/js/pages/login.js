import { api } from "../api.js?v=20260516";
import { saveSession, redirectTo, getSession, clearSession, consumeFlashMessage } from "../session.js?v=20260516";
import { setButtonLoading, setStatus, attachBackNavigation } from "../ui.js?v=20260516";

const loginForm = document.querySelector("#login-form");
const statusElement = document.querySelector("#login-status");
const submitButton = document.querySelector("#login-submit");

function getRedirectPath(role) {
    return role === "personal"
        ? "/pages/personal/meusAlunos.html"
        : "/pages/aluno/PerfildoAluno.html";
}

async function tentarLogin(role, credentials) {
    const endpoint = role === "personal" ? "/auth/personal" : "/auth/aluno";
    const user = await api.post(endpoint, credentials);
    return { role, user };
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.querySelector("#login-email")?.value.trim();
    const senha = document.querySelector("#login-senha")?.value;

    if (!email || !senha) {
        setStatus(statusElement, "Preencha e-mail e senha.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Entrando...");
    setStatus(statusElement, "Validando credenciais...", "loading");

    try {
        let result;

        try {
            result = await tentarLogin("aluno", { email, senha });
        } catch {
            result = await tentarLogin("personal", { email, senha });
        }

        saveSession({
            role: result.role,
            user: {
                id: result.user.id,
                nome: result.user.nome,
                email: result.user.email
            }
        });

        setStatus(statusElement, "Login realizado com sucesso.", "success");
        redirectTo(getRedirectPath(result.role));
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel entrar.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();

const flashMessage = consumeFlashMessage();
if (flashMessage?.message) {
    setStatus(statusElement, flashMessage.message, flashMessage.type || "success");
}

async function validarSessaoExistente() {
    const skipAutoRedirect = window.sessionStorage.getItem("fitontrack.skipSessionAutoRedirect") === "1";
    if (skipAutoRedirect) {
        window.sessionStorage.removeItem("fitontrack.skipSessionAutoRedirect");
        return;
    }

    const existingSession = getSession();
    if (!existingSession) {
        return;
    }

    try {
        await api.get("/auth/session");
        redirectTo(getRedirectPath(existingSession.role));
    } catch {
        clearSession();
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
}

validarSessaoExistente();
