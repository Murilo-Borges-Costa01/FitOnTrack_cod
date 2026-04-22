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
  document.querySelectorAll("[data-action='back']").forEach((element) => {
    element.addEventListener("click", () => window.history.back());
  });
}

export function attachRouteTargets() {
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
