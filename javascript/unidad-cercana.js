let map, directionsService, directionsRenderer, infoWindow, userLocation;

function initMap() {
    const nicaragua = { lat: 12.8654, lng: -85.2072 };

    // Inicializar mapa en modo híbrido (satélite + etiquetas)
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 7,
        center: nicaragua,
        mapTypeId: "hybrid",       // 🌍 híbrido con calles y nombres
        streetViewControl: false,  // 🚫 sin Street View
        mapTypeControl: false,     // 🚫 sin control para cambiar tipo de mapa
        fullscreenControl: false,  // 🚫 sin botón fullscreen
        zoomControl: true          // ✅ dejar zoom
    });

    // Servicios de Google
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("directionsPanel"));

    infoWindow = new google.maps.InfoWindow();

    // Botones activos
    document.getElementById("findHospitals").addEventListener("click", buscarHospitales);
    document.getElementById("getRoute").addEventListener("click", mostrarRuta);

    // 🔹 Botón estilo radar (mi ubicación)
    const locationButton = document.createElement("div");
    locationButton.classList.add("custom-location-button");
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

    locationButton.addEventListener("click", () => {
        mostrarUbicacion();
    });
}

// ✅ Mostrar ubicación exacta con Geolocation API
function mostrarUbicacion(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            userLocation = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            };
            map.setCenter(userLocation);
            map.setZoom(14);

            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Tu ubicación"
            });

            infoWindow.setPosition(userLocation);
            infoWindow.setContent("Estás aquí 📍");
            infoWindow.open(map);

            if (callback) callback(userLocation);

        }, () => {
            alert("Error obteniendo tu ubicación.");
            if (callback) callback(null);
        });
    } else {
        alert("Tu navegador no soporta geolocalización.");
        if (callback) callback(null);
    }
}

// ✅ Buscar hospitales cercanos en Nicaragua (usa tu ubicación si está disponible)
function buscarHospitales() {
    const ejecutarBusqueda = (ubicacion) => {
        const searchLocation = ubicacion || { lat: 12.8654, lng: -85.2072 }; // centro de Nicaragua
        const service = new google.maps.places.PlacesService(map);

        service.nearbySearch({
            location: searchLocation,
            radius: 5000, // 5 km
            type: ["hospital"],
            keyword: "hospital nicaragua"
        }, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach((place) => {
                    new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name
                    });
                });
                map.setCenter(searchLocation);
                map.setZoom(13);
            } else {
                alert("No se encontraron hospitales cercanos.");
            }
        });
    };

    if (userLocation) {
        ejecutarBusqueda(userLocation);
    } else {
        mostrarUbicacion(ejecutarBusqueda);
    }
}

// ✅ Mostrar direcciones de punto A a punto B con Directions API
function mostrarRuta() {
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (!start || !end) {
        alert("Por favor ingresa un punto de inicio y destino.");
        return;
    }

    directionsService.route(
        {
            origin: start,
            destination: end,
            travelMode: "DRIVING",
            region: "NI"
        },
        (response, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(response);
            } else {
                alert("No se pudo mostrar la ruta: " + status);
            }
        }
    );
}