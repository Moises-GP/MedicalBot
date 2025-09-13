document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username === "admin@gmail.com" && password === "1234") {
        alert("✅ Login exitoso!");
        window.location.href = "datos-medicos.html"; // redirige al formulario
    } else {
        alert("❌ Usuario o contraseña incorrectos.");
    }
});