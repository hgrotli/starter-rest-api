import json
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS

API_KEY1 = "json"
API_KEY2 = "vcard"

app = Flask(__name__)
CORS(app)

def fetch_data(*, update: bool = False, json_cache: str, url: str):
    if update:
        json_data = None
    else:
        try:
            with open(json_cache, "r") as file:
                json_data = json.load(file)
                print("fetched from local cache")
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"No local cache found... ({e})")
            json_data = None
    if not json_data:
        print("fetching new json data - (creating local cache)")
        json_data = requests.get(url).json()
        with open(json_cache, "w") as file:
            json.dump(json_data, file)
    return json_data

@app.route("/")
def hello():
    return "Velkommen til vår cache"

@app.route("/proxy/cacheJson", methods=["POST"])
def proxy_cache_json():
    # Add the password validation logic here
    password = request.json.get("password")
    if password != API_KEY1:
        print("Wrong API key")
        return {"message": "Invalid API key"}, 401
    url = "http://localhost:6438/contacts"
    json_cache = "cacheJson.json"
    data: dict = fetch_data(update=False, json_cache=json_cache, url=url)
    with open(json_cache, "r") as file:
        data = json.load(file)
    return jsonify(data)

@app.route("/proxy/cacheVcard", methods=["POST"])
def proxy_cache_vcard():
    # Add the password validation logic here
    password = request.json.get("password")
    if password != API_KEY2:
        print("Wrong API key")
        return {"message": "Invalid API key"}, 401
    url = "http://localhost:6438/contacts/vcard"
    json_cache = "cacheVcard.json"
    data: dict = fetch_data(update=False, json_cache=json_cache, url=url)
    with open(json_cache, "r") as file:
        data = json.load(file)
    return jsonify(data)

@app.route("/update_cache")
def update_cache():
    json_cache = "cacheJson.json"
    vcard_cache = "cacheVcard.json"

    # Update the cache JSON files
    url = "http://localhost:6438/contacts"
    json_data = requests.get(url).json()
    with open(json_cache, "w") as file:
        json.dump(json_data, file)
    url = "http://localhost:6438/contacts/vcard"
    vcard_data = requests.get(url).json()
    with open(vcard_cache, "w") as file:
        json.dump(vcard_data, file)
    return "Cache updated"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5555)
