# To run this code you need to install the following dependencies:
# pip install google-genai python-dotenv

import base64
import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# .env dosyasından değişkenleri yükle
load_dotenv()


def generate():
    # Input parametreleri
    inputs = {
        # --- Soil ---
        "soil_texture": "tınlı",          # kumlu/killi/tınlı vb.
        "pH": 6.7,
        "ec": None,                       # örn 1.2 (dS/m) yoksa None
        "organic_matter": 2.3,            # %
        "nitrogen_N": 45,                 # N
        "phosphorus_P": 30,               # P
        "potassium_K": 35,                # K
        "lime_caCO3": None,               # %
        "cec": None,

        # --- Climate ---
        "avg_temp_c": 22.5,
        "min_temp_c": None,
        "max_temp_c": None,
        "rainfall_mm": 120,
        "humidity_pct": 55,
        "drought_index": None,

        # --- Location/Time ---
        "country": "Türkiye",
        "province": "Konya",
        "district": None,
        "lat": None,
        "lon": None,
        "season": "ilkbahar",
        "month": 4,

        # --- Constraints ---
        "irrigation": "orta",             # yok/az/orta/iyi
        "previous_crop": "buğday",
        "goal": "düşük su + düşük risk"
    }

    # Prompt oluştur
    prompt = f"""
Sen bir ziraat karar-destek asistanısın.
Amaç: Verilen toprak + iklim + kısıt parametrelerine göre en uygun ürünleri öner.

KULLANILAN PARAMETRELER (girdi alanları):
A) Toprak: soil_texture, soil_type, pH, ec, organic_matter, nitrogen_N, phosphorus_P, potassium_K, calcium_Ca, magnesium_Mg,
          sulfur_S, zinc_Zn, iron_Fe, manganese_Mn, copper_Cu, boron_B, cec, lime_caCO3, bulk_density
B) İklim: avg_temp_c, min_temp_c, max_temp_c, rainfall_mm, humidity_pct, solar_radiation, wind_speed, frost_days, drought_index
C) Konum/Zaman: country, province, district, lat, lon, elevation_m, season, month
D) Kısıtlar: irrigation, field_area_da, soil_depth_cm, previous_crop, goal

KURALLAR:
- Cevap Türkçe olacak.
- Çıktı SADECE JSON olacak (başka açıklama yazma).
- JSON şeması:
  {{
    "primary_crop": "string",
    "alternatives": ["string", "string", "string"],
    "confidence": 0-100,
    "reasons": ["..."],
    "risks": ["..."],
    "quick_actions": ["..."],
    "missing_inputs": ["..."],
    "assumptions": ["..."]
  }}
- Eğer bazı girdiler None ise, bunları "missing_inputs" içine yaz ve gerekirse makul varsayım yap; varsayımları "assumptions" içine yaz.
- Önerilerde 'goal' ve 'irrigation' alanlarını mutlaka dikkate al.
- 'previous_crop' verilmişse münavebe mantığıyla aynı ürün tekrarına temkinli yaklaş.

GİRDİ (JSON):
{json.dumps(inputs, ensure_ascii=False, indent=2)}
"""
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemma-3-27b-it"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    tools = [
        types.Tool(googleSearch=types.GoogleSearch(
        )),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        system_instruction="",  # System prompt buraya eklenecek
        tools=tools,
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")

if __name__ == "__main__":
    generate()
