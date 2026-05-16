import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile, validateAndFormatCref } from "../forms.js";
import { getSession, redirectTo } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setImagePreview, setStatus } from "../ui.js";
import { showAlert } from "../alerts.js";

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

    const crefRaw = document.querySelector("#editar-personal-cref")?.value.trim();
    const crefCheck = validateAndFormatCref(crefRaw);
    if (!crefCheck.ok) {
        setStatus(statusElement, crefCheck.error, "error");
        return;
    }

    const payload = {
        nome: document.querySelector("#editar-personal-nome")?.value.trim(),
        email: document.querySelector("#editar-personal-email")?.value.trim(),
        cref: crefCheck.formatted,
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
        await showAlert({
            icon: "success",
            title: "Editado com sucesso!",
            text: "Indo para o perfil do personal...",
            timer: 1500,
            showConfirmButton: false,
        });
        redirectTo("/pages/personal/PerfildoPersonal.html");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel atualizar o perfil.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

attachBackNavigation();
carregarFormulario();

if (form) {
    const crefInput = document.querySelector("#editar-personal-cref");
    crefInput?.addEventListener("blur", () => {
        const check = validateAndFormatCref(crefInput.value || "");
        if (check.ok) crefInput.value = check.formatted;
    });

    form.addEventListener("submit", handleSubmit);
}
