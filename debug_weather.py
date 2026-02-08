import requests

API_KEY = "59e18a63e3539a96f2bd5418c79620b3"
CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"

def test_weather(city="London", units="metric"):
    params = {"q": city, "appid": API_KEY, "units": units}
    response = requests.get(CURRENT_URL, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"City: {data['name']}")
        print(f"Temp: {data['main']['temp']} {units}")
        print(f"Raw: {data}")
    else:
        print(f"Error: {response.status_code}")

if __name__ == "__main__":
    print("Testing Metric (Celsius)...")
    test_weather(units="metric")
    print("\nTesting Imperial (Fahrenheit)...")
    test_weather(units="imperial")
