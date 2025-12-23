# Weather Dashboard - Flask Application

A modern, responsive Weather Web Application built with Python, Flask, and the OpenWeather API.

## Features
- **Real-Time Data**: Fetches live weather information using OpenWeather API.
- **Premium UI**: Clean, responsive design with Glassmorphism effects and micro-animations.
- **Error Handling**: Graceful handling of invalid city names, empty inputs, and network failures.
- **Mobile Friendly**: Fully responsive layout.

## Technologies Used
- **Backend**: Python, Flask, Requests
- **Frontend**: HTML5, CSS3, Jinja2, Font Awesome, Google Fonts
- **API**: OpenWeatherMap API

## Setup Instructions

1. **Clone the project**
   ```bash
   # Navigate to the project directory
   cd "Weather Dashboard"
   ```

2. **Install dependencies**
   ```bash
   pip install flask requests
   ```

3. **Get an API Key**
   - Sign up at [OpenWeatherMap](https://openweathermap.org/api).
   - Generate a free API key (current weather data).

4. **Configure API Key**
   - Open `app.py`.
   - Replace `"YOUR_API_KEY"` with your actual key.

5. **Run the application**
   ```bash
   python app.py
   ```
   - Open your browser and navigate to `http://127.0.0.1:5000`.

## Project Structure
- `app.py`: Main Flask application and API logic.
- `templates/index.html`: Main UI template.
- `static/style.css`: Premium styling and animations.
- `README.md`: Project documentation.

## Deployment Suggestions
- **Heroku**: Use `gunicorn` and a `Procfile`.
- **Render/Railway**: Easy integration with GitHub repositories.
- **AWS/GCP**: For more scalable deployments using Docker or App Engine.

## Interview Talking Points
- **Architecture**: Explained the Model-View-Controller (MVC) approach using Flask and Jinja2.
- **Error Handling**: Highlighted how the app prevents crashes by validating user input and handling API status codes.
- **User Experience**: Focused on "Glassmorphism" to provide a premium feel, which is a modern trend in UI/UX design.
- **API Integration**: Demonstrated proficiency in handling asynchronous-like HTTP requests and parsing JSON data.
