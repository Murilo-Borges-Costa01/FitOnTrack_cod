const SESSION_KEY = "fitontrack.session";
const SELECTED_ALUNO_KEY = "fitontrack.selectedAlunoId";
const FLASH_MESSAGE_KEY = "fitontrack.flashMessage";

function getAppRootUrl() {
    const currentUrl = new URL(window.location.href);
    const pathname = currentUrl.pathname.replace(/\\/g, "/");
    const frontendIndex = pathname.indexOf("/frontend/");

    if (frontendIndex >= 0) {
        const frontendRootPath = pathname.slice(0, frontendIndex + "/frontend/".length);
        return new URL(frontendRootPath, currentUrl).href;
    }

    // Quando o frontend está servido pelo backend Express, as páginas ficam em /pages.
    if (pathname.startsWith("/pages/") || pathname.startsWith("/assets/") || pathname.startsWith("/js/")) {
        return new URL("/", currentUrl).href;
    }

    return new URL("./", currentUrl).href;
}

export function saveSession(session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
    const rawValue = window.localStorage.getItem(SESSION_KEY);
    if (!rawValue) return null;

    try {
        return JSON.parse(rawValue);
    } catch {
        clearSession();
        return null;
    }
}

export function clearSession() {
    window.localStorage.removeItem(SESSION_KEY);
}

export function saveSelectedAlunoId(alunoId) {
    window.localStorage.setItem(SELECTED_ALUNO_KEY, String(alunoId));
}

export function getSelectedAlunoId() {
    return window.localStorage.getItem(SELECTED_ALUNO_KEY);
}

export function clearSelectedAlunoId() {
    window.localStorage.removeItem(SELECTED_ALUNO_KEY);
}

export function setFlashMessage(message, type = "info") {
    window.sessionStorage.setItem(FLASH_MESSAGE_KEY, JSON.stringify({ message, type }));
}

export function consumeFlashMessage() {
    const rawValue = window.sessionStorage.getItem(FLASH_MESSAGE_KEY);

    if (!rawValue) {
        return null;
    }

    window.sessionStorage.removeItem(FLASH_MESSAGE_KEY);

    try {
        return JSON.parse(rawValue);
    } catch {
        return null;
    }
}

export function redirectTo(path) {
    if (/^https?:\/\//i.test(path)) {
        window.location.href = path;
        return;
    }

    const normalizedPath = String(path || "")
        .replace(/^\/+/, "")
        .replace(/^frontend\//i, "");
    const targetPath = normalizedPath || "index.html";

    window.location.href = new URL(targetPath, getAppRootUrl()).href;
}
