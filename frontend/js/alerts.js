function loadSweetAlert() {
    if (window.Swal) {
        return Promise.resolve(window.Swal);
    }

    return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-swal2-loader="true"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.Swal));
            existing.addEventListener("error", reject);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
        script.async = true;
        script.dataset.swal2Loader = "true";
        script.onload = () => resolve(window.Swal);
        script.onerror = () => reject(new Error("Nao foi possivel carregar SweetAlert2"));
        document.head.appendChild(script);
    });
}

function darkDefaults(options = {}) {
    return {
        background: "#111827",
        color: "#F9FAFB",
        confirmButtonColor: "#F59E0B",
        cancelButtonColor: "#374151",
        buttonsStyling: true,
        scrollbarPadding: false,
        ...options,
    };
}

export async function showAlert(options = {}) {
    try {
        const Swal = await loadSweetAlert();
        return Swal.fire(darkDefaults(options));
    } catch (error) {
        const text = [options.title, options.text].filter(Boolean).join("\n");
        if (text) {
            window.alert(text);
        }
        return { isConfirmed: true };
    }
}

export async function showToast(message, icon = "success", timer = 2800) {
    try {
        const Swal = await loadSweetAlert();
        return Swal.fire(
            darkDefaults({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer,
                timerProgressBar: true,
                icon,
                title: message,
                background: "#111827",
                color: "#F9FAFB",
            }),
        );
    } catch (error) {
        console.log(`[${icon}] ${message}`);
        return null;
    }
}

export async function confirmDanger({
    title,
    text,
    confirmButtonText = "Sim, continuar",
    cancelButtonText = "Cancelar",
}) {
    try {
        const Swal = await loadSweetAlert();
        const result = await Swal.fire(
            darkDefaults({
                icon: "warning",
                title,
                text,
                showCancelButton: true,
                confirmButtonText,
                cancelButtonText,
                focusCancel: true,
                reverseButtons: true,
                allowOutsideClick: false,
                allowEscapeKey: true,
            }),
        );

        return !!result.isConfirmed;
    } catch (error) {
        return window.confirm([title, text].filter(Boolean).join("\n\n"));
    }
}
