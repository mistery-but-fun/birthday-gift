/**
 * Stage2_Quiz.js
 * Stage 2: Secret Quiz - Who is the birthday girl's favourite person?
 */
class Stage2_Quiz {
  constructor(stageManager) {
    this.stageManager = stageManager;
    this.container = document.getElementById('modal-container');
    this.attempts = 0;
    this.maxAttempts = 3;
    this.quizData = null;
  }

  async enter() {
    this.stageManager.updateTracker(2);

    if (window.PRELOADED_QUIZ && window.PRELOADED_QUIZ.question) {
      this.quizData = window.PRELOADED_QUIZ;
    } else {
      try {
        const resp = await fetch('static/data/quiz.json');
        this.quizData = await resp.json();
      } catch (e) {
        console.warn("Could not load quiz.json, using fallback data:", e);
        this.quizData = {
          question: "Who is the birthday girl's favourite person in the entire universe?",
          options: ["Papa", "Mama", "Panda", "Poda"],
          correct_answer: "Panda",
          hints: [
            "Aww, they are super precious! But think about who holds that special cuddly nickname... 🐼💕 Try again!",
            "Getting warmer! Hint: Who has the cutest nickname and loves bamboo? 🎋✨ One more try!",
            "No more guessing needed! You know the magic key is PANDA! 🐼💫 Click Panda!"
          ]
        };
      }
    }

    // Camera move towards the gate pedestal
    if (this.stageManager.controls) {
      this.stageManager.controls.target.set(0, 3.2, -4);
    }
    gsap.to(this.stageManager.camera.position, {
      x: 0,
      y: 3.0,
      z: 6.5,
      duration: 2.0,
      ease: "power2.out"
    });

    this.renderQuizModal();
  }

  renderQuizModal(hintMessage = null) {
    const optionsHtml = this.quizData.options.map(opt => `
      <button class="btn-secondary quiz-opt-btn interactive" data-option="${opt}" style="min-width: 140px; font-size: 15px;">
        ${opt}
      </button>
    `).join('');

    this.container.innerHTML = `
      <div class="glass-card interactive">
        <div class="card-tag">🔮 Stage 2 • The Secret Riddle</div>
        <h2 class="card-title">A Riddle for <span class="glow">Ashitha</span></h2>
        <p class="card-description">
          ${this.quizData.question}
        </p>
        ${hintMessage ? `
          <div style="background: rgba(251, 207, 232, 0.12); border: 1px solid #fbcfe8; padding: 12px 18px; border-radius: 16px; margin-bottom: 20px; font-size: 13px; color: #fbcfe8;">
            ${hintMessage}
          </div>
        ` : ''}
        <div class="card-actions" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 360px; margin: 0 auto;">
          ${optionsHtml}
        </div>
        <div style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
          Attempt ${this.attempts} of ${this.maxAttempts}
        </div>
      </div>
    `;

    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = e.currentTarget.getAttribute('data-option');
        this.handleAnswer(selected);
      });
    });
  }

  handleAnswer(selected) {
    if (selected === this.quizData.correct_answer) {
      window.audioManager.playMagicHarp();
      if (window.confetti) {
        window.confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }

      this.container.innerHTML = `
        <div class="glass-card interactive">
          <div class="card-tag" style="background: rgba(134, 239, 172, 0.15); border-color: #86efac; color: #86efac;">
            ✨ Riddle Solved!
          </div>
          <h2 class="card-title"><span class="glow">Panda</span> Holds the Key! 🐼</h2>
          <p class="card-description">
            Correct! The enchanted bonds of love resonate across the realm. 
            The ancient carved doors are preparing to open...
          </p>
          <div class="card-actions">
            <button id="btn-quiz-proceed" class="btn-primary">
              <span>🚪</span> <span>Approach the Magical Door (Stage 3)</span>
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-quiz-proceed').addEventListener('click', () => {
        gsap.to('.glass-card', {
          opacity: 0,
          y: -20,
          duration: 0.6,
          onComplete: () => {
            this.container.innerHTML = '';
            this.stageManager.goToStage(3);
          }
        });
      });

    } else {
      this.attempts++;
      window.audioManager.playChime(0.6);
      const hint = this.quizData.hints[Math.min(this.attempts - 1, this.quizData.hints.length - 1)];
      this.renderQuizModal(hint);
    }
  }
}

window.Stage2_Quiz = Stage2_Quiz;
