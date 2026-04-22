import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { clearSelectedAlunoId, getSelectedAlunoId, getSession, redirectTo } from "../session.js";
import { attachBackNavigation, attachRouteTargets, populateSelect, resolveImagePath, setButtonLoading, setImagePreview, setStatus, valueOrFallback } from "../ui.js";

const form = document.querySelector("#criar-treino-form");
const titleElement = document.querySelector("#treino-form-title");
const statusElement = document.querySelector("#criar-treino-status");
const submitButton = document.querySelector("#criar-treino-submit");
const alunoSelect = document.querySelector("#treino-aluno");
const exerciciosGrid = document.querySelector("#exercicios-grid");
const imageInput = document.querySelector("#treino-imagem");
const previewImage = document.querySelector("#treino-imagem-preview");
let exerciciosDisponiveis = [];
const imagePreviewController = attachImageInputPreview({
    input: imageInput,
    previewElement: previewImage,
    fallback: "assets/images/TREINOS.png"
});

function getTreinoId() {
    return new URL(window.location.href).searchParams.get("treino");
}

function isEditMode() {
    return Boolean(getTreinoId());
}

function renderExercicios(exercicios, configuracoesPorExercicio = {}) {
    exerciciosGrid.innerHTML = exercicios.map((exercicio) => {
        const configuracao = configuracoesPorExercicio[exercicio.id] || {};
        const estaSelecionado = Boolean(configuracao.exercicio_id || configuracao.series || configuracao.repeticoes);

        return `
            <label class="card exercicio-card ${estaSelecionado ? "card-selected" : ""}">
                <div class="flex-between gap-md">
                    <div style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%;">
                        <img
                            src="${resolveImagePath(exercicio.imagem, "assets/images/visualizar.png")}"
                            alt="${valueOrFallback(exercicio.nome, "Exercicio")}"
                            width="90"
                            height="90"
                            style="border-radius: var(--radius-md); object-fit: cover;"
                        />
                        <div>
                            <h3 class="mb-sm">${exercicio.nome}</h3>
                            <p class="mt-0">${exercicio.descricao || "Sem descricao cadastrada."}</p>
                        </div>
                    </div>
                    <input type="checkbox" data-exercicio-id="${exercicio.id}" ${estaSelecionado ? "checked" : ""} />
                </div>
                <div class="grid grid-2 mt-lg">
                    <div>
                        <label class="form-label" style="color: #fff;">Series:</label>
                        <input class="form-control" type="number" min="1" value="${configuracao.series || 3}" data-field="series" data-exercicio-id="${exercicio.id}" placeholder="Series" />
                    </div>
                    <div>
                        <label class="form-label" style="color: #fff;">Repeticoes:</label>
                        <input class="form-control" type="number" min="1" value="${configuracao.repeticoes || 12}" data-field="repeticoes" data-exercicio-id="${exercicio.id}" placeholder="Repeticoes" />
                    </div>
                    <div>
                        <label class="form-label" style="color: #fff;">Carga:</label>
                        <input class="form-control" type="number" min="0" step="0.5" value="${configuracao.carga ?? 0}" data-field="carga" data-exercicio-id="${exercicio.id}" placeholder="Carga" />
                    </div>
                    <div>
                        <label class="form-label" style="color: #fff;">Descanso:</label>
                        <input class="form-control" type="number" min="1" value="${configuracao.descanso || 60}" data-field="descanso" data-exercicio-id="${exercicio.id}" placeholder="Descanso" />
                    </div>
                </div>
            </label>
        `;
    }).join("");

    document.querySelectorAll("input[type='checkbox'][data-exercicio-id]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            checkbox.closest(".exercicio-card")?.classList.toggle("card-selected", checkbox.checked);
        });
    });
}

function getExercisePayloads() {
    const checkedBoxes = Array.from(document.querySelectorAll("input[type='checkbox'][data-exercicio-id]:checked"));

    return checkedBoxes.map((checkbox) => {
        const exercicioId = checkbox.dataset.exercicioId;

        return {
            exercicio_id: Number(exercicioId),
            series: Number(document.querySelector(`[data-field='series'][data-exercicio-id='${exercicioId}']`)?.value),
            repeticoes: Number(document.querySelector(`[data-field='repeticoes'][data-exercicio-id='${exercicioId}']`)?.value),
            carga: Number(document.querySelector(`[data-field='carga'][data-exercicio-id='${exercicioId}']`)?.value || 0),
            descanso: Number(document.querySelector(`[data-field='descanso'][data-exercicio-id='${exercicioId}']`)?.value)
        };
    });
}

function applyModeText() {
    const editing = isEditMode();
    if (titleElement) {
        titleElement.textContent = editing ? "Editar treino" : "Criar treino";
    }

    if (submitButton) {
        submitButton.textContent = editing ? "Salvar alteracoes" : "Salvar";
    }
}

async function carregarDadosIniciais() {
    const session = getSession();

    if (!session || session.role !== "personal") {
        redirectTo("/");
        return;
    }

    try {
        const [alunos, exercicios] = await Promise.all([
            api.get(`/personais/${session.user.id}/alunos`),
            api.get("/exercicios")
        ]);

        exerciciosDisponiveis = exercicios;

        let treino = null;

        if (isEditMode()) {
            treino = await api.get(`/treinos/${getTreinoId()}`);
        }

        populateSelect(alunoSelect, alunos, {
            placeholder: "Escolha um aluno",
            selectedValue: treino?.aluno_id || getSelectedAlunoId() || ""
        });

        const configuracoesPorExercicio = (treino?.exercicios || []).reduce((accumulator, exercicio) => {
            accumulator[exercicio.id] = {
                exercicio_id: exercicio.id,
                ...exercicio.treino_exercicios
            };
            return accumulator;
        }, {});

        renderExercicios(exerciciosDisponiveis, configuracoesPorExercicio);

        if (treino) {
            document.querySelector("#treino-nome").value = treino.nome || "";
            setImagePreview(previewImage, treino.imagem, "assets/images/TREINOS.png");
            imagePreviewController.reset(treino.imagem || "assets/images/TREINOS.png");
        }
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel carregar os dados do treino.", "error");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const session = getSession();
    const nome = document.querySelector("#treino-nome")?.value.trim();
    const alunoId = Number(alunoSelect?.value);
    const exerciciosSelecionados = getExercisePayloads();
    const imageFile = imageInput?.files?.[0];
    const imageError = validateImageFile(imageFile);

    if (imageError) {
        setStatus(statusElement, imageError, "error");
        return;
    }

    if (!nome || !alunoId) {
        setStatus(statusElement, "Informe o nome do treino e o aluno.", "error");
        return;
    }

    if (!exerciciosSelecionados.length) {
        setStatus(statusElement, "Selecione pelo menos um exercicio.", "error");
        return;
    }

    if (exerciciosSelecionados.some((item) => item.series <= 0 || item.repeticoes <= 0 || item.descanso <= 0 || item.carga < 0)) {
        setStatus(statusElement, "Revise series, repeticoes, carga e descanso dos exercicios selecionados.", "error");
        return;
    }

    setButtonLoading(submitButton, true, isEditMode() ? "Salvando..." : "Criando...");
    setStatus(statusElement, isEditMode() ? "Atualizando treino..." : "Criando treino...", "loading");

    try {
        const payload = buildFormData({
            nome,
            aluno_id: alunoId,
            personal_id: session.user.id,
            exercicios: exerciciosSelecionados,
            imagem: imageFile || undefined
        });

        if (isEditMode()) {
            await api.patch(`/treinos/${getTreinoId()}`, payload);
            setStatus(statusElement, "Treino atualizado com sucesso.", "success");
        } else {
            await api.post("/treinos", payload);
            setStatus(statusElement, "Treino criado com sucesso.", "success");
        }

        form.reset();
        imagePreviewController.reset("assets/images/TREINOS.png");
        clearSelectedAlunoId();
        window.setTimeout(() => redirectTo("/pages/personal/TreinosdoPersonal.html"), 1200);
    } catch (error) {
        setStatus(statusElement, error.message || "Nao foi possivel salvar o treino.", "error");
    } finally {
        setButtonLoading(submitButton, false);
    }
}

applyModeText();
attachBackNavigation();
attachRouteTargets();
carregarDadosIniciais();

if (form) {
    form.addEventListener("submit", handleSubmit);
}
