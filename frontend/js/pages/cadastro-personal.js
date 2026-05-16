import { api } from "../api.js?v=20260516";
import { attachImageInputPreview, validateImageFile } from "../forms.js?v=20260516";
import { clearSession, setFlashMessage } from "../session.js?v=20260516";
import { attachBackNavigation, populateSelect, setButtonLoading, setStatus } from "../ui.js?v=20260516";

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

function showCadastroSuccessAndGoToIndex(diagnostic) {
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
            ${diagnostic ? `<pre id="cadastro-diagnostic" style="text-align:left; background:#0b0b0b; color:#0ff; padding:8px; margin-top:12px; border-radius:8px; max-height:160px; overflow:auto; font-size:12px;">${String(diagnostic).slice(0,300)}</pre>` : ""}
        </div>
    `;
    document.body.appendChild(overlay);

    // Segura por mais tempo para permitir leitura do diagnostico
    window.setTimeout(finalizarCadastroEIrParaIndex, diagnostic ? 5000 : 1500);
}

function showCadastroErrorBanner(diagnostic) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 0, 0, 0.85)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    overlay.innerHTML = `
        <div style="background:#111; border:1px solid #ff6b6b; border-radius:14px; padding:20px; text-align:center; color:#fff; width:min(520px, 95vw); box-shadow:0 10px 30px rgba(0,0,0,.6);">
            <div style="font-size:18px; font-weight:700; margin-bottom:8px; color:#ff6b6b;">Falha ao cadastrar</div>
            <div style="font-size:14px; opacity:.95; margin-bottom:10px;">Houve um erro ao enviar o cadastro com imagem. Cole o conteúdo abaixo ao gerar um relatório de erro.</div>
            <pre id="cadastro-error" style="text-align:left; background:#0b0b0b; color:#f66; padding:8px; margin-top:6px; border-radius:8px; max-height:240px; overflow:auto; font-size:12px;">${String(diagnostic).slice(0,1000)}</pre>
            <div style="margin-top:12px;"><button id="cadastro-error-close" style="padding:8px 12px; border-radius:8px; border:none; background:#333; color:#fff;">Fechar</button></div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btn = document.getElementById("cadastro-error-close");
    if (btn) btn.addEventListener("click", () => overlay.remove());
}

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

    const cref = document.querySelector("#personal-cref")?.value.trim();
    const nome = document.querySelector("#personal-nome")?.value.trim();
    const email = document.querySelector("#personal-email")?.value.trim();
    const senha = document.querySelector("#personal-senha")?.value;
    const generoId = document.querySelector("#personal-genero")?.value;
    const certificados = document.querySelector("#personal-certificados")?.value.trim();
    const especialidade = document.querySelector("#personal-especialidade")?.value.trim();

    const repetirSenha = document.querySelector("#personal-senha-confirmacao")?.value;

    if (!cref || !nome || !email || !senha || !generoId) {
        setStatus(statusElement, "Preencha todos os campos obrigatorios.", "error");
        return;
    }

    if (senha !== repetirSenha) {
        setStatus(statusElement, "As senhas nao conferem.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Cadastrando...");
    setStatus(statusElement, "Criando cadastro...", "loading");

    try {
        const formData = new FormData();
        formData.append("cref", cref);
        formData.append("nome", nome);
        formData.append("email", email);
        formData.append("senha", senha);
        formData.append("genero_id", generoId);
        formData.append("certificados", certificados || "");
        formData.append("especialidade", especialidade || "");

        if (imageFile) {
            formData.append("imagem", imageFile, imageFile.name || "imagem");
        }

        const result = await api.post("/personais", formData);

        try {
            window.sessionStorage.setItem("fitontrack.lastCadastroResponse", JSON.stringify({ ok: true, result, timestamp: Date.now(), imagemNome: imageFile?.name || null }));
        } catch (e) {
            // ignore
        }

        const diag = JSON.stringify({ ok: true, id: result?.id || null, imagem: result?.imagem || null });

        // Enviar log de debug ao servidor (fire-and-forget)
        try {
            api.post("/debug/log", {
                event: "cadastro_personal_success",
                imagemNome: imageFile?.name || null,
                result: result || null,
                ua: navigator.userAgent
            }).catch(() => {});
        } catch (e) {}

        setStatus(statusElement, "Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        setFlashMessage("Cadastro realizado com sucesso. Voce ja pode entrar.", "success");
        form.reset();
        imagePreviewController.reset("/frontend/assets/images/Aparecer.png");
        showCadastroSuccessAndGoToIndex(diag);
    } catch (error) {
        try {
            window.sessionStorage.setItem("fitontrack.lastCadastroError", JSON.stringify({ message: error.message || String(error), timestamp: Date.now() }));
        } catch (e) {
            // ignore
        }

        const diag = error?.message || String(error) || "Erro desconhecido";
        showCadastroErrorBanner(diag);
        try {
            api.post("/debug/log", {
                event: "cadastro_personal_error",
                mensagem: diag,
                imagemNome: imageFile?.name || null,
                ua: navigator.userAgent
            }).catch(() => {});
        } catch (e) {}
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
