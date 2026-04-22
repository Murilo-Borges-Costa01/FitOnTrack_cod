import { api } from "../api.js";
import { setStatus } from "../ui.js";

const emailInput = document.querySelector("#reset-email");
const novaSenhaInput = document.querySelector("#reset-nova-senha");
const confirmarSenhaInput = document.querySelector("#reset-confirmar-senha");
const resetBtn = document.querySelector("#reset-btn");
const statusElement = document.querySelector("#reset-status");

async function redefinirSenha() {
  const email = emailInput.value.trim();
  const novaSenha = novaSenhaInput.value.trim();
  const confirmarSenha = confirmarSenhaInput.value.trim();

  if (!email || !novaSenha || !confirmarSenha) {
    setStatus(statusElement, "Por favor, preencha todos os campos.", "error");
    return;
  }

  if (novaSenha !== confirmarSenha) {
    setStatus(statusElement, "As senhas não conferem.", "error");
    return;
  }

  if (novaSenha.length < 6) {
    setStatus(statusElement, "A senha deve ter no mínimo 6 caracteres.", "error");
    return;
  }

  setStatus(statusElement, "Redefinindo senha...", "loading");
  resetBtn.disabled = true;

  try {
    // Tenta redefinir para aluno primeiro
    try {
      await api.post("/reset-senha/aluno", {
        email,
        novaSenha,
      });
      setStatus(statusElement, "Senha redefinida com sucesso! Redirecionando...", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    } catch (alunoError) {
      // Se falhar para aluno, tenta para personal
      try {
        await api.post("/reset-senha/personal", {
          email,
          novaSenha,
        });
        setStatus(statusElement, "Senha redefinida com sucesso! Redirecionando...", "success");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      } catch (personalError) {
        // Se falhar para ambos
        throw new Error("Email não encontrado em nossas bases de dados.");
      }
    }
  } catch (error) {
    setStatus(
      statusElement,
      error.message || "Não foi possível redefinir a senha.",
      "error",
    );
    resetBtn.disabled = false;
  }
}

if (resetBtn) {
  resetBtn.addEventListener("click", redefinirSenha);
}

// Permitir Enter para submeter
if (confirmarSenhaInput) {
  confirmarSenhaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      redefinirSenha();
    }
  });
}
