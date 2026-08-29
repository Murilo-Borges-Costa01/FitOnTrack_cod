import { api } from "../api.js";
import { clearSession, getSession, redirectTo } from "../session.js";
import {
  attachRouteTargets,
  createLookup,
  setImagePreview,
  setStatus,
  valueOrFallback,
} from "../ui.js";
import { confirmDanger, showAlert } from "../alerts.js";

const statusElement = document.querySelector("#perfil-aluno-status");
const logoutButton = document.querySelector("#perfil-aluno-logout");
const deletarButton = document.querySelector("#perfil-aluno-deletar");

function preencherTexto(id, value) {
  const element = document.querySelector(id);
  if (element) {
    element.textContent = valueOrFallback(value);
  }
}

async function carregarPerfil() {
  const session = getSession();

  if (!session || session.role !== "aluno" || !session.user?.id) {
    redirectTo("/");
    return;
  }

  setStatus(statusElement, "Carregando perfil...", "loading");

  try {
    const [aluno, generos, objetivos] = await Promise.all([
      api.get(`/alunos/${session.user.id}`),
      api.get("/generos"),
      api.get("/objetivos"),
    ]);

    const generosPorId = createLookup(generos);
    const objetivosPorId = createLookup(objetivos);
    
    const imgElement = document.querySelector("#perfil-aluno-imagem");
    setImagePreview(imgElement, aluno.imagem, "assets/images/Aparecer.png");


    preencherTexto("#perfil-aluno-nome", aluno.nome);
    preencherTexto("#perfil-aluno-email", aluno.email);
    preencherTexto("#perfil-aluno-altura", aluno.altura);
    preencherTexto("#perfil-aluno-massa", aluno.massa);
    preencherTexto("#perfil-aluno-saude", aluno.problema_saude);
    preencherTexto("#perfil-aluno-genero", generosPorId[aluno.genero_id]);
    preencherTexto("#perfil-aluno-objetivo", objetivosPorId[aluno.objetivo_id]);

    setStatus(statusElement, "", "info");
  } catch (error) {
    setStatus(
      statusElement,
      error.message || "Nao foi possivel carregar o perfil.",
      "error",
    );
    showAlert({
      icon: "error",
      title: "Erro ao carregar o perfil",
      text: error.message || "Nao foi possivel carregar o perfil.",
    });
  }
}

async function deletarConta() {
  const session = getSession();

  const confirmacao = await confirmDanger({
    title: "Deletar conta?",
    text: "Essa ação é irreversível e todos os seus treinos e avaliações serão deletados.",
    confirmButtonText: "Sim, deletar",
    cancelButtonText: "Cancelar",
  });

  if (!confirmacao) return;

  setStatus(statusElement, "Deletando conta...", "loading");

  try {
    await api.delete(`/alunos/${session.user.id}`);
    setStatus(statusElement, "Conta deletada com sucesso! Redirecionando...", "success");

    await showAlert({
      icon: "success",
      title: "Conta deletada",
      text: "Sua conta foi removida com sucesso.",
      timer: 1800,
      showConfirmButton: false,
    });
    clearSession();
    redirectTo("/");
  } catch (error) {
    setStatus(
      statusElement,
      error.message || "Nao foi possivel deletar a conta.",
      "error"
    );
    showAlert({
      icon: "error",
      title: "Erro ao deletar conta",
      text: error.message || "Nao foi possivel deletar a conta.",
    });
  }
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // Mesmo que o backend nao tenha sessao ativa, limpamos o estado local.
    }

    clearSession();
    redirectTo("/");
  });
}

if (deletarButton) {
  deletarButton.addEventListener("click", deletarConta);
}

attachRouteTargets();
carregarPerfil();
