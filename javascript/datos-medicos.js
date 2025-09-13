document.getElementById("medicosForm").addEventListener("submit", function(e) {
  e.preventDefault();

  let nombre = document.getElementById("nombre").value;
  let edad = document.getElementById("edad").value;
  let sexo = document.getElementById("sexo").value;
  let sangre = document.getElementById("sangre").value;
  let alergias = document.getElementById("alergias").value;
  let enfermedades = document.getElementById("enfermedades").value;
  let medicamentos = document.getElementById("medicamentos").value;

  // Guardar en localStorage (opcional)
  localStorage.setItem("datosMedicos", JSON.stringify({
    nombre, edad, sexo, sangre, alergias, enfermedades, medicamentos
  }));

  // Redirige al lobby
  window.location.href = "lobby.html";
});