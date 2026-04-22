import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { getSession, redirectTo } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setImagePreview, setStatus } from "../ui.js";

const form = document.querySelector("#editar-personal-form");
const statusElement = document.querySelector("#editar-personal-status");
const submitButton = document.querySelector("#editar-personal-submit");
const imageInput = document.querySelector("#editar-personal-imagem");
const previewImage = document.querySelector("#editar-personal-imagem-preview");
const imagePreviewController = attachImageInputPreview({
    input: imageInput,
    previewElement: previewImage,
    fallback: "assets/images/Aparecer.png"
});

function showEditSuccessAndGoToProfile() {
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
            <img src="/frontend/assets/images/edit-row.png" alt="Editado com sucesso" style="width:72px; height:72px; object-fit:contain; margin-bottom:10px;" />
            <div style="font-size:18px; font-weight:700; margin-bottom:4px;">Editado com sucesso!</div>
            <div style="font-size:14px; opacity:.9;">Indo para o perfil do personal...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.setTimeout(() => {
        window.location.href = "http://localhost:5500/frontend/pages/personal/PerfildoPersonal.html";
    }, 1400);
}

async function carregarFormulario() {
    const session = getSession();

    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    try {
        const [personal, generos] = await Promise.all([
            api.get(`/personais/${session.user.id}`),
            api.get("/generos")
        ]);

        document.querySelector("#editar-personal-nome").value = personal.nome || "";
        document.querySelector("#editar-personal-email").value = personal.email || "";
        document.querySelector("#editar-personal-cref").value = personal.cref || "";
        document.querySelector("#editar-personal-certificados").value = personal.certificados || "";
        document.querySelector("#editar-personal-especialidade").value = personal.especialidade || "";

        populateSelect(document.querySelector("#editar-personal-genero"), generos, {
            placeholder: "Escolha um genero",
            selectedValue: personal.genero_id
        });

        setImagePreview(previewImage, personal.imagem, "assets/images/Aparecer.png");
        imagePreviewController.reset(personal.imagem || "assets/images/Aparecer.png");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os dados do personal.", "error");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const session = getSession();
    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    const imageFile = imageInput?.files?.[0];
    const imageError = validateImageFile(imageFile);
    if (imageError) {
        setStatus(statusElement, imageError, "error");
        return;
    }

    const payload = {
        nome: document.querySelector("#editar-personal-nome")?.value.trim(),
        email: document.querySelector("#editar-personal-email")?.value.trim(),
        cref: document.querySelector("#editar-personal-cref")?.value.trim(),
        certificados: document.querySelector("#editar-personal-certificados")?.value.trim(),
        especialidade: document.querySelector("#editar-personal-especialidade")?.value.trim(),
        genero_id: document.querySelector("#editar-personal-genero")?.value,
        imagem: imageFile || undefined
    };

    const senha = document.querySelector("#editar-personal-senha")?.value;
    if (senha) {
        payload.senha = senha;
    }

    if (!payload.nome || !payload.email || !payload.cref || !payload.genero_id) {
        setStatus(statusElement, "Preencha os campos obrigatorios.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Salvando...");
    setStatus(statusElement, "Atualizando cadastro...", "loading");

    try {
        await api.patch(`/personais/${session.user.id}`, buildFormData(payload));
        setStatus(statusElement, "Perfil atualizado com sucesso.", "success");
        showEditSuccessAndGoToProfile();
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel atualizar o perfil.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();
carregarFormulario();

if (form) {
    form.addEventListener("submit", handleSubmit);
}
