import { clearSelectedAlunoId, clearSession, getSession, redirectTo } from "./session.js";

const SWEETALERT_STYLE_ID = "sweetalert2-styles";
const SWEETALERT_SCRIPT_ID = "sweetalert2-script";
const SWEETALERT_STYLE_PATH = "/frontend/assets/vendor/sweetalert2/sweetalert2.min.css";
const SWEETALERT_SCRIPT_PATH = "/frontend/assets/vendor/sweetalert2/sweetalert2.all.min.js";

let sweetAlertLoadPromise = null;

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

function ensureSweetAlertResources() {
  if (window.Swal) {
    console.log("SweetAlert2 já está carregado (window.Swal existe)");
    return Promise.resolve(window.Swal);
  }

  if (!sweetAlertLoadPromise) {
    console.log("Iniciando carregamento do SweetAlert2...");
    sweetAlertLoadPromise = new Promise((resolve, reject) => {
      const existingStyles = document.getElementById(SWEETALERT_STYLE_ID);
      if (!existingStyles) {
        console.log("Carregando CSS do SweetAlert2:", SWEETALERT_STYLE_PATH);
        const styleLink = document.createElement("link");
        styleLink.id = SWEETALERT_STYLE_ID;
        styleLink.rel = "stylesheet";
        styleLink.href = SWEETALERT_STYLE_PATH;
        styleLink.onerror = () => {
          console.error("Erro ao carregar CSS do SweetAlert2");
          reject(new Error("Nao foi possivel carregar os estilos do SweetAlert2."));
        };
        document.head.appendChild(styleLink);
      }

      const existingScript = document.getElementById(SWEETALERT_SCRIPT_ID);
      if (existingScript && window.Swal) {
        console.log("Script já existe e Swal está disponível");
        resolve(window.Swal);
        return;
      }

      if (!existingScript) {
        console.log("Carregando JS do SweetAlert2:", SWEETALERT_SCRIPT_PATH);
        const script = document.createElement("script");
        script.id = SWEETALERT_SCRIPT_ID;
        script.src = SWEETALERT_SCRIPT_PATH;
        script.defer = false;
        script.onload = () => {
          console.log("Script carregado, aguardando window.Swal...");
          if (window.Swal) {
            console.log("window.Swal disponível após onload");
            resolve(window.Swal);
          } else {
            const checkInterval = window.setInterval(() => {
              if (window.Swal) {
                console.log("window.Swal disponível após polling");
                window.clearInterval(checkInterval);
                resolve(window.Swal);
              }
            }, 50);
            window.setTimeout(() => {
              window.clearInterval(checkInterval);
              if (!window.Swal) {
                console.error("SweetAlert2 não inicializou após timeout");
                reject(new Error("SweetAlert2 não inicializou corretamente."));
              }
            }, 3000);
          }
        };
        script.onerror = () => {
          console.error("Erro ao carregar JS do SweetAlert2");
          reject(new Error("Nao foi possivel carregar o SweetAlert2."));
        };
        document.head.appendChild(script);
        return;
      }

      const waitForGlobal = window.setInterval(() => {
        if (window.Swal) {
          console.log("window.Swal encontrado após polling");
          window.clearInterval(waitForGlobal);
          resolve(window.Swal);
        }
      }, 30);

      window.setTimeout(() => {
        window.clearInterval(waitForGlobal);
        if (!window.Swal) {
          console.error("SweetAlert2 não inicializou após timeout final");
          reject(new Error("SweetAlert2 nao inicializou corretamente."));
        }
      }, 5000);
    }).catch((error) => {
      console.error("Erro ao carregar SweetAlert2:", error.message);
      sweetAlertLoadPromise = null;
      throw error;
    });
  }

  return sweetAlertLoadPromise;
}

export async function showToast(message, type = "success", options = {}) {
  const { title, timer = 2200, position = "top-end" } = options;

  try {
    const Swal = await ensureSweetAlertResources();
    return Swal.fire({
      icon: type,
      title: title || message,
      text: title ? message : "",
      toast: true,
      position,
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: "sweetalert2-toast-popup",
      },
    });
  } catch {
    if (type === "error") {
      window.alert(message);
      return false;
    }

    window.console.warn("SweetAlert2 indisponivel. Exibindo mensagem simples.", message);
    return true;
  }
}

export async function showSuccessDialog(message, options = {}) {
  const {
    title = "Sucesso",
    confirmButtonText = "OK",
  } = options;

  console.log("showSuccessDialog: tentando exibir diálogo", { title, message });
  
  // Se Swal está disponível globalmente (carregado via tag script no HTML)
  if (typeof window.Swal !== "undefined") {
    console.log("showSuccessDialog: usando window.Swal com delay longo");
    try {
      // Mostra o diálogo com timer de 15 segundos + barra de progresso
      await window.Swal.fire({
        icon: "success",
        title,
        text: message,
        confirmButtonText,
        confirmButtonColor: "#00b7ff",
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 15000,
        timerProgressBar: true,
      });
      console.log("showSuccessDialog: diálogo fechado após 15 segundos ou clique");
      return true;
    } catch (error) {
      console.error("showSuccessDialog: erro ao exibir Swal", error);
      window.alert(message);
      return true;
    }
  }

  // Fallback para alert nativo se SweetAlert2 não estiver disponível
  console.log("showSuccessDialog: SweetAlert2 não disponível, usando alert()");
  window.alert(message);
  return true;
}

export async function confirmAction(message, options = {}) {
  const {
    title = "Confirmar ação",
    confirmButtonText = "Sim, continuar",
    cancelButtonText = "Cancelar",
    icon = "warning",
  } = options;

  try {
    const Swal = await ensureSweetAlertResources();
    const result = await Swal.fire({
      title,
      text: message,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4b5563",
    });

    return Boolean(result.isConfirmed);
  } catch {
    return window.confirm(message);
  }
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
