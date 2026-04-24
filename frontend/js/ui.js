import { clearSelectedAlunoId, clearSession, getSession, redirectTo } from "./session.js";

export function setStatus(element, message, type = "info") {
  if (!element) return;

  if (!message) {
    element.textContent = "";
    element.className = "status-message d-none";
    return;
  }

  element.textContent = message;
  element.className = `status-message status-${type}`;
}

export function setButtonLoading(
  button,
  isLoading,
  loadingText = "Carregando...",
) {
  if (!button) return;

  if (!button.dataset.originalText) {
    button.dataset.originalText = button.innerHTML;
  }

  button.disabled = isLoading;
  button.classList.toggle("is-loading", isLoading);
  button.innerHTML = isLoading ? loadingText : button.dataset.originalText;
}

export function populateSelect(select, items, options = {}) {
  if (!select) return;

  const {
    placeholder = "Selecione uma opcao",
    valueKey = "id",
    labelKey = "nome",
    selectedValue = "",
  } = options;

  const placeholderOption = `<option value="">${placeholder}</option>`;
  const mappedOptions = items
    .map((item) => {
      const selected =
        String(item[valueKey]) === String(selectedValue) ? " selected" : "";
      return `<option value="${item[valueKey]}"${selected}>${item[labelKey]}</option>`;
    })
    .join("");

  select.innerHTML = placeholderOption + mappedOptions;
}

export function createLookup(items) {
  return items.reduce((accumulator, item) => {
    accumulator[item.id] = item.nome;
    return accumulator;
  }, {});
}

export function valueOrFallback(value, fallback = "Nao informado") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return value;
}

export function attachBackNavigation() {
  attachLogoHomeNavigation();

  document.querySelectorAll("[data-action='back']").forEach((element) => {
    const wrapperButton = element.closest("button");
    if (wrapperButton) {
      wrapperButton.classList.add("back-button-wrapper");
    }

    element.addEventListener("click", () => window.history.back());
  });
}

export function attachRouteTargets() {
  attachHeaderLogoutButton();
  attachLogoHomeNavigation();

  document.querySelectorAll("[data-action='logout']").forEach((element) => {
    if (element.dataset.logoutBound === "true") {
      return;
    }

    element.dataset.logoutBound = "true";
    element.addEventListener("click", async () => {
      element.setAttribute("disabled", "disabled");

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Mesmo com falha na API, limpa sessão local para garantir saída no cliente.
      } finally {
        clearSession();
        clearSelectedAlunoId();
        redirectTo("index.html");
      }
    });
  });

  document.querySelectorAll("[data-route]").forEach((element) => {
    element.style.cursor = element.style.cursor || "pointer";
    element.addEventListener("click", () => {
      const targetRoute = element.dataset.route;

      if (targetRoute) {
        window.location.href = new URL(targetRoute, window.location.href).href;
      }
    });
  });
}

function getHomeRouteForRole(role) {
  return role === "personal"
    ? "/pages/personal/meusAlunos.html"
    : "/pages/aluno/PerfildoAluno.html";
}

function attachLogoHomeNavigation() {
  const pathname = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  const session = getSession();
  const role = session?.role || (pathname.includes("/pages/personal/") ? "personal" : "aluno");
  const homeRoute = getHomeRouteForRole(role);

  document.querySelectorAll(".logo-header, #logo1").forEach((logo) => {
    if (logo.dataset.logoHomeBound === "true") {
      return;
    }

    logo.dataset.logoHomeBound = "true";
    logo.style.cursor = "pointer";
    logo.addEventListener("click", () => {
      redirectTo(homeRoute);
    });
  });
}

function attachHeaderLogoutButton() {
  const pathname = window.location.pathname.replace(/\\/g, "/").toLowerCase();
  const isAlunoPage = pathname.includes("/pages/aluno/");
  const isPersonalPage = pathname.includes("/pages/personal/");

  if (!isAlunoPage && !isPersonalPage) {
    return;
  }

  const header = document.querySelector("header.container.flex-between");
  if (!header || header.querySelector(".header-logout-btn")) {
    return;
  }

  header.classList.add("header-with-logout");

  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.className = "btn header-logout-btn";
  logoutButton.dataset.action = "logout";
  logoutButton.setAttribute("aria-label", "Sair da conta");
  logoutButton.textContent = "Sair";

  header.appendChild(logoutButton);
}

export function resolveImagePath(
  imagePath,
  fallback = "assets/images/PerfildoAluno.png",
) {
  console.log("resolveImagePath recebeu:", imagePath);
  
  if (!imagePath) {
    return fallback;
  }

  // Verifica data URI PRIMEIRO (antes de uploads!)
  if (/^(https?:|data:|blob:)/i.test(imagePath)) {
    console.log("É uma URL válida ou data URI, retornando como está");
    return imagePath;
  }

  // Depois verifica se é upload
  if (imagePath.startsWith("assets/uploads/") || imagePath.startsWith("/assets/uploads/")) {
    const apiBaseUrl = window.localStorage.getItem("fitontrack.apiBaseUrl") || "http://localhost:3000";
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
    const fullUrl = `${apiBaseUrl}/${cleanPath}`;
    console.log("Convertido para:", fullUrl);
    return fullUrl;
  }

  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  if (imagePath.startsWith("assets/")) {
    return imagePath;
  }

  if (imagePath.startsWith("imagens/")) {
    return imagePath.replace(/^imagens\//, "assets/images/");
  }

  return `assets/images/${imagePath.replace(/^\.?\/*/, "")}`;
}

export function setImagePreview(
  imageElement,
  imagePath,
  fallback = "assets/images/PerfildoAluno.png",
) {
  if (!imageElement) {
    console.warn("setImagePreview: elemento não encontrado");
    return;
  }
  const resolvedPath = resolveImagePath(imagePath, fallback);
  console.log("setImagePreview definindo src para:", resolvedPath);
  imageElement.src = resolvedPath;
}
