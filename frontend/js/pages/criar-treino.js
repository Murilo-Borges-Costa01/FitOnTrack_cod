import { api } from "../api.js";
import { buildFormData, attachImageInputPreview, validateImageFile } from "../forms.js";
import { clearSelectedAlunoId, getSelectedAlunoId, getSession, redirectTo, setFlashMessage } from "../session.js";
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

function atualizarContadorExerciciosSelecionados() {
    const totalSelecionados = document.querySelectorAll("input[type='checkbox'][data-exercicio-id]:checked").length;
    const contador = document.querySelector("#exercicios-contador");
    const botaoSubmit = document.querySelector("#criar-treino-submit");
    
    if (contador) {
        contador.textContent = `${totalSelecionados} exercicios selecionados`;
        contador.classList.toggle("contador-ativo", totalSelecionados > 0);
        console.log("Contador atualizado:", totalSelecionados);
    } else {
        console.warn("Elemento #exercicios-contador não encontrado");
    }

    // Mostrar/esconder botão baseado em seleção
    if (botaoSubmit) {
        if (totalSelecionados > 0) {
            botaoSubmit.style.display = "block";
        } else {
            botaoSubmit.style.display = "none";
        }
    }
}

function getTreinoId() {
    return new URL(window.location.href).searchParams.get("treino");
}

function isEditMode() {
    return Boolean(getTreinoId());
}

function renderExercicios(exercicios, configuracoesPorExercicio = {}) {
    console.log("renderExercicios chamado com", exercicios.length, "exercicios");
    
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

    console.log("Adicionando listeners aos checkboxes...");
    const checkboxes = exerciciosGrid.querySelectorAll("input[type='checkbox']");
    console.log("Total de checkboxes encontrados:", checkboxes.length);
    
    checkboxes.forEach((checkbox, index) => {
        console.log("Adicionando listener ao checkbox", index, "com id", checkbox.dataset.exercicioId);
        
        checkbox.addEventListener("change", (e) => {
            console.log("MUDOU! Checkbox", checkbox.dataset.exercicioId, "agora está", checkbox.checked);
            checkbox.closest(".exercicio-card")?.classList.toggle("card-selected", checkbox.checked);
            atualizarContadorExerciciosSelecionados();
        });
    });

    console.log("Atualizando contador inicial...");
    atualizarContadorExerciciosSelecionados();
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

        setFlashMessage(
            isEditMode() ? "Treino atualizado com sucesso." : "Treino criado com sucesso.",
            "success"
        );
        form.reset();
        imagePreviewController.reset("assets/images/TREINOS.png");
        clearSelectedAlunoId();
        redirectTo("/pages/personal/TreinosdoPersonal.html");
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

// Controlar botão flutuante ao scroll
function getNavBottomOffset() {
    const navBottom = document.querySelector(".nav-bottom");
    const navHeight = navBottom?.getBoundingClientRect().height || navBottom?.offsetHeight || 0;

    return navHeight + 24;
}

function atualizarBotaoSalvarResponsivo() {
    const botaoSubmit = document.querySelector("#criar-treino-submit");
    if (!botaoSubmit) return;

    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const distanceFromBottom = documentHeight - (scrollPosition + windowHeight);
    const navOffset = getNavBottomOffset();
    const telaCompacta = window.innerWidth <= 768;

    // Se está a menos de 300px do final, aumentar botão
    if (distanceFromBottom < 300) {
        botaoSubmit.style.width = telaCompacta ? "calc(100% - 32px)" : "min(400px, calc(100% - 48px))";
        botaoSubmit.style.maxWidth = "400px";
        botaoSubmit.style.padding = telaCompacta ? "13px 22px" : "14px 28px";
        botaoSubmit.style.fontSize = telaCompacta ? "14px" : "15px";
        botaoSubmit.style.right = "50%";
        botaoSubmit.style.transform = "translateX(50%)";
        botaoSubmit.style.borderRadius = "10px";
        botaoSubmit.style.bottom = `${navOffset}px`;
    } else {
        // Voltar ao tamanho pequeno
        botaoSubmit.style.width = "auto";
        botaoSubmit.style.maxWidth = "none";
        botaoSubmit.style.padding = telaCompacta ? "10px 18px" : "12px 24px";
        botaoSubmit.style.fontSize = telaCompacta ? "13px" : "14px";
        botaoSubmit.style.right = telaCompacta ? "16px" : "20px";
        botaoSubmit.style.transform = "none";
        botaoSubmit.style.borderRadius = "999px";
        botaoSubmit.style.bottom = `${navOffset}px`;
    }
}

window.addEventListener("scroll", atualizarBotaoSalvarResponsivo);
window.addEventListener("resize", atualizarBotaoSalvarResponsivo);
window.addEventListener("orientationchange", atualizarBotaoSalvarResponsivo);
window.setTimeout(atualizarBotaoSalvarResponsivo, 0);
