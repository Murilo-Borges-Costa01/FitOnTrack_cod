const maxImageSizeInBytes = 10 * 1024 * 1024;
const allowedImageExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif"]);

function getFileExtension(file) {
    const name = String(file?.name || "").toLowerCase();
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop() : "";
}

export function validateImageFile(file) {
    if (!file) {
        return null;
    }

    const fileType = String(file.type || "");
    const fileExtension = getFileExtension(file);

    if (!fileType.startsWith("image/") && !allowedImageExtensions.has(fileExtension)) {
        return "Selecione uma imagem valida.";
    }

    if (file.size > maxImageSizeInBytes) {
        return "A imagem deve ter no maximo 10 MB.";
    }

    return null;
}

export function attachImageInputPreview({ input, previewElement, fallback }) {
    let currentObjectUrl = null;

    function revokeCurrentObjectUrl() {
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }
    }

    function showPreview(imagePath = fallback) {
        if (!previewElement) return;

        previewElement.src = imagePath || fallback;
    }

    showPreview(fallback);

    input?.addEventListener("change", () => {
        revokeCurrentObjectUrl();

        const file = input.files?.[0];
        if (!file) {
            showPreview(fallback);
            return;
        }

        currentObjectUrl = URL.createObjectURL(file);
        showPreview(currentObjectUrl);
    });

    return {
        reset(imagePath = fallback) {
            revokeCurrentObjectUrl();
            if (input) {
                input.value = "";
            }

            showPreview(imagePath);
        }
    };
}

export function buildFormData(values) {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (value instanceof File) {
            formData.append(key, value);
            return;
        }

        if (Array.isArray(value) || typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, String(value));
    });

    return formData;
}
