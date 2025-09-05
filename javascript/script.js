document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");

    let isDown = false;
    let startX;
    let scrollLeft;

    navbar.addEventListener("mousedown", (e) => {
        isDown = true;
        navbar.classList.add("active");
        startX = e.pageX - navbar.offsetLeft;
        scrollLeft = navbar.scrollLeft;
    });

    navbar.addEventListener("mouseleave", () => {
        isDown = false;
        navbar.classList.remove("active");
    });

    navbar.addEventListener("mouseup", () => {
        isDown = false;
        navbar.classList.remove("active");
    });

    navbar.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - navbar.offsetLeft;
        const walk = (x - startX) * 1.5;
        navbar.scrollLeft = scrollLeft - walk;
    });

    // Botón de cerrar sesión
    document.getElementById("logout").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.clear();
        alert("👋 Sesión cerrada.");
        window.location.href = "index.html";
    });
});