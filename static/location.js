document.addEventListener('DOMContentLoaded', () => {
    const locationBtn = document.getElementById('locationBtn');
    
    // Geolocation Handler
    if (locationBtn) {
        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationBtn.classList.add('loading'); // You can add CSS for spinning
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;
                        // Redirect to backend with lat/lon
                        window.location.href = `/?lat=${lat}&lon=${lon}`;
                    },
                    (error) => {
                        alert("Unable to retrieve your location. Please ensure location services are enabled.");
                        console.error(error);
                        locationBtn.classList.remove('loading');
                    }
                );
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        });
    }

    // Unit Toggle Handler
    const unitToggle = document.querySelector('.unit-toggle');
    if (unitToggle) {
        unitToggle.addEventListener('click', () => {
            const currentUrl = new URL(window.location.href);
            const currentUnits = currentUrl.searchParams.get('units') || 'metric';
            const newUnits = currentUnits === 'metric' ? 'imperial' : 'metric';
            
            currentUrl.searchParams.set('units', newUnits);
            window.location.href = currentUrl.toString();
        });
    }
});
