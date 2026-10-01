import streamlit as st
import streamlit.components.v1 as components
import os
import base64
import json

st.set_page_config(
    page_title="Panda's Magical Birthday World | Ashitha's Celebration",
    page_icon="🐼",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Trigger reload for realistic graphics & natural colour grading v2.9 (clickable stage navigation, 360 panorama, stage restore)

# Hide Streamlit default UI elements
hide_streamlit_style = """
<style>
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    [data-testid="stToolbar"] {visibility: hidden; display: none !important;}
    [data-testid="stDecoration"] {visibility: hidden; display: none !important;}
    [data-testid="stStatusWidget"] {visibility: hidden; display: none !important;}
    .block-container {
        padding: 0rem !important;
        margin: 0rem !important;
        max-width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
    }
    iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        border: none !important;
        z-index: 999999 !important;
    }
    html, body {
        overflow: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
    }
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_file(relative_path):
    full_path = os.path.join(BASE_DIR, relative_path)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def get_audio_data_uri():
    audio_path = os.path.join(BASE_DIR, "static", "audio", "birthday_song.mp3")
    if not os.path.exists(audio_path):
        audio_path = os.path.join(BASE_DIR, "background song file", "அழகான நிலவே.mp3")
    
    if os.path.exists(audio_path):
        try:
            with open(audio_path, "rb") as f:
                b64 = base64.b64encode(f.read()).decode("utf-8")
                return f"data:audio/mp3;base64,{b64}"
        except Exception as e:
            print("Error loading audio:", e)
    return ""

def load_json(relative_path):
    content = read_file(relative_path)
    if content:
        try:
            return json.loads(content)
        except Exception:
            pass
    return {}

# Load components
css_content = read_file(os.path.join("static", "css", "style.css"))
audio_manager_js = read_file(os.path.join("static", "js", "AudioManager.js"))
environment_js = read_file(os.path.join("static", "js", "Environment.js"))
stage1_js = read_file(os.path.join("static", "js", "stages", "Stage1_Welcome.js"))
stage2_js = read_file(os.path.join("static", "js", "stages", "Stage2_Quiz.js"))
stage3_js = read_file(os.path.join("static", "js", "stages", "Stage3_Door.js"))
gift_reveal_js = read_file(os.path.join("static", "js", "stages", "MagicalGiftReveal.js"))
stage4_js = read_file(os.path.join("static", "js", "stages", "Stage4_Nature.js"))
stage5_js = read_file(os.path.join("static", "js", "stages", "Stage5_KingdomEntrance.js"))
stage_manager_js = read_file(os.path.join("static", "js", "StageManager.js"))
main_js = read_file(os.path.join("static", "js", "main.js"))

def get_model_b64(filename):
    path = os.path.join(BASE_DIR, "static", "models", filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return ""

quiz_data = load_json(os.path.join("static", "data", "quiz.json"))
memories_data = load_json(os.path.join("static", "data", "memories.json"))
gift_contents_data = load_json(os.path.join("static", "data", "gift_contents.json"))
audio_data_uri = get_audio_data_uri()
stork_b64 = get_model_b64("Stork.glb")
flamingo_b64 = get_model_b64("Flamingo.glb")
fox_b64 = get_model_b64("Fox.glb")
duck_b64 = get_model_b64("Duck.glb")
panda_b64 = get_model_b64("Panda.glb")

def get_texture_data_uri(filename, mime_type="image/jpeg"):
    path = os.path.join(BASE_DIR, "static", "textures", filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            return f"data:{mime_type};base64,{b64}"
    return ""

mountains_tex_uri = get_texture_data_uri("mountains_waterfall.jpg", "image/jpeg")
panda_fur_tex_uri = get_texture_data_uri("panda_fur.jpg", "image/jpeg")
meadow_tex_uri = get_texture_data_uri("meadow_flowers.jpg", "image/jpeg")
timber_tex_uri = get_texture_data_uri("weathered_timber.jpg", "image/jpeg")
blossom_tex_uri = get_texture_data_uri("cherry_blossom.png", "image/png")
castle_backdrop_uri = get_texture_data_uri("kingdom_castle_backdrop.jpg", "image/jpeg")
queen_panda_uri = get_texture_data_uri("queen_panda.png", "image/png")
cobble_tex_uri = get_texture_data_uri("cobblestone_terrace.jpg", "image/jpeg")
marble_tex_uri = get_texture_data_uri("royal_marble.jpg", "image/jpeg")
scenery_tex_uri = get_texture_data_uri("kingdom_scenery_clean.jpg", "image/jpeg")
queen_paw_uri = get_texture_data_uri("queen_panda_paw.png", "image/png")
queen_panda_gift_uri = get_texture_data_uri("queen_panda_royal_gift.png", "image/png")
royal_carpet_uri = get_texture_data_uri("royal_purple_carpet.jpg", "image/jpeg")
royal_tapestry_uri = get_texture_data_uri("royal_throne_tapestry.jpg", "image/jpeg")
royal_chest_uri = get_texture_data_uri("royal_treasure_chest.jpg", "image/jpeg")
royal_chest_cutout_uri = get_texture_data_uri("royal_treasure_chest_cutout.png", "image/png")
king_panda_mama_uri = get_texture_data_uri("king_panda_mama.png", "image/png")
if not king_panda_mama_uri:
    king_panda_mama_uri = get_texture_data_uri("king_panda_mama.jpg", "image/jpeg")
royal_celebration_cinematic_uri = get_texture_data_uri("royal_celebration_cinematic.jpg", "image/jpeg")
panda_hug_uri = get_texture_data_uri("panda_royal_hug.jpg", "image/jpeg")
panda_walk_uri = get_texture_data_uri("panda_royal_walk.jpg", "image/jpeg")
castle_establishing_uri = get_texture_data_uri("royal_castle_establishing.jpg", "image/jpeg")

def get_photo_data_uri(filename, mime_type="image/jpeg"):
    path = os.path.join(BASE_DIR, "static", "photos", filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
            return f"data:{mime_type};base64,{b64}"
    return ""

photo1_data_uri = get_photo_data_uri("photo_memory_1.jpg")
photo2_data_uri = get_photo_data_uri("photo_memory_2.jpg")

# Direct stage navigation via query parameter (e.g. ?stage=5)
initial_stage = 1
try:
    if "stage" in st.query_params:
        initial_stage = int(st.query_params["stage"])
except Exception:
    initial_stage = 1

# Build self-contained HTML page
bundled_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>Panda's Magical Birthday World | Ashitha</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <style>
{css_content}
  </style>
</head>
<body>
  <!-- Three.js Canvas Container -->
  <div id="webgl-canvas-container"></div>

  <!-- Loading Screen -->
  <div id="loading-screen" style="position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: #080710; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.8s ease;">
    <div style="font-size: 52px; animation: pulse-glow 2s infinite alternate; margin-bottom: 20px;">🌸</div>
    <div style="font-family: 'Cinzel Decorative', cursive; color: #fbcfe8; font-size: 24px; letter-spacing: 2px;">AWAKENING PANDA'S REALM</div>
    <div style="color: #d4af37; font-size: 13px; margin-top: 10px; letter-spacing: 1px;">Crafting sunlight, flowers & memories for Ashitha...</div>
  </div>

  <!-- UI Overlay -->
  <div id="ui-overlay">
    <!-- Top Header -->
    <header class="top-header">
      <div class="brand-badge">
        <div class="brand-icon">🐼</div>
        <div class="brand-text">
          <h1>PANDA'S REALM</h1>
          <p>October 1st • Ashitha's 3D World</p>
        </div>
      </div>

      <div class="stage-tracker" id="stage-tracker">
        <!-- Injected dynamically by StageManager -->
      </div>

      <div class="header-controls">
        <div id="inventory-slot" class="inventory-slot"></div>
        <button id="refresh-btn" class="glass-btn interactive" title="Refresh & Restart Entire Journey">
          <span>🔄</span> <span>Refresh</span>
        </button>
        <button id="music-toggle-btn" class="glass-btn interactive">
          <span>🎵</span> <span>Play Music</span>
        </button>
        <button id="fullscreen-btn" class="glass-btn interactive">
          <span>⛶</span> <span>Fullscreen</span>
        </button>
      </div>
    </header>

    <!-- Center Interactive Modal Layer -->
    <main class="center-modal-layer" id="modal-container">
      <!-- Dynamic Stage Content -->
    </main>

    <!-- Bottom Controls & Hints -->
    <footer class="bottom-bar">
      <div class="hint-pill">
        <span class="hint-icon">✦</span>
        <span id="hint-text">Interact with the Welcome Greeting to begin your journey.</span>
      </div>

      <div class="hint-pill">
        <span>🖱️ Drag to look around • Scroll to zoom</span>
      </div>
    </footer>
  </div>

  <!-- Notification Toast -->
  <div id="toast" class="toast-msg"></div>

  <!-- Preloaded Data -->
  <script>
    window.INITIAL_STAGE = {initial_stage};
    window.PRELOADED_QUIZ = {json.dumps(quiz_data)};
    window.PRELOADED_MEMORIES = {json.dumps(memories_data)};
    window.PRELOADED_AUDIO_URI = "{audio_data_uri}";
    window.PRELOADED_STORK_B64 = "{stork_b64}";
    window.PRELOADED_FLAMINGO_B64 = "{flamingo_b64}";
    window.PRELOADED_FOX_B64 = "{fox_b64}";
    window.PRELOADED_DUCK_B64 = "{duck_b64}";
    window.PRELOADED_PANDA_B64 = "{panda_b64}";
    window.TEX_MOUNTAINS_URI = "{mountains_tex_uri}";
    window.TEX_PANDA_FUR_URI = "{panda_fur_tex_uri}";
    window.TEX_MEADOW_URI = "{meadow_tex_uri}";
    window.TEX_TIMBER_URI = "{timber_tex_uri}";
    window.TEX_BLOSSOM_URI = "{blossom_tex_uri}";
    window.TEX_CASTLE_BACKDROP_URI = "{castle_backdrop_uri}";
    window.TEX_QUEEN_PANDA_URI = "{queen_panda_uri}";
    window.TEX_COBBLE_URI = "{cobble_tex_uri}";
    window.TEX_MARBLE_URI = "{marble_tex_uri}";
    window.TEX_KINGDOM_SCENERY_URI = "{scenery_tex_uri}";
    window.TEX_QUEEN_PAW_URI = "{queen_paw_uri}";
    window.TEX_QUEEN_PANDA_GIFT_URI = "{queen_panda_gift_uri}";
    window.TEX_ROYAL_CARPET_URI = "{royal_carpet_uri}";
    window.TEX_ROYAL_TAPESTRY_URI = "{royal_tapestry_uri}";
    window.TEX_ROYAL_CHEST_URI = "{royal_chest_uri}";
    window.TEX_ROYAL_CHEST_CUTOUT_URI = "{royal_chest_cutout_uri}";
    window.TEX_KING_PANDA_MAMA_URI = "{king_panda_mama_uri}";
    window.TEX_CELEBRATION_CINEMATIC_URI = "{royal_celebration_cinematic_uri}";
    window.TEX_PANDA_HUG_URI = "{panda_hug_uri}";
    window.TEX_PANDA_WALK_URI = "{panda_walk_uri}";
    window.TEX_CASTLE_ESTABLISHING_URI = "{castle_establishing_uri}";
    window.VIDEO_CELEBRATION_PATH = "/app/static/video/birthday_celebration.mp4";
    window.GIFT_CONTENTS = {json.dumps(gift_contents_data)};
    window.PHOTO1_DATA_URI = "{photo1_data_uri}";
    window.PHOTO2_DATA_URI = "{photo2_data_uri}";
  </script>

  <!-- Vendor Libraries -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

  <!-- Application Logic -->
  <script>
{audio_manager_js}
  </script>
  <script>
{environment_js}
  </script>
  <script>
{stage1_js}
  </script>
  <script>
{stage2_js}
  </script>
  <script>
{stage3_js}
  </script>
  <script>
{gift_reveal_js}
  </script>
  <script>
{stage4_js}
  </script>
  <script>
{stage5_js}
  </script>
  <script>
{stage_manager_js}
  </script>
  <script>
{main_js}
  </script>
</body>
</html>
"""

components.html(bundled_html, height=950, scrolling=False)
