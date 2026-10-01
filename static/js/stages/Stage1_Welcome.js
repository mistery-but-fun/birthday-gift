/**
 * Stage1_Welcome.js
 * Stage 1: Magical Welcome & Birthday Verification
 */
class Stage1_Welcome {
  constructor(stageManager) {
    this.stageManager = stageManager;
    this.container = document.getElementById('modal-container');
  }

  enter() {
    this.stageManager.updateTracker(1);
    this.renderWelcomeModal();

    // Cinematic camera framing
    if (this.stageManager.controls) {
      this.stageManager.controls.target.set(0, 3.5, -4);
    }
    gsap.to(this.stageManager.camera.position, {
      x: 0,
      y: 3.2,
      z: 9,
      duration: 2.5,
      ease: "power2.out"
    });
  }

  renderWelcomeModal() {
    this.container.innerHTML = `
      <div class="glass-card interactive">
        <div class="card-tag">🌸 October 1st • Sacred Celebration</div>
        <h2 class="card-title">Welcome to <span class="glow">Panda's World</span></h2>
        <p class="card-description">
          A living fantasy sanctuary woven with love, blooming cherry blossoms, and timeless memories from Kanyakumari. 
          <br><br>
          Before the enchanted archway opens... 
          <br>
          <strong style="color: #fbcfe8; font-size: 16px;">Are you the birthday girl, Ashitha (Panda)? ✨</strong>
        </p>
        <div class="card-actions">
          <button id="btn-welcome-yes" class="btn-primary">
            <span>✨</span> <span>Yes, I am Ashitha!</span>
          </button>
          <button id="btn-welcome-no" class="btn-secondary">
            <span>No, I am a visitor / friend</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-welcome-yes').addEventListener('click', () => {
      this.handleYes();
    });

    document.getElementById('btn-welcome-no').addEventListener('click', () => {
      this.handleNo();
    });
  }

  handleNo() {
    window.audioManager.playChime(0.9);

    this.container.innerHTML = `
      <div class="glass-card interactive">
        <div class="card-tag">🕊️ Guest of Honor Entry</div>
        <h2 class="card-title">Greetings, <span class="glow">Kind Traveler!</span></h2>
        <p class="card-description">
          This magical realm was conjured exclusively in honor of the radiant <strong>Ashitha (Panda)</strong>. 
          You are warmly invited to step through the gates and experience her wonder!
          <br><br>
          <em>...Or wait a minute, could you be Panda in disguise trying to be cheeky? 😉</em>
        </p>
        <div class="card-actions">
          <button id="btn-confess-panda" class="btn-primary">
            <span>🐼</span> <span>It's me, Panda! Let's explore!</span>
          </button>
          <button id="btn-guest-enter" class="btn-secondary">
            <span>✨</span> <span>Enter as an honored guest</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-confess-panda').addEventListener('click', () => {
      this.handleYes("Aha! We knew it was you, Panda! 💖");
    });

    document.getElementById('btn-guest-enter').addEventListener('click', () => {
      this.handleYes("Welcome honored guest! Celebrating Ashitha! 🌸");
    });
  }

  handleYes(customMsg = null) {
    window.audioManager.playMagicHarp();

    // Trigger celebration confetti if confetti is available
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbcfe8', '#d4af37', '#c084fc', '#93c5fd']
      });
    }

    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerHTML = `<span>💖</span> <span>${customMsg || "Happy Birthday, Ashitha! Welcome, Panda! 🌸"}</span>`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3800);
    }

    // Fade out modal and advance to Stage 2
    gsap.to('.glass-card', {
      opacity: 0,
      y: -25,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => {
        this.container.innerHTML = '';
        this.stageManager.goToStage(2);
      }
    });
  }
}

window.Stage1_Welcome = Stage1_Welcome;
