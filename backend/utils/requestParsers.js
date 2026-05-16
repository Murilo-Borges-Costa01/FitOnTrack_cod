export function normalizeOptionalString(value) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    const normalized = String(value).trim();
    return normalized ? normalized : null;
}

export function normalizeRequiredString(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value).trim();
}

export function parseRequiredNumber(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw new Error(`${fieldLabel} deve ser um numero valido maior que zero.`);
    }

    return parsedValue;
}

export function parseOptionalNumber(value, fieldLabel) {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw new Error(`${fieldLabel} deve ser um numero valido maior que zero.`);
    }

    return parsedValue;
}

export function parseNonNegativeNumber(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        throw new Error(`${fieldLabel} deve ser um numero valido maior ou igual a zero.`);
    }

    return parsedValue;
}

export function parseJsonArray(value, fallback = []) {
    if (Array.isArray(value)) {
        return value;
    }

    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    try {
        const parsedValue = JSON.parse(value);
        return Array.isArray(parsedValue) ? parsedValue : fallback;
    } catch {
        throw new Error("Nao foi possivel ler os itens enviados.");
    }
}

export function normalizeCref(value) {
    const raw = normalizeRequiredString(value).toUpperCase().trim();

    // Expect variants like: "CREF 123456-G/PE", "123456G/PE", "123456 G/PE"
    const m = raw.match(/(?:CREF\s*)?0*([0-9]{1,6})\s*[-]?\s*G\s*\/\s*([A-Z]{2})/i);
    if (!m) {
        throw new Error("CREF invalido. Formato esperado: CREF 000000-G/UF");
    }

    const num = String(m[1]).padStart(6, "0");
    const uf = String(m[2]).toUpperCase();

    return `CREF ${num}-G/${uf}`;
}
