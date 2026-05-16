import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile, validateAndFormatCref } from "../forms.js";
import { clearSession, setFlashMessage } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setStatus } from "../ui.js";
import { showAlert } from "../alerts.js";

const form = document.querySelector("#cadastro-personal-form");
const generoSelect = document.querySelector("#personal-genero");
const imageInput = document.querySelector("#personal-imagem");
const previewImage = document.querySelector("#personal-imagem-preview");
const statusElement = document.querySelector("#cadastro-personal-status");
const submitButton = document.querySelector("#cadastro-personal-submit");
const imagePreviewController = attachImageInputPreview({
    input: imageInput,
    previewElement: previewImage,
    fallback: "assets/images/Aparecer.png"
});

async function finalizarCadastroEIrParaIndex() {
    try {
        await api.post("/auth/logout", {});
    } catch {
        // Sem sessao ativa ou logout indisponivel: segue o fluxo.
    }

    clearSession();
    window.sessionStorage.setItem("fitontrack.skipSessionAutoRedirect", "1");
    window.location.replace("/");
}

async function carregarOpcoes() {
    try {
        const generos = await api.get("/generos");
        populateSelect(generoSelect, generos, { placeholder: "Escolha um genero" });
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os generos.", "error");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const imageFile = imageInput?.files?.[0];
    const imageError = validateImageFile(imageFile);
    if (imageError) {
        setStatus(statusElement, imageError, "error");
        return;
    }

    const crefRaw = document.querySelector("#personal-cref")?.value.trim();
    const crefCheck = validateAndFormatCref(crefRaw);
    if (!crefCheck.ok) {
        setStatus(statusElement, crefCheck.error, "error");
        return;
    }

    const payload = {
        cref: crefCheck.formatted,
        nome: document.querySelector("#personal-nome")?.value.trim(),
        email: document.querySelector("#personal-email")?.value.trim(),
        senha: document.querySelector("#personal-senha")?.value,
        genero_id: document.querySelector("#personal-genero")?.value,
        certificados: document.querySelector("#personal-certificados")?.value.trim(),
        especialidade: document.querySelector("#personal-especialidade")?.value.trim(),
        imagem: imageFile || undefined
    };

    const repetirSenha = document.querySelector("#personal-senha-confirmacao")?.value;

    if (!payload.cref || !payload.nome || !payload.email || !payload.senha || !payload.genero_id) {
        setStatus(statusElement, "Preencha todos os campos obrigatorios.", "error");
        return;
    }

    if (payload.senha !== repetirSenha) {
        setStatus(statusElement, "As senhas nao conferem.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Cadastrando...");
    setStatus(statusElement, "Criando cadastro...", "loading");

    try {
        await api.post("/personais", buildFormData(payload));
        setStatus(statusElement, "Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        await showAlert({
            icon: "success",
            title: "Cadastro realizado!",
            text: "Redirecionando para a tela inicial...",
            timer: 1600,
            showConfirmButton: false,
        });
        setFlashMessage("Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        form.reset();
        imagePreviewController.reset("/frontend/assets/images/Aparecer.png");
        finalizarCadastroEIrParaIndex();
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel cadastrar o personal.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();
carregarOpcoes();

if (form) {
    // Formatação/validação on blur
    const crefInput = document.querySelector("#personal-cref");
    crefInput?.addEventListener("blur", () => {
        const check = validateAndFormatCref(crefInput.value || "");
        if (check.ok) crefInput.value = check.formatted;
    });
    
    form.addEventListener("submit", handleSubmit);
}
