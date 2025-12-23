// Map Modal Functions
let map = null;
let currentMarker = null;

function initMapButton() {
    const mapBtn = document.getElementById('mapBtn');
    if (mapBtn) {
        mapBtn.addEventListener('click', function () {
            openMapModal();
        });
    }
}

function openMapModal() {
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        mapModal.classList.add('active');
        // Delay map initialization to ensure modal is visible
        setTimeout(() => {
            initWorldMap();
        }, 100);
    }
}

function closeMapModal() {
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
        mapModal.classList.remove('active');
        // Destroy map when closing to prevent issues
        if (map) {
            map.remove();
            map = null;
            currentMarker = null;
        }
    }
}

function initWorldMap() {
    const worldMapDiv = document.getElementById('worldMap');
    if (!worldMapDiv) return;

    // If map already exists, don't recreate
    if (map) {
        map.invalidateSize();
        return;
    }

    // Create Leaflet map centered on world view
    map = L.map('worldMap', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 13,
        zoomControl: true
    });

    // Add dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add click event to map
    map.on('click', function (e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        // Remove previous marker
        if (currentMarker) {
            map.removeLayer(currentMarker);
        }

        // Add new marker with custom icon
        const purpleIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background: #7c4dff; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(124, 77, 255, 0.6);"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        currentMarker = L.marker([lat, lon], { icon: purpleIcon }).addTo(map);

        // Get weather for this location
        getWeatherByCoordinates(lat, lon);
    });
}

function getWeatherByCoordinates(lat, lon) {
    const instruction = document.querySelector('.map-instruction');
    const originalText = instruction.innerHTML;
    instruction.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching weather data...';

    // Fetch multiple locations and filter for cities (limit=5 to get more options)
    fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=59e18a63e3539a96f2bd5418c79620b3`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Filter to prioritize cities over towns/villages
                // Look for entries without 'local_names' variations or with state info
                let selectedLocation = data[0]; // Default to first result

                // Try to find a city (usually has state info and is a larger settlement)
                for (let location of data) {
                    // Prefer locations that are likely cities (have state info)
                    if (location.state) {
                        selectedLocation = location;
                        break;
                    }
                }

                const cityName = selectedLocation.name;
                const country = selectedLocation.country;
                const state = selectedLocation.state || '';

                // Show popup on marker
                const popupContent = `
                    <div class="weather-popup">
                        <h3><i class="fas fa-location-dot"></i> ${cityName}</h3>
                        <p>${state ? state + ', ' : ''}${country}</p>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">
                            Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°
                        </p>
                        <button onclick="selectMapLocation('${cityName}')">
                            <i class="fas fa-check"></i> Get Weather
                        </button>
                    </div>
                `;

                currentMarker.bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-popup'
                }).openPopup();

                instruction.innerHTML = `<i class="fas fa-check-circle" style="color: #7c4dff;"></i> Location found: ${cityName}, ${country}`;
            } else {
                instruction.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ff4757;"></i> No city found at this location. Try clicking on a populated area.';
                setTimeout(() => {
                    instruction.innerHTML = originalText;
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            instruction.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #ff4757;"></i> Failed to get location data. Please try again.';
            setTimeout(() => {
                instruction.innerHTML = originalText;
            }, 3000);
        });
}

function selectMapLocation(cityName) {
    closeMapModal();
    searchCity(cityName);
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    initMapButton();
});
