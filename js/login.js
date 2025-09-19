// Alternar entre login y registro
const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".formulario");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        forms.forEach(f => f.classList.remove("active"));

        tab.classList.add("active");
        document.getElementById(tab.dataset.tab).classList.add("active");
    });
});

// Mostrar/ocultar contraseña
document.querySelectorAll(".toggle-password").forEach(toggle => {
    toggle.addEventListener("click", () => {
        const targetId = toggle.getAttribute("data-target");
        const input = document.getElementById(targetId);

        if (input.type === "password") {
            input.type = "text";
            toggle.textContent = "👁️"; // ojo abierto
        } else {
            input.type = "password";
            toggle.textContent = "👁️‍🗨️"; // ojo cerrado
        }
    });
});
