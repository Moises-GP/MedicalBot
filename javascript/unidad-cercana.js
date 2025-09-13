
/* ====== VARIABLES ====== */
let map, service, placesService, directionsService, directionsRenderer;
let markers = [];
let infoWindow;
let lugaresEncontrados = []; // array con PlaceResult tal como vienen de nearbySearch / details
let userLocation = null;
let userMarker = null;

// lista blanca (hospitales vision general) - la puedes ampliar
const hospitalesPrioritarios = [
    "Hospital Sermesa Masaya",
    "Hospital Cruz Azul",
    "Hospital Humberto Alvarado Vázquez",
    "Hospital Salud Integral",
    "Hospital Vivian Pellas",
    "Hospital Fernando Vélez Paiz",
    "Hospital Bertha Calderón Roque"
];

/* ====== INIT MAP (callback) ====== */
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 12.0, lng: -86.0 }, // temporal hasta que tengamos geoloc
        zoom: 14,
        gestureHandling: "greedy"
    });

    service = new google.maps.places.PlacesService(map);
    placesService = service;
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map: map });
    infoWindow = new google.maps.InfoWindow();

    // REQUERIR ubicación real (beta): si no permite, NO carga marcadores automáticos
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                map.setCenter(userLocation);
                map.setZoom(15);
                colocarMarcadorUsuario();
                // Al entrar mostramos todos los puntos automáticamente
                cargarTodosLosLugares();
            },
            (err) => {
                alert("Error: no se obtuvo tu ubicación. En esta versión beta la ubicación en tiempo real es obligatoria. Habilita el permiso y recarga la página.");
                // No hacemos fallback: dejamos que el usuario habilite permisos y recargue
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        alert("Este navegador no soporta geolocalización. La beta requiere ubicación en tiempo real.");
    }

    // Inicializamos autocompletado tipo servicio de predicciones
    initAutocompleteInput();
}

/* ====== MARCADOR USUARIO ====== */
function colocarMarcadorUsuario() {
    if (userMarker) userMarker.setMap(null);
    userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: "Mi ubicación",
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "blue",
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: "white"
        }
    });
}

/* ====== CARGAR TODOS LOS TIPOS ====== */
function cargarTodosLosLugares() {
    if (!userLocation) { alert("Ubicación no disponible. Habilita permisos."); return; }

    limpiarMarcadores();
    limpiarRuta();
    lugaresEncontrados = [];
    document.getElementById('resultadosDropdown').innerHTML = '<option value="">Resultados de búsqueda</option>';

    const tipos = ["hospital", "clinica", "farmacia", "centro de salud"];
    tipos.forEach(tipo => {
        const req = {
            location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            radius: 5000,
            keyword: tipo
        };
        placesService.nearbySearch(req, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                results.forEach(place => {
                    if (!place.geometry || !place.geometry.location) return;
                    // crear marcador con color según tipo
                    const m = new google.maps.Marker({
                        map,
                        position: place.geometry.location,
                        title: place.name,
                        icon: getIcon(tipo)
                    });

                    m.addListener('mouseover', () => {
                        infoWindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity || ''}`);
                        infoWindow.open(map, m);
                    });
                    m.addListener('mouseout', () => infoWindow.close());
                    m.addListener('click', () => {
                        trazarRuta(place.geometry.location);
                        // también seleccionar en dropdown
                        // agregamos al array y al dropdown si no existe
                        const idx = pushLugarSiNoExiste(place);
                        if (idx !== -1) document.getElementById('resultadosDropdown').selectedIndex = idx + 1;
                    });

                    markers.push(m);
                    const idx = pushLugarSiNoExiste(place);
                    // si se agregó, crear opción
                    if (idx !== -1) {
                        const opt = document.createElement('option');
                        opt.value = idx;
                        opt.textContent = `${place.name} - ${place.vicinity || 'Dirección no disponible'}`;
                        document.getElementById('resultadosDropdown').appendChild(opt);
                    }
                });
            }
        });
    });
}

/* añade place a lugaresEncontrados si no existe (compara place_id cuando exista) */
function pushLugarSiNoExiste(place) {
    // si lugar ya está (por place_id o por nombre+vicinity), no duplicar
    const existing = lugaresEncontrados.findIndex(p => (p.place_id && place.place_id && p.place_id === place.place_id) || (p.name === place.name && p.vicinity === place.vicinity));
    if (existing !== -1) return -1;
    lugaresEncontrados.push(place);
    return lugaresEncontrados.length - 1;
}

/* ====== FILTRAR POR TIPO (select) ====== */
function filtrarTipo() {
    const tipo = document.getElementById('tipoLugar').value;
    if (!userLocation) { alert("Ubicación no disponible."); return; }

    if (!tipo) {
        cargarTodosLosLugares();
        return;
    }
    limpiarMarcadores();
    limpiarRuta();
    lugaresEncontrados = [];
    document.getElementById('resultadosDropdown').innerHTML = '<option value="">Resultados de búsqueda</option>';

    placesService.nearbySearch({
        location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        radius: 5000,
        keyword: tipo
    }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.forEach((place, idx) => {
                if (!place.geometry || !place.geometry.location) return;
                const marker = new google.maps.Marker({
                    map,
                    position: place.geometry.location,
                    title: place.name,
                    icon: getIcon(tipo)
                });
                marker.addListener('mouseover', () => {
                    infoWindow.setContent(`<strong>${place.name}</strong><br>${place.vicinity || ''}`);
                    infoWindow.open(map, marker);
                });
                marker.addListener('mouseout', () => infoWindow.close());
                marker.addListener('click', () => {
                    trazarRuta(place.geometry.location);
                    document.getElementById('resultadosDropdown').selectedIndex = idx + 1;
                });
                markers.push(marker);
                lugaresEncontrados.push(place);
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = `${place.name} - ${place.vicinity || 'Dirección no disponible'}`;
                document.getElementById('resultadosDropdown').appendChild(option);
            });
        }
    });
}

/* ====== AUTOCOMPLETE (sugerencias mientras escribes) ====== */
let autocompleteService, sessionToken;
function initAutocompleteInput() {
    autocompleteService = new google.maps.places.AutocompleteService();
    const input = document.getElementById('busquedaNombre');
    const sugDiv = document.getElementById('sugerencias');

    input.addEventListener('input', () => {
        const q = input.value;
        if (!q || q.length < 2) { sugDiv.style.display = 'none'; sugDiv.innerHTML = ''; return; }
        // pedir predicciones (las limitamos a establishment / blended)
        autocompleteService.getPlacePredictions({
            input: q,
            location: new google.maps.LatLng(userLocation.lat, userLocation.lng),
            radius: 50000 // bias geográfico
        }, (predictions, status) => {
            sugDiv.innerHTML = '';
            if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                sugDiv.style.display = 'none';
                return;
            }
            predictions.forEach(pred => {
                const div = document.createElement('div');
                div.className = 'sugerencia-item';
                div.textContent = pred.description;
                div.dataset.placeId = pred.place_id;
                div.onclick = () => {
                    // al hacer click pedimos detalles del place_id
                    placesService.getDetails({ placeId: pred.place_id, fields: ['name', 'geometry', 'formatted_address', 'place_id'] }, (place, stat) => {
                        if (stat === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                            // centrar y trazar ruta
                            map.panTo(place.geometry.location);
                            map.setZoom(16);
                            trazarRuta(place.geometry.location);
                            // opcional: agregar al dropdown y al array
                            const idx = pushLugarSiNoExiste(place);
                            if (idx !== -1) {
                                const opt = document.createElement('option');
                                opt.value = idx;
                                opt.textContent = `${place.name} - ${place.formatted_address || ''}`;
                                document.getElementById('resultadosDropdown').appendChild(opt);
                                document.getElementById('resultadosDropdown').selectedIndex = idx + 1;
                            } else {
                                // si ya existe, seleccionarlo
                                const foundIdx = lugaresEncontrados.findIndex(p => p.place_id === place.place_id);
                                if (foundIdx !== -1) document.getElementById('resultadosDropdown').selectedIndex = foundIdx + 1;
                            }
                        } else {
                            alert('No se pudieron obtener detalles del lugar seleccionado.');
                        }
                    });
                    sugDiv.style.display = 'none';
                    sugDiv.innerHTML = '';
                    input.value = '';
                };
                sugDiv.appendChild(div);
            });
            sugDiv.style.display = 'block';
        });
    });

    // click fuera de sugerencias: ocultar
    document.addEventListener('click', (e) => {
        if (!document.getElementById('sugerencias').contains(e.target) && e.target !== input) {
            document.getElementById('sugerencias').style.display = 'none';
        }
    });
}

/* ====== MÁS CERCANO (prioriza whitelist si aplicable) ====== */
function buscarMasCercano() {
    if (!userLocation) { alert('Ubicación no disponible'); return; }
    if (!lugaresEncontrados.length) { alert('Espera que se carguen los lugares o presiona "Ver Todos".'); return; }

    // filtrar por tipo si hay seleccionado
    const tipo = (document.getElementById('tipoLugar').value || '').toLowerCase();

    let candidatos = lugaresEncontrados.filter(p => {
        if (!tipo) return true;
        // para robustez, revisamos name y vicinity (no perfecto pero sirve)
        return (p.name && p.name.toLowerCase().includes(tipo)) || (p.vicinity && p.vicinity.toLowerCase().includes(tipo));
    });

    if (!candidatos.length) candidatos = lugaresEncontrados.slice();

    // Si tipo hospital -> priorizamos lista blanca (si están entre candidatos)
    let prioritarios = [];
    if (tipo === 'hospital') {
        prioritarios = candidatos.filter(p => hospitalesPrioritarios.some(h => p.name && p.name.includes(h)));
    }

    const usados = (prioritarios.length ? prioritarios : candidatos);

    // calcular el más cercano por distancia (geometry.spherical)
    let mejor = null;
    let minDist = Infinity;
    usados.forEach(p => {
        if (!p.geometry || !p.geometry.location) return;
        const dist = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userLocation.lat, userLocation.lng),
            p.geometry.location
        ); // metros
        if (dist < minDist) { minDist = dist; mejor = p; }
    });

    if (mejor) {
        trazarRuta(mejor.geometry.location);
        map.panTo(mejor.geometry.location);
        map.setZoom(16);
    } else {
        alert('No se encontró un candidato válido.');
    }
}

/* ====== UTILS: icon by type ====== */
function getIcon(tipo) {
    switch ((tipo || '').toLowerCase()) {
        case 'hospital': return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        case 'clinica': return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
        case 'farmacia': return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
        case 'centro de salud': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
        default: return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
    }
}

/* ====== seleccionarResultado (dropdown) ====== */
function seleccionarResultado() {
    const idx = document.getElementById('resultadosDropdown').value;
    if (idx !== '' && lugaresEncontrados[idx]) {
        const place = lugaresEncontrados[idx];
        if (place.geometry && place.geometry.location) {
            trazarRuta(place.geometry.location);
            map.panTo(place.geometry.location);
            map.setZoom(16);
        } else if (place.place_id) {
            // obtener detalles si no tenemos geometry
            placesService.getDetails({ placeId: place.place_id, fields: ['geometry', 'name', 'formatted_address'] }, (p, s) => {
                if (s === google.maps.places.PlacesServiceStatus.OK && p.geometry && p.geometry.location) {
                    trazarRuta(p.geometry.location);
                    map.panTo(p.geometry.location);
                    map.setZoom(16);
                } else alert('No se pudo obtener detalles del lugar.');
            });
        }
    }
}

/* ====== TRAZAR RUTA ====== */
function trazarRuta(destinoLatLng) {
    if (!userLocation) { alert('Ubicación no disponible'); return; }
    directionsService.route({
        origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
        destination: destinoLatLng,
        travelMode: google.maps.TravelMode.DRIVING
    }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            alert('No se pudo calcular la ruta: ' + status);
        }
    });
}

/* ====== LIMPIEZA ====== */
function limpiarMarcadores() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}
function limpiarRuta() {
    directionsRenderer.set('directions', null);
}

/* ====== CENTRAR ====== */
function centrarUbicacion() {
    if (!userLocation) { alert('Ubicación no disponible'); return; }
    map.setCenter(userLocation);
    map.setZoom(15);
}