// Favorite Cities Management
let favorites = JSON.parse(localStorage.getItem('favoriteCities')) || [];
let currentUnit = localStorage.getItem('tempUnit') || 'C';
let currentTheme = localStorage.getItem('theme') || 'dark';
let animationsEnabled = localStorage.getItem('animations') !== 'false';

// Update favorites count and list on page load
document.addEventListener('DOMContentLoaded', function () {
    updateFavoritesDisplay();
    checkIfCurrentCityIsFavorite();
    initSidebarNavigation();
    initTheme();
    initUnitToggle();
    updateUnitToggleUI(); // Initialize the F/C toggle colors
    initLocationButton(); // Initialize location detection
});

function toggleFavorite(city) {
    const index = favorites.indexOf(city);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(city);
    }
    localStorage.setItem('favoriteCities', JSON.stringify(favorites));
    updateFavoritesDisplay();
    checkIfCurrentCityIsFavorite();
}

function updateFavoritesDisplay() {
    const favCount = document.getElementById('favCount');
    const favoritesList = document.getElementById('favoritesList');

    if (favCount) favCount.textContent = favorites.length;

    if (favoritesList) {
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">No favorites yet. Click the heart icon to add cities!</p>';
        } else {
            favoritesList.innerHTML = favorites.map(city => `
                <div class="fav-city-item" onclick="searchCity('${city}')">
                    <div class="fav-city-name">
                        <i class="fas fa-location-dot"></i>
                        ${city}
                    </div>
                    <button class="remove-fav" onclick="event.stopPropagation(); toggleFavorite('${city}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }
}

function checkIfCurrentCityIsFavorite() {
    const locationTag = document.querySelector('.location-tag');
    if (locationTag) {
        const cityText = locationTag.textContent.trim().split(',')[0].replace(/[^\w\s]/gi, '').trim();
        const favIcon = document.getElementById('favIcon');
        if (favIcon) {
            if (favorites.includes(cityText)) {
                favIcon.classList.remove('far');
                favIcon.classList.add('fas');
            } else {
                favIcon.classList.remove('fas');
                favIcon.classList.add('far');
            }
        }
    }
}

function searchCity(city) {
    const cityInput = document.getElementById('cityInput');
    const searchForm = document.getElementById('searchForm');
    if (cityInput && searchForm) {
        cityInput.value = city;
        searchForm.submit();
    }
}

// Location Detection
function initLocationButton() {
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.addEventListener('click', function () {
            detectLocation();
        });
    }
}

function detectLocation() {
    const locationBtn = document.getElementById('locationBtn');

    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    // Show loading state
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    locationBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Use reverse geocoding to get city name
            fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=59e18a63e3539a96f2bd5418c79620b3`)
                .then(response => response.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const cityName = data[0].name;
                        searchCity(cityName);
                    } else {
                        alert('Could not determine your location');
                        resetLocationButton();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to get location data');
                    resetLocationButton();
                });
        },
        function (error) {
            let errorMessage = 'Unable to retrieve your location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied. Please enable location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out.';
                    break;
            }
            alert(errorMessage);
            resetLocationButton();
        }
    );
}

function resetLocationButton() {
    const locationBtn = document.getElementById('locationBtn');
    if (locationBtn) {
        locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
        locationBtn.disabled = false;
    }
}

// Temperature Unit Toggle
function initUnitToggle() {
    const unitToggle = document.querySelector('.unit-toggle');
    if (unitToggle) {
        // Store original Celsius values on page load
        storeOriginalTemperatures();

        unitToggle.addEventListener('click', function () {
            currentUnit = currentUnit === 'C' ? 'F' : 'C';
            localStorage.setItem('tempUnit', currentUnit);
            convertAllTemperatures();
            updateUnitToggleUI();
        });
    }
}

function storeOriginalTemperatures() {
    // Store main temperature
    const mainTemp = document.querySelector('.main-temp');
    if (mainTemp && !mainTemp.dataset.celsius) {
        const temp = parseFloat(mainTemp.textContent);
        mainTemp.dataset.celsius = temp;
    }

    // Store feels like
    const feelsLike = document.querySelector('.feels-like');
    if (feelsLike && !feelsLike.dataset.celsius) {
        const text = feelsLike.textContent;
        const match = text.match(/\d+/);
        if (match) {
            feelsLike.dataset.celsius = parseFloat(match[0]);
        }
    }

    // Store high/low
    const tempRange = document.querySelector('.temp-range');
    if (tempRange && !tempRange.dataset.high) {
        const text = tempRange.textContent;
        const highMatch = text.match(/High: (\d+)/);
        const lowMatch = text.match(/Low: (\d+)/);
        if (highMatch && lowMatch) {
            tempRange.dataset.high = parseFloat(highMatch[1]);
            tempRange.dataset.low = parseFloat(lowMatch[1]);
        }
    }

    // Store hourly forecast
    document.querySelectorAll('.f-temp').forEach(el => {
        if (!el.dataset.celsius) {
            const temp = parseFloat(el.textContent);
            el.dataset.celsius = temp;
        }
    });

    // Store daily forecast
    document.querySelectorAll('.daily-high').forEach(el => {
        if (!el.dataset.celsius) {
            const temp = parseFloat(el.textContent);
            el.dataset.celsius = temp;
        }
    });

    document.querySelectorAll('.daily-low').forEach(el => {
        if (!el.dataset.celsius) {
            const temp = parseFloat(el.textContent);
            el.dataset.celsius = temp;
        }
    });
}

function updateUnitToggleUI() {
    const toggleTrack = document.querySelector('.toggle-track');
    const unitToggle = document.querySelector('.unit-toggle');

    if (!toggleTrack || !unitToggle) return;

    const fSpan = unitToggle.querySelector('span:first-child');
    const cSpan = toggleTrack.querySelector('span');

    if (!fSpan || !cSpan) return;

    if (currentUnit === 'F') {
        // F is active
        toggleTrack.classList.remove('active');
        toggleTrack.style.background = 'transparent';
        fSpan.style.opacity = '1';
        fSpan.style.color = '#ffffff';
        fSpan.style.fontWeight = '600';
        fSpan.style.background = 'var(--accent-purple)';
        fSpan.style.padding = '4px 12px';
        fSpan.style.borderRadius = '12px';
        cSpan.style.opacity = '0.6';
        cSpan.style.color = '#8b92a7';
        cSpan.style.fontWeight = '400';
        cSpan.style.background = 'transparent';
        cSpan.style.padding = '0';
    } else {
        // C is active
        toggleTrack.classList.add('active');
        toggleTrack.style.background = 'var(--accent-purple)';
        fSpan.style.opacity = '0.6';
        fSpan.style.color = '#8b92a7';
        fSpan.style.fontWeight = '400';
        fSpan.style.background = 'transparent';
        fSpan.style.padding = '0';
        cSpan.style.opacity = '1';
        cSpan.style.color = '#ffffff';
        cSpan.style.fontWeight = '600';
    }
}

function convertAllTemperatures() {
    // Convert main temperature
    const mainTemp = document.querySelector('.main-temp');
    if (mainTemp && mainTemp.dataset.celsius) {
        const celsius = parseFloat(mainTemp.dataset.celsius);
        mainTemp.textContent = convertTemp(celsius) + '°' + currentUnit;
    }

    // Convert feels like
    const feelsLike = document.querySelector('.feels-like');
    if (feelsLike && feelsLike.dataset.celsius) {
        const celsius = parseFloat(feelsLike.dataset.celsius);
        feelsLike.textContent = `Feels Like ${convertTemp(celsius)}°${currentUnit}`;
    }

    // Convert high/low
    const tempRange = document.querySelector('.temp-range');
    if (tempRange && tempRange.dataset.high && tempRange.dataset.low) {
        const high = parseFloat(tempRange.dataset.high);
        const low = parseFloat(tempRange.dataset.low);
        tempRange.textContent = `High: ${convertTemp(high)}° Low: ${convertTemp(low)}°`;
    }

    // Convert hourly forecast
    document.querySelectorAll('.f-temp').forEach(el => {
        if (el.dataset.celsius) {
            const celsius = parseFloat(el.dataset.celsius);
            el.textContent = convertTemp(celsius) + '°';
        }
    });

    // Convert daily forecast
    document.querySelectorAll('.daily-high').forEach(el => {
        if (el.dataset.celsius) {
            const celsius = parseFloat(el.dataset.celsius);
            el.textContent = convertTemp(celsius) + '°';
        }
    });

    document.querySelectorAll('.daily-low').forEach(el => {
        if (el.dataset.celsius) {
            const celsius = parseFloat(el.dataset.celsius);
            el.textContent = convertTemp(celsius) + '°';
        }
    });
}

function convertTemp(celsius) {
    if (currentUnit === 'F') {
        // Celsius to Fahrenheit: (C × 9/5) + 32
        return Math.round((celsius * 9 / 5) + 32);
    }
    return Math.round(celsius);
}

// Theme Management
function initTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    document.body.classList.toggle('light-theme');
}

function toggleAnimations() {
    animationsEnabled = !animationsEnabled;
    localStorage.setItem('animations', animationsEnabled);
    document.body.classList.toggle('no-animations', !animationsEnabled);
}

// Sidebar Navigation Functions
function initSidebarNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Handle different navigation items
            switch (index) {
                case 0: // Dashboard
                    showDashboard();
                    break;
                case 1: // Charts - just scroll to dashboard
                    showDashboard();
                    break;
                case 2: // Favorites
                    scrollToFavorites();
                    break;
                case 3: // Calendar
                    scrollToForecast();
                    break;
                case 4: // Settings
                    showSettings();
                    break;
            }
        });
    });

    // Theme toggle button in header
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function () {
            toggleTheme();
            updateThemeIcon();
        });
    }
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#themeToggleBtn i');
    if (themeIcon) {
        if (currentTheme === 'light') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
}

function showDashboard() {
    // Scroll to top to show main dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToFavorites() {
    const favSection = document.querySelector('.favorite-cities');
    if (favSection) {
        favSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scrollToForecast() {
    const forecastSection = document.querySelector('.daily-forecast-section');
    if (forecastSection) {
        forecastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        alert('5-day forecast will appear here after searching for a city!');
    }
}

function showSettings() {
    const settingsHTML = `
        <div class="settings-modal" id="settingsModal">
            <div class="settings-content">
                <div class="settings-header">
                    <h2><i class="fas fa-gear"></i> Settings</h2>
                    <button onclick="closeSettings()" class="close-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="settings-body">
                    <div class="setting-item">
                        <label>Temperature Unit</label>
                        <div class="toggle-group">
                            <button class="toggle-btn ${currentUnit === 'C' ? 'active' : ''}" onclick="changeUnit('C')">Celsius (°C)</button>
                            <button class="toggle-btn ${currentUnit === 'F' ? 'active' : ''}" onclick="changeUnit('F')">Fahrenheit (°F)</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label>Theme</label>
                        <div class="toggle-group">
                            <button class="toggle-btn ${currentTheme === 'dark' ? 'active' : ''}" onclick="changeTheme('dark')">Dark</button>
                            <button class="toggle-btn ${currentTheme === 'light' ? 'active' : ''}" onclick="changeTheme('light')">Light</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <label>Animations</label>
                        <div class="toggle-group">
                            <button class="toggle-btn ${animationsEnabled ? 'active' : ''}" onclick="changeAnimations(true)">Enabled</button>
                            <button class="toggle-btn ${!animationsEnabled ? 'active' : ''}" onclick="changeAnimations(false)">Disabled</button>
                        </div>
                    </div>
                    <div class="setting-item">
                        <button class="clear-favorites-btn" onclick="clearAllFavorites()">
                            <i class="fas fa-trash"></i> Clear All Favorites
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', settingsHTML);
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.remove();
    }
}

function clearAllFavorites() {
    if (confirm('Are you sure you want to clear all favorite cities?')) {
        favorites = [];
        localStorage.setItem('favoriteCities', JSON.stringify(favorites));
        updateFavoritesDisplay();
        checkIfCurrentCityIsFavorite();
        alert('All favorites cleared!');
    }
}

// Additional functions for settings modal
function changeUnit(unit) {
    if (unit !== currentUnit) {
        currentUnit = unit;
        localStorage.setItem('tempUnit', currentUnit);
        convertAllTemperatures();
        updateUnitToggleUI();
        closeSettings();
        showSettings(); // Reopen with updated state
    }
}

function changeTheme(theme) {
    if (theme !== currentTheme) {
        currentTheme = theme;
        localStorage.setItem('theme', currentTheme);
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        updateThemeIcon();
        closeSettings();
        showSettings(); // Reopen with updated state
    }
}

function changeAnimations(enabled) {
    animationsEnabled = enabled;
    localStorage.setItem('animations', enabled);
    document.body.classList.toggle('no-animations', !enabled);
    closeSettings();
    showSettings(); // Reopen with updated state
}
