import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { getSession, redirectTo } from "../session.js";
import { attachBackNavigation, populateSelect, setButtonLoading, setImagePreview, setStatus } from "../ui.js";

const form = document.querySelector("#editar-aluno-form");
const statusElement = document.querySelector("#editar-aluno-status");
const submitButton = document.querySelector("#editar-aluno-submit");
const imageInput = document.querySelector("#editar-aluno-imagem");
const previewImage = document.querySelector("#editar-aluno-imagem-preview");
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
            <div style="font-size:14px; opacity:.9;">Indo para o perfil do aluno...</div>
        </div>
    `;

    document.body.appendChild(overlay);

    window.setTimeout(() => {
        window.location.href = "http://localhost:5500/frontend/pages/aluno/PerfildoAluno.html";
    }, 1400);
}

async function carregarFormulario() {
    const session = getSession();

    if (!session || session.role !== "aluno") {
        redirectTo("/");
        return;
    }

    try {
        const [aluno, generos, objetivos] = await Promise.all([
            api.get(`/alunos/${session.user.id}`),
            api.get("/generos"),
            api.get("/objetivos")
        ]);

        document.querySelector("#editar-aluno-nome").value = aluno.nome || "";
        document.querySelector("#editar-aluno-email").value = aluno.email || "";
        document.querySelector("#editar-aluno-altura").value = aluno.altura || "";
        document.querySelector("#editar-aluno-massa").value = aluno.massa || "";
        document.querySelector("#editar-aluno-saude").value = aluno.problema_saude || "";

        populateSelect(document.querySelector("#editar-aluno-genero"), generos, {
            placeholder: "Escolha um genero",
            selectedValue: aluno.genero_id
        });

        populateSelect(document.querySelector("#editar-aluno-objetivo"), objetivos, {
            placeholder: "Escolha um objetivo",
            selectedValue: aluno.objetivo_id
        });

        setImagePreview(previewImage, aluno.imagem, "assets/images/Aparecer.png");
        imagePreviewController.reset(aluno.imagem || "assets/images/Aparecer.png");
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os dados do aluno.", "error");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const session = getSession();
    if (!session || session.role !== "aluno") {
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
        nome: document.querySelector("#editar-aluno-nome")?.value.trim(),
        email: document.querySelector("#editar-aluno-email")?.value.trim(),
        problema_saude: document.querySelector("#editar-aluno-saude")?.value.trim(),
        genero_id: document.querySelector("#editar-aluno-genero")?.value,
        objetivo_id: document.querySelector("#editar-aluno-objetivo")?.value,
        altura: document.querySelector("#editar-aluno-altura")?.value,
        massa: document.querySelector("#editar-aluno-massa")?.value,
        imagem: imageFile || undefined
    };

    const senha = document.querySelector("#editar-aluno-senha")?.value;
    if (senha) {
        payload.senha = senha;
    }

    if (!payload.nome || !payload.email || !payload.genero_id || !payload.objetivo_id || !payload.altura || !payload.massa) {
        setStatus(statusElement, "Preencha os campos obrigatorios.", "error");
        return;
    }

    if (Number(payload.altura) <= 0 || Number(payload.massa) <= 0) {
        setStatus(statusElement, "Informe altura e massa com valores validos.", "error");
        return;
    }

    setButtonLoading(submitButton, true, "Salvando...");
    setStatus(statusElement, "Atualizando cadastro...", "loading");

    try {
        await api.patch(`/alunos/${session.user.id}`, buildFormData(payload));
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
