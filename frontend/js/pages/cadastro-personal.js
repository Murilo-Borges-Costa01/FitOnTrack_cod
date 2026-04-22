import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { setFlashMessage } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setStatus } from "../ui.js";

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

function showCadastroSuccessAndGoToIndex() {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 0, 0, 0.65)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    overlay.innerHTML = `
        <div style="background:#111; border:1px solid #00a7ff; border-radius:14px; padding:20px; text-align:center; color:#fff; width:min(320px, 90vw); box-shadow:0 10px 30px rgba(0,0,0,.4);">
            <img src="/frontend/assets/images/add.png" alt="Cadastro realizado" style="width:72px; height:72px; object-fit:contain; margin-bottom:10px;" />
            <div style="font-size:18px; font-weight:700; margin-bottom:4px;">Cadastro realizado!</div>
            <div style="font-size:14px; opacity:.9;">Redirecionando para a tela inicial...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.setTimeout(() => {
        window.location.href = "/frontend/index.html";
    }, 1400);
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

    const payload = {
        cref: document.querySelector("#personal-cref")?.value.trim(),
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
        setFlashMessage("Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        form.reset();
        imagePreviewController.reset("/frontend/assets/images/Aparecer.png");
        await carregarOpcoes();
        showCadastroSuccessAndGoToIndex();
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel cadastrar o personal.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();
carregarOpcoes();

if (form) {
    form.addEventListener("submit", handleSubmit);
}
