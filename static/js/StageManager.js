/**
 * StageManager.js
 * Central controller orchestrating all 10 stages in Panda's Magical Birthday World.
 */
class StageManager {
  constructor(scene, camera, renderer, controls) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.controls = controls;

    this.currentStageNum = 1;
    this.stages = {};
    this.collectedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_golden_key') === 'true');
    this.keyActivated = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_key_activated') === 'true');
    this.giftsRevealed = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_gifts_revealed') === 'true');

    this.initStageRegistry();
    this.initHudEvents();
  }

  initStageRegistry() {
    this.stages[1] = new Stage1_Welcome(this);
    this.stages[2] = new Stage2_Quiz(this);
    this.stages[3] = new Stage3_Door(this);
    this.stages[4] = new Stage4_Nature(this);
    if (window.Stage5_KingdomEntrance) {
      this.stages[5] = new Stage5_KingdomEntrance(this);
    }
    // Stages 6 through 10 will be registered progressively as we build them
  }

  initHudEvents() {
    const musicBtn = document.getElementById('music-toggle-btn');
    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        window.audioManager.toggleBgm();
      });
    }

    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.resetJourney();
      });
    }

    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => {
            console.warn("Fullscreen request error:", err);
          });
          fsBtn.innerHTML = '<span>🗗</span> <span>Exit Fullscreen</span>';
        } else {
          document.exitFullscreen();
          fsBtn.innerHTML = '<span>⛶</span> <span>Fullscreen</span>';
        }
      });
    }

    // Track page lifecycle
    window.addEventListener('beforeunload', () => {
      // Keep session stage unless reset was explicitly clicked
    });
  }

  clearPersistedProgress() {
    try {
      localStorage.removeItem('panda_golden_key');
      localStorage.removeItem('panda_key_activated');
      localStorage.removeItem('panda_gifts_revealed');
      localStorage.removeItem('panda_opened_gifts');
      localStorage.removeItem('panda_current_stage');
      localStorage.removeItem('panda_secret_answered');
      localStorage.removeItem('panda_chest_question_answered');
      localStorage.removeItem('panda_chest_unlocked');
      localStorage.removeItem('panda_ring_revealed');
      localStorage.removeItem('panda_celebration_completed');
      sessionStorage.removeItem('panda_active_stage');
    } catch (e) {
      console.warn("Storage clear error:", e);
    }
    this.collectedKey = false;
    this.keyActivated = false;
    this.giftsRevealed = false;
    const slot = document.getElementById('inventory-slot');
    if (slot) slot.innerHTML = '';
  }

  resetJourney() {
    console.log("Resetting Panda's Magical Birthday World (full fresh restart)...");
    this.clearPersistedProgress();

    // Reset Stage 4 state if already active
    if (this.stages[4]) {
      this.stages[4].hasCollectedKey = false;
      this.stages[4].hasDismissedVillageIntro = false;
      if (this.stages[4].giftReveal) {
        this.stages[4].giftReveal.keyActivated = false;
        this.stages[4].giftReveal.giftsRevealed = false;
        this.stages[4].giftReveal.openedGifts = [];
      }
    }

    // Clean up any active overlays / modals
    const modalIds = [
      'gift-surprise-modal',
      'kingdom-password-modal',
      'kingdom-entrance-modal',
      'village-intro-modal',
      'key-found-modal',
      'pedestal-interaction-modal',
      'queen-welcome-dialogue',
      'kingdom-top-badge',
      'btn-return-to-village',
      'kingdom-center-hint',
      'kingdom-right-hint',
      'royal-chest-question-modal',
      'royal-celebration-card',
      'royal-video-modal',
      'royal-ring-banner',
      'royal-chest-hover-prompt'
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });

    const pill = document.getElementById('gifts-progress-pill');
    if (pill) pill.remove();

    const tip = document.querySelector('.butterfly-tooltip');
    if (tip) tip.remove();

    const keyTip = document.querySelector('.key-tooltip');
    if (keyTip) keyTip.remove();

    if (window.audioManager && window.audioManager.playChime) {
      window.audioManager.playChime(1.2);
    }

    // Full clean reload to ensure all Three.js scenes, key, and stage 1 restart completely fresh
    try {
      window.location.href = window.location.pathname;
    } catch (e) {
      this.goToStage(1);
    }
  }

  update(deltaTime) {
    if (this.stages[this.currentStageNum] && typeof this.stages[this.currentStageNum].update === 'function') {
      this.stages[this.currentStageNum].update(deltaTime);
    }
  }

  start() {
    let targetStage = 1;
    try {
      if (typeof window.INITIAL_STAGE === 'number' && window.INITIAL_STAGE >= 1 && window.INITIAL_STAGE <= 10) {
        targetStage = window.INITIAL_STAGE;
      }
      if (targetStage === 1) {
        let topSearch = window.location.search;
        try {
          if (window.top && window.top.location && window.top.location.search) {
            topSearch = window.top.location.search;
          }
        } catch(e) {}
        const params = new URLSearchParams(topSearch);
        const urlStage = parseInt(params.get('stage'), 10);
        if (urlStage >= 1 && urlStage <= 10) {
          targetStage = urlStage;
        } else {
          const savedStage = parseInt(sessionStorage.getItem('panda_active_stage'), 10);
          if (savedStage >= 1 && savedStage <= 10) {
            targetStage = savedStage;
          }
        }
      }
    } catch(e) {}

    if (targetStage !== 1) {
      console.log(`Resuming Panda's World at Stage ${targetStage}...`);
      this.goToStage(targetStage);
    } else {
      this.clearPersistedProgress();
      this.goToStage(1);
    }
  }

  goToStage(stageNumber) {
    console.log(`Transitioning to Stage ${stageNumber}...`);
    
    // Clean up current stage if needed
    if (this.stages[this.currentStageNum] && typeof this.stages[this.currentStageNum].cleanup === 'function') {
      try {
        this.stages[this.currentStageNum].cleanup();
      } catch (e) {
        console.warn("Cleanup error for stage", this.currentStageNum, e);
      }
    }

    this.currentStageNum = stageNumber;
    try {
      sessionStorage.setItem('panda_active_stage', stageNumber);
    } catch(e) {}

    // When entering Stage 5, ensure the golden key HUD indicator is displayed
    if (stageNumber === 5) {
      this.collectedKey = true;
      const slot = document.getElementById('inventory-slot');
      if (slot && !slot.querySelector('.inventory-badge')) {
        slot.innerHTML = `
          <div class="inventory-badge active" title="Magical Golden Key found in Panda Village">
            <span class="badge-icon">🔑</span>
            <span class="badge-text">Golden Key Collected</span>
          </div>
        `;
      }
    }

    if (this.stages[stageNumber]) {
      this.stages[stageNumber].enter();
    } else {
      // Stage under development notice
      this.updateTracker(stageNumber);
      const container = document.getElementById('modal-container');
      container.innerHTML = `
        <div class="glass-card interactive">
          <div class="card-tag">🚧 Stage ${stageNumber} Ready for Construction</div>
          <h2 class="card-title">Journey Progress Saved</h2>
          <p class="card-description">
            Stage ${stageNumber - 1} completed flawlessly! 
            The gates are holding steady while we assemble the next scene step-by-step.
          </p>
          <div class="card-actions">
            <button class="btn-primary" onclick="stageManager.goToStage(${stageNumber - 1})">
              <span>↩️</span> <span>Return to Stage ${stageNumber - 1}</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  updateTracker(currentStage) {
    const tracker = document.getElementById('stage-tracker');
    if (!tracker) return;

    const stageNames = {
      1: "Stage 1: 🌸 Welcome Greeting",
      2: "Stage 2: 🧩 Love & Memory Quiz",
      3: "Stage 3: 🚪 Mystical Wooden Door",
      4: "Stage 4: 🏞️ Panda Village & Golden Key",
      5: "Stage 5: 👑 Panda Kingdom",
      6: "Stage 6: ✨ Celestial Wish Portal",
      7: "Stage 7: 🏰 Fairytale Castle & Fountains",
      8: "Stage 8: 💍 Royal Ring Treasure Chest",
      9: "Stage 9: 🎶 Romantic Birthday Melody",
      10: "Stage 10: 🎉 Eternal Birthday Celebration"
    };

    let html = '';
    const totalStages = 10;
    for (let i = 1; i <= totalStages; i++) {
      let statusClass = '';
      if (i < currentStage) statusClass = 'completed';
      else if (i === currentStage) statusClass = 'active';

      const sName = stageNames[i] || `Stage ${i}`;
      html += `<div class="stage-pill ${statusClass} interactive" data-stage="${i}" style="cursor: pointer;" title="${sName} (Click to switch)"></div>`;
    }
    tracker.innerHTML = html;

    // Attach click listener so the user can easily jump to any stage directly!
    tracker.querySelectorAll('.stage-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = parseInt(pill.getAttribute('data-stage'), 10);
        if (target && target !== this.currentStageNum) {
          console.log(`Direct navigation via tracker to Stage ${target}`);
          this.goToStage(target);
        }
      });
    });

    const hintText = document.getElementById('hint-text');
    if (hintText) {
      const stageHints = {
        1: "Interact with the Welcome Greeting to begin your journey.",
        2: "Solve the playful riddle to unlock the ancient portal.",
        3: "Watch the ornate magical door open into nature.",
        4: "Explore Panda Village to discover the hidden golden key! 🔑",
        5: "Discover Queen Panda and explore your 3D Royal Kingdom! 👑",
        6: "Step into the celestial wish portal.",
        7: "Behold the grand Fairytale Castle & crystal fountains.",
        8: "Unlock the royal treasure chest to reveal your 3D ring.",
        9: "Pass through the final threshold and listen to your song.",
        10: "Happy Birthday Ashitha! Enjoy your eternal magical realm."
      };
      hintText.innerText = stageHints[currentStage] || "Explore Panda's Realm";
    }
  }
}

window.StageManager = StageManager;

