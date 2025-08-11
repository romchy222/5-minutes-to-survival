// Game timer and score management
export class GameTimer {
    constructor() {
        this.timeLeft = 300; // 5 minutes in seconds
        this.isRunning = true;
        this.gameEnded = false;
        this.score = 0;
        this.timerElement = document.getElementById('timer');
        this.lastUpdate = Date.now();
        
        this.updateDisplay();
    }
    
    update() {
        if (!this.isRunning || this.gameEnded) return;
        
        const now = Date.now();
        const deltaTime = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;
        
        this.timeLeft -= deltaTime;
        
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.endGame();
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerElement.textContent = timeString;
    }
    
    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }
    
    updateScoreDisplay() {
        let scoreElement = document.getElementById('score');
        if (!scoreElement) {
            scoreElement = document.createElement('div');
            scoreElement.id = 'score';
            scoreElement.style.position = 'absolute';
            scoreElement.style.top = '60px';
            scoreElement.style.left = '10px';
            scoreElement.style.padding = '10px';
            scoreElement.style.background = 'rgba(0,0,0,0.5)';
            scoreElement.style.borderRadius = '5px';
            scoreElement.style.color = 'white';
            scoreElement.style.fontFamily = 'Arial, sans-serif';
            scoreElement.style.fontSize = '18px';
            document.body.appendChild(scoreElement);
        }
        scoreElement.textContent = `Score: ${this.score}`;
    }
    
    endGame() {
        this.gameEnded = true;
        this.isRunning = false;
        this.showGameOver();
    }
    
    showGameOver() {
        // Save high score
        const highScore = localStorage.getItem('survivalHighScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('survivalHighScore', this.score);
        }
        
        // Create game over overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.fontSize = '24px';
        overlay.style.zIndex = '1000';
        
        overlay.innerHTML = `
            <div style="text-align: center;">
                <h1 style="margin-bottom: 20px;">Game Over!</h1>
                <p style="font-size: 20px; margin-bottom: 10px;">Final Score: ${this.score}</p>
                <p style="font-size: 18px; margin-bottom: 30px;">High Score: ${Math.max(this.score, highScore)}</p>
                <button id="restartBtn" style="
                    padding: 15px 30px;
                    font-size: 18px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Restart Game</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            location.reload();
        });
    }
}

export const gameTimer = new GameTimer();