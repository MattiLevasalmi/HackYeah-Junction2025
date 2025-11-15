import os
import time
import re
import requests
import pygame
from dotenv import load_dotenv
from transformers import pipeline

# ----------------------------
# LOAD CONFIG
# ----------------------------
load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("VOICE_ID")

# ----------------------------
# INITIALIZE TEXT GENERATION PIPELINE
# ----------------------------
generator = pipeline(
    "text-generation",
    model="distilgpt2",
    device=-1
)

# ----------------------------
# SIMULATED SAUNA CONTROL
# ----------------------------
current_temperature = 60
current_humidity = 22

def set_temperature(temp):
    global current_temperature
    current_temperature = temp
    print(f"[SAUNA] Temperature set to {temp}°C")

def set_humidity(hum):
    global current_humidity
    current_humidity = hum
    print(f"[SAUNA] Humidity set to {hum}%")

# ----------------------------
# ELEVENLABS TTS (SAFE)
# ----------------------------
def speak_text(text, filename="sample_audio.mp3"):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}
    payload = {"text": text, "voice_settings": {"stability": 0.7, "similarity_boost": 0.8}}
    response = requests.post(url, json=payload, headers=headers)

    # safely stop pygame before writing new file
    if os.path.exists(filename):
        try:
            pygame.mixer.music.stop()
            pygame.mixer.quit()
            time.sleep(0.3)
        except:
            pass

    with open(filename, "wb") as f:
        f.write(response.content)

    pygame.mixer.init()
    pygame.mixer.music.load(filename)
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)
    pygame.mixer.music.stop()
    pygame.mixer.quit()

# ----------------------------
# AI fallback
# ----------------------------
def generate_ai_response(user_input):
    prompt = f"You are a calm, friendly, and intelligent sauna assistant.\nUser: {user_input}\nAI:"
    output = generator(prompt, max_length=100, do_sample=True, temperature=0.7)
    text = output[0]["generated_text"].split("AI:")[-1].strip()
    return text.split("\n")[0]

# ----------------------------
# STATE FOR FOLLOW-UP QUESTIONS
# ----------------------------
awaiting = {
    "type": None,   # "temp" or "hum"
    "direction": None  # "increase" or "decrease"
}

# ----------------------------
# HANDLE COMMANDS
# ----------------------------
def handle_sauna_command(user_command):
    global current_temperature, current_humidity, awaiting
    cmd = user_command.lower()
    number_match = re.search(r"\d+", cmd)

    # Check if user is replying to a follow-up
    if awaiting["type"]:
        if number_match:
            amount = int(number_match.group())
            if awaiting["type"] == "temp":
                if awaiting["direction"] == "increase":
                    new_temp = current_temperature + amount
                    set_temperature(new_temp)
                    awaiting = {"type": None, "direction": None}
                    return f"Got it, temperature increased to {new_temp}°C."
                else:
                    new_temp = current_temperature - amount
                    set_temperature(new_temp)
                    awaiting = {"type": None, "direction": None}
                    return f"Alright, temperature decreased to {new_temp}°C."
            elif awaiting["type"] == "hum":
                if awaiting["direction"] == "increase":
                    new_hum = current_humidity + amount
                    set_humidity(new_hum)
                    awaiting = {"type": None, "direction": None}
                    return f"Okay, humidity increased to {new_hum}%."
                else:
                    new_hum = current_humidity - amount
                    set_humidity(new_hum)
                    awaiting = {"type": None, "direction": None}
                    return f"Okay, humidity decreased to {new_hum}%."
        else:
            message = "Please tell me a number."
            speak_text(message)
            return message

    # Normal control
    if "temperature" in cmd:
        prev = current_temperature
        if "increase" in cmd:
            if number_match:
                new_temp = prev + int(number_match.group())
                set_temperature(new_temp)
                return f"Temperature increased from {prev}°C to {new_temp}°C."
            else:
                awaiting = {"type": "temp", "direction": "increase"}
                message = "By how many degrees should I increase the temperature?"
                speak_text(message)
                return message

        elif "decrease" in cmd:
            if number_match:
                new_temp = prev - int(number_match.group())
                set_temperature(new_temp)
                return f"Temperature decreased from {prev}°C to {new_temp}°C."
            else:
                awaiting = {"type": "temp", "direction": "decrease"}
                message = "By how many degrees should I decrease the temperature?"
                speak_text(message)
                return message

    if "humidity" in cmd:
        prev = current_humidity
        if "increase" in cmd:
            if number_match:
                new_hum = prev + int(number_match.group())
                set_humidity(new_hum)
                return f"Humidity increased from {prev}% to {new_hum}%."
            else:
                awaiting = {"type": "hum", "direction": "increase"}
                message = "By how much should I increase the humidity?"
                speak_text(message)
                return message

        elif "decrease" in cmd:
            if number_match:
                new_hum = prev - int(number_match.group())
                set_humidity(new_hum)
                return f"Humidity decreased from {prev}% to {new_hum}%."
            else:
                awaiting = {"type": "hum", "direction": "decrease"}
                message = "By how much should I decrease the humidity?"
                speak_text(message)
                return message

    return generate_ai_response(user_command)

# ----------------------------
# MAIN LOOP
# ----------------------------
if __name__ == "__main__":
    print("Say 'Hey Sauna' and enter your command (type 'exit' to quit).")
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break

        if "hey sauna" in user_input.lower() or awaiting["type"]:
            user_command = user_input.lower().replace("hey sauna", "").strip()
            ai_text = handle_sauna_command(user_command)
            print(f"AI: {ai_text}")
            speak_text(ai_text)
