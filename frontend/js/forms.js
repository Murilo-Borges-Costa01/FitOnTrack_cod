const allowedImageTypes = new Set(["image/jpeg", "image/png"]);
const maxImageSizeInBytes = 5 * 1024 * 1024;

export function validateImageFile(file) {
    if (!file) {
        return null;
    }

    if (!allowedImageTypes.has(file.type)) {
        return "Selecione uma imagem JPG ou PNG.";
    }

    if (file.size > maxImageSizeInBytes) {
        return "A imagem deve ter no maximo 5 MB.";
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

export function validateAndFormatCref(raw) {
    if (!raw && raw !== "") {
        return { ok: false, error: "CREF é obrigatório." };
    }

    const s = String(raw || "").toUpperCase().trim();

    // Aceita variantes como: "CREF 123456-G/PE", "123456G/PE", "123456 G/pe", etc.
    const m = s.match(/(?:CREF\s*)?0*([0-9]{1,6})\s*[-]?\s*G\s*\/\s*([A-Z]{2})/i);
    if (!m) {
        return { ok: false, error: "Formato do CREF inválido. Ex.: CREF 000000-G/PE" };
    }

    const num = String(m[1]).padStart(6, "0");
    const uf = String(m[2]).toUpperCase();
    const formatted = `CREF ${num}-G/${uf}`;
    return { ok: true, formatted };
}
