import requests
from flask import Flask, render_template, request
from datetime import datetime

app = Flask(__name__)

# OpenWeather API Configuration
API_KEY = "59e18a63e3539a96f2bd5418c79620b3"
CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

@app.route("/", methods=["GET", "POST"])
def index():
    weather_data = None
    forecast_data = None
    daily_forecast = None
    error_message = None
    city = "London"  # Default city

    if request.method == "POST":
        city = request.form.get("city")
    
    if not city:
        error_message = "Please enter a city name."
    else:
        try:
            # 1. Fetch Current Weather
            params = {"q": city, "appid": API_KEY, "units": "metric"}
            curr_resp = requests.get(CURRENT_URL, params=params)
            
            if curr_resp.status_code == 200:
                data = curr_resp.json()
                
                # Get coordinates for UV index
                lat = data["coord"]["lat"]
                lon = data["coord"]["lon"]
                
                # Fetch UV Index
                uv_index = 0
                try:
                    uv_url = f"https://api.openweathermap.org/data/2.5/uvi?lat={lat}&lon={lon}&appid={API_KEY}"
                    uv_resp = requests.get(uv_url)
                    if uv_resp.status_code == 200:
                        uv_data = uv_resp.json()
                        uv_index = round(uv_data.get("value", 0))
                except:
                    uv_index = 0
                
                # Get rain probability from current weather (if available)
                rain_chance = 0
                if "rain" in data:
                    # If it's currently raining, set high probability
                    rain_chance = 80
                elif data["weather"][0]["main"].lower() in ["clouds", "drizzle"]:
                    rain_chance = 40
                
                weather_data = {
                    "city": data["name"],
                    "country": data["sys"]["country"],
                    "temp": round(data["main"]["temp"]),
                    "description": data["weather"][0]["description"].capitalize(),
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "icon": data["weather"][0]["icon"],
                    "feels_like": round(data["main"]["feels_like"]),
                    "high": round(data["main"]["temp_max"]),
                    "low": round(data["main"]["temp_min"]),
                    "sunrise": datetime.fromtimestamp(data["sys"]["sunrise"]).strftime('%I:%M %p'),
                    "sunset": datetime.fromtimestamp(data["sys"]["sunset"]).strftime('%I:%M %p'),
                    "date": datetime.now().strftime('%A, %d %b %Y'),
                    "condition": data["weather"][0]["main"].lower(),  # For background animation
                    "uv_index": uv_index,
                    "rain_chance": rain_chance
                }

                # 2. Fetch Forecast (for hourly/daily data)
                fore_resp = requests.get(FORECAST_URL, params=params)
                if fore_resp.status_code == 200:
                    f_data = fore_resp.json()
                    
                    # Calculate rain probability from next 24 hours
                    rain_prob = 0
                    rain_count = 0
                    for item in f_data["list"][:8]:  # Next 24 hours (8 x 3-hour intervals)
                        if "rain" in item or item["weather"][0]["main"].lower() in ["rain", "drizzle", "thunderstorm"]:
                            rain_count += 1
                    if rain_count > 0:
                        rain_prob = min(100, (rain_count / 8) * 100)
                    
                    # Update rain chance with forecast data
                    weather_data["rain_chance"] = round(rain_prob) if rain_prob > 0 else weather_data["rain_chance"]
                    
                    # Hourly forecast (first 7 items)
                    forecast_list = []
                    for item in f_data["list"][:7]:
                        forecast_list.append({
                            "time": datetime.fromtimestamp(item["dt"]).strftime('%I %p'),
                            "temp": round(item["main"]["temp"]),
                            "icon": item["weather"][0]["icon"]
                        })
                    forecast_data = forecast_list
                    
                    # Daily forecast (5 days)
                    daily_data = {}
                    for item in f_data["list"]:
                        date = datetime.fromtimestamp(item["dt"]).strftime('%Y-%m-%d')
                        if date not in daily_data:
                            daily_data[date] = {
                                "temps": [],
                                "icon": item["weather"][0]["icon"],
                                "description": item["weather"][0]["description"]
                            }
                        daily_data[date]["temps"].append(item["main"]["temp"])
                    
                    # Process daily summaries
                    daily_list = []
                    for date, info in list(daily_data.items())[:5]:
                        daily_list.append({
                            "day": datetime.strptime(date, '%Y-%m-%d').strftime('%a'),
                            "date": datetime.strptime(date, '%Y-%m-%d').strftime('%d %b'),
                            "high": round(max(info["temps"])),
                            "low": round(min(info["temps"])),
                            "icon": info["icon"],
                            "description": info["description"].capitalize()
                        })
                    daily_forecast = daily_list
                
            elif curr_resp.status_code == 404:
                error_message = f"City '{city}' not found."
            else:
                error_message = "API error. Please try again."
        
        except requests.exceptions.RequestException:
            error_message = "Network error."

    return render_template("index.html", weather=weather_data, forecast=forecast_data, 
                         daily=daily_forecast, error=error_message)

if __name__ == "__main__":
    app.run(debug=True)
