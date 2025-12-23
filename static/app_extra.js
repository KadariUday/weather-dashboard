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
