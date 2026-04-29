import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { setFlashMessage } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setStatus } from "../ui.js";

const form = document.querySelector("#cadastro-aluno-form");
const generoSelect = document.querySelector("#aluno-genero");
const objetivoSelect = document.querySelector("#aluno-objetivo");
const imageInput = document.querySelector("#aluno-imagem");
const previewImage = document.querySelector("#aluno-imagem-preview");
const statusElement = document.querySelector("#cadastro-aluno-status");
const submitButton = document.querySelector("#cadastro-aluno-submit");
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
        window.location.href = new URL("../../index.html", window.location.href).href;
    }, 5000);
}

async function carregarOpcoes() {
    try {
        const [generos, objetivos] = await Promise.all([
            api.get("/generos"),
            api.get("/objetivos")
        ]);

        populateSelect(generoSelect, generos, { placeholder: "Escolha um genero" });
        populateSelect(objetivoSelect, objetivos, { placeholder: "Escolha um objetivo" });
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os dados do formulario.", "error");
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
        nome: document.querySelector("#aluno-nome")?.value.trim(),
        email: document.querySelector("#aluno-email")?.value.trim(),
        senha: document.querySelector("#aluno-senha")?.value,
        genero_id: document.querySelector("#aluno-genero")?.value,
        objetivo_id: document.querySelector("#aluno-objetivo")?.value,
        altura: document.querySelector("#aluno-altura")?.value,
        massa: document.querySelector("#aluno-massa")?.value,
        problema_saude: document.querySelector("#aluno-problema-saude")?.value.trim(),
        imagem: imageFile || undefined
    };

    const repetirSenha = document.querySelector("#aluno-senha-confirmacao")?.value;

    if (!payload.nome || !payload.email || !payload.senha || !payload.genero_id || !payload.objetivo_id || !payload.altura || !payload.massa) {
        setStatus(statusElement, "Preencha todos os campos obrigatorios.", "error");
        return;
    }

    if (Number(payload.altura) <= 0 || Number(payload.massa) <= 0) {
        setStatus(statusElement, "Informe altura e massa com valores validos.", "error");
        return;
    }

    if (payload.senha !== repetirSenha) {
        setStatus(statusElement, "As senhas nao conferem.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Cadastrando...");
    setStatus(statusElement, "Criando cadastro...", "loading");

    try {
        await api.post("/alunos", buildFormData(payload));
        setStatus(statusElement, "Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        setFlashMessage("Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        form.reset();
        imagePreviewController.reset("/frontend/assets/images/Aparecer.png");
        showCadastroSuccessAndGoToIndex();
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel cadastrar o aluno.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();
carregarOpcoes();

if (form) {
    form.addEventListener("submit", handleSubmit);
}
