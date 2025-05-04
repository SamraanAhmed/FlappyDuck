document.addEventListener('DOMContentLoaded', () => {
  // Game elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score-display');
  const gameOverScreen = document.getElementById('game-over');
  const finalScoreDisplay = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart-btn');
  const startScreen = document.getElementById('start-screen');
  const startBtn = document.getElementById('start-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings');
  const difficultyRadios = document.querySelectorAll(
    'input[name="difficulty"]'
  );
  // Set canvas size
  canvas.width = 400;
  canvas.height = 600;

  // Game variables
  let gameRunning = false;
  let score = 0;
  let highScore = localStorage.getItem('flappyHighScore') || 0;
  let gravity = 0.3;
  let speed = 2;
  let pipes = [];
  let frameCount = 0;
  let gameOver = false;
  let difficulty = 'hard'; // Default difficulty
  const difficultySettings = {
    easy: { speed: 2, gap: 280, gravity: 0.1 },
    medium: { speed: 3, gap: 150, gravity: 0.2 },
    hard: { speed: 4, gap: 120, gravity: 0.3 },
  };
  // Bird properties
  const bird = {
    x: 100,
    y: canvas.height / 2,
    width: 40,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jumpForce: -10,
    color: '#ffcc00',
    wingPosition: 'up',
    wingTimer: 0,
  };
  // Settings button toggle
  settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'flex';
  });

  // Close settings panel
  closeSettingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'none';
  });

  // Difficulty selection
  difficultyRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      difficulty = e.target.value;
      // Update game parameters immediately
      const settings = difficultySettings[difficulty];
      speed = settings.speed;
      pipe.gap = settings.gap;
      bird.gravity = settings.gravity;
    });
  });
  // Pipe properties
  const pipe = {
    width: 60,
    gap: 150,
    minHeight: 50,
    maxHeight: canvas.height - 200,
    color: '#4aa54a',
  };

  // Ground properties
  const ground = {
    height: 100,
    color: '#deb887',
  };

  // Cloud properties
  const clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height / 3),
      width: 60 + Math.random() * 40,
      speed: 0.01 + Math.random() * 1,
    });
  }
  console.log('Game script loaded!');
  startBtn.addEventListener('click', () => {
    console.log('Start button clicked!');
    startGame();
  });
  // Event listeners
  function handleJump() {
    if (!gameRunning) return;
    bird.velocity = bird.jumpForce;
    bird.wingPosition = 'up';
    bird.wingTimer = 0;
  }

  canvas.addEventListener('click', handleJump);
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      handleJump();
    }
  });

  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);

  // Start game function
  function startGame() {
    // Apply difficulty settings
    const settings = difficultySettings[difficulty];
    speed = settings.speed;
    pipe.gap = settings.gap;
    bird.gravity = settings.gravity;
    bird.jumpForce = -settings.gravity * 20; // Adjust jump force based on gravity

    gameRunning = true;
    gameOver = false;
    score = 0;
    scoreDisplay.textContent = score;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frameCount = 0;

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    settingsPanel.style.display = 'none';

    gameLoop();
  }

  // Game loop
  function gameLoop() {
    if (!gameRunning) return;

    // Test drawing
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 50, 50);
    if (gameOver) {
      showGameOver();
      return;
    }

    update();
    draw();

    requestAnimationFrame(gameLoop);
  }

  // Update game state
  function update() {
    // Update bird
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Update wing animation
    bird.wingTimer++;
    if (bird.wingTimer > 10) {
      bird.wingPosition = bird.wingPosition === 'up' ? 'down' : 'up';
      bird.wingTimer = 0;
    }

    // Check if bird hits the ground or ceiling
    if (bird.y + bird.height > canvas.height - ground.height || bird.y < 0) {
      gameOver = true;
    }

    // Generate new pipes
    frameCount++;
    if (frameCount % 120 === 0) {
      generatePipe();
    }

    // Update pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].x -= speed;

      // Check if bird passes a pipe
      if (!pipes[i].passed && pipes[i].x + pipe.width < bird.x) {
        pipes[i].passed = true;
        score++;
        scoreDisplay.textContent = score;

        // Increase speed slightly every 5 points
        if (score % 5 === 0) {
          speed += 0.2;
        }
      }

      // Check collision with pipes
      if (
        bird.x + bird.width > pipes[i].x &&
        bird.x < pipes[i].x + pipe.width &&
        (bird.y < pipes[i].topHeight ||
          bird.y + bird.height > pipes[i].topHeight + pipe.gap)
      ) {
        gameOver = true;
      }

      // Remove pipes that are off screen
      if (pipes[i].x + pipe.width < 0) {
        pipes.splice(i, 1);
      }
    }

    // Update clouds
    for (let cloud of clouds) {
      cloud.x -= cloud.speed * 0.5;
      if (cloud.x + cloud.width < 0) {
        cloud.x = canvas.width;
        cloud.y = Math.random() * (canvas.height / 3);
      }
    }
  }

  // Draw everything
  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#70c5ce');
    skyGradient.addColorStop(0.5, '#5a9ba4');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height - ground.height);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let cloud of clouds) {
      drawCloud(cloud.x, cloud.y, cloud.width);
    }

    // Draw pipes
    ctx.fillStyle = pipe.color;
    for (let pipeObj of pipes) {
      // Top pipe
      ctx.fillRect(pipeObj.x, 0, pipe.width, pipeObj.topHeight);

      // Bottom pipe
      const bottomPipeY = pipeObj.topHeight + pipe.gap;
      ctx.fillRect(
        pipeObj.x,
        bottomPipeY,
        pipe.width,
        canvas.height - bottomPipeY - ground.height
      );

      // Pipe edges
      ctx.fillStyle = '#3a8a3a';
      ctx.fillRect(pipeObj.x - 5, pipeObj.topHeight - 20, pipe.width + 10, 20);
      ctx.fillRect(pipeObj.x - 5, bottomPipeY, pipe.width + 10, 20);
      ctx.fillStyle = pipe.color;
    }

    // Draw bird
    ctx.fillStyle = bird.color;

    // Bird body
    ctx.beginPath();
    ctx.ellipse(
      bird.x + bird.width / 2,
      bird.y + bird.height / 2,
      bird.width / 2,
      bird.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Bird head
    ctx.beginPath();
    ctx.arc(
      bird.x + bird.width,
      bird.y + bird.height / 3,
      bird.height / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
      bird.x + bird.width + 5,
      bird.y + bird.height / 3 - 2,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
      bird.x + bird.width + 5,
      bird.y + bird.height / 3 - 2,
      1.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Bird beak
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.width + 10, bird.y + bird.height / 3);
    ctx.lineTo(bird.x + bird.width + 20, bird.y + bird.height / 3);
    ctx.lineTo(bird.x + bird.width + 10, bird.y + bird.height / 3 + 5);
    ctx.fill();

    // Bird wings
    ctx.fillStyle = '#e6b800';
    if (bird.wingPosition === 'up') {
      ctx.beginPath();
      ctx.moveTo(bird.x + bird.width / 2, bird.y + bird.height / 2);
      ctx.quadraticCurveTo(
        bird.x + bird.width / 2 - 15,
        bird.y + bird.height / 2 - 15,
        bird.x + bird.width / 2 - 5,
        bird.y + bird.height / 2 - 10
      );
      ctx.quadraticCurveTo(
        bird.x + bird.width / 2 + 5,
        bird.y + bird.height / 2,
        bird.x + bird.width / 2,
        bird.y + bird.height / 2
      );
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(bird.x + bird.width / 2, bird.y + bird.height / 2);
      ctx.quadraticCurveTo(
        bird.x + bird.width / 2 - 15,
        bird.y + bird.height / 2 + 15,
        bird.x + bird.width / 2 - 5,
        bird.y + bird.height / 2 + 10
      );
      ctx.quadraticCurveTo(
        bird.x + bird.width / 2 + 5,
        bird.y + bird.height / 2,
        bird.x + bird.width / 2,
        bird.y + bird.height / 2
      );
      ctx.fill();
    }

    // Draw ground
    ctx.fillStyle = ground.color;
    ctx.fillRect(0, canvas.height - ground.height, canvas.width, ground.height);

    // Draw ground details
    ctx.fillStyle = '#b8860b';
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.arc(i, canvas.height - ground.height, 5, 0, Math.PI, true);
      ctx.fill();
    }
  }

  // Generate a new pipe
  function generatePipe() {
    const topHeight = Math.floor(
      Math.random() * (pipe.maxHeight - pipe.minHeight + 1) + pipe.minHeight
    );

    pipes.push({
      x: canvas.width,
      topHeight: topHeight,
      passed: false,
    });
  }

  // Draw a cloud
  function drawCloud(x, y, size) {
    const circleSize = size / 3;

    ctx.beginPath();
    ctx.arc(x, y, circleSize, 0, Math.PI * 2);
    ctx.arc(
      x + circleSize * 0.7,
      y - circleSize * 0.4,
      circleSize * 0.8,
      0,
      Math.PI * 2
    );
    ctx.arc(x + circleSize * 1.5, y, circleSize * 0.7, 0, Math.PI * 2);
    ctx.arc(
      x + circleSize * 1.3,
      y + circleSize * 0.4,
      circleSize * 0.6,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x + circleSize * 0.5,
      y + circleSize * 0.3,
      circleSize * 0.7,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Show game over screen
  function showGameOver() {
    gameRunning = false;
    gameOverScreen.style.display = 'flex';
    finalScoreDisplay.textContent = `Score: ${score}`;

    // Update high score if needed
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('flappyHighScore', highScore);
      finalScoreDisplay.textContent += ` (New High Score!)`;
    } else {
      finalScoreDisplay.textContent += ` | High Score: ${highScore}`;
    }
  }
});
