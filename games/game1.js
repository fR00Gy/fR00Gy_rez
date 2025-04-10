export default function initGame(user) {
  const game = document.getElementById('game');
  game.innerHTML = `
    <div id="gameUI">
      <button id="startBtn">Играть</button>
      <button id="leaderboardBtn">Топ игроков</button>
      <div id="info" style="margin-top: 10px;">
        <div id="livesDisplay">Жизни: ❤️❤️❤️</div>
        <div id="scoreDisplay">Очки: 0</div>
      </div>
      <canvas id="gameCanvas" width="400" height="500"></canvas>
      <div class="controls">
        <img src="https://i.imgur.com/QUaEIk9.png" id="left" />
        <img src="https://i.imgur.com/05AB2sm.png" id="right" />
      </div>
      <div id="leaderboard" style="margin-top: 20px;"></div>
    </div>
  `;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const frogImg = new Image(); frogImg.src = "https://i.imgur.com/eLpERcH.png";
  const giftImg = new Image(); giftImg.src = "https://i.imgur.com/KvLJceM.png";
  const badGiftImg = new Image(); badGiftImg.src = "https://i.imgur.com/Z7RXVbr.png";

  let frogX = 155, frogY = 400, score = 0, lives = 3;
  const frogWidth = 50, frogHeight = 70;
  const gifts = [], giftPositions = [0, 50, 100, 150, 200, 250, 300, 350];
  let giftSpeed = 2, spawnInterval = 2000, spawnTimer;
  let gameRunning = false;

  const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // сократи при необходимости

  function startGame() {
    score = 0; lives = 3; giftSpeed = 2; spawnInterval = 2000;
    gifts.length = 0; gameRunning = true;
    updateDisplays();
    startSpawning();
  }

  function drawFrog() {
    ctx.drawImage(frogImg, frogX, frogY, frogWidth, frogHeight);
  }

  function drawGifts() {
    gifts.forEach((g, i) => {
      const img = g.bad ? badGiftImg : giftImg;
      ctx.drawImage(img, g.x, g.y, 30, 30);
      g.y += giftSpeed;
      if (g.y + 30 > frogY && Math.abs((g.x + 15) - (frogX + frogWidth / 2)) < 30) {
        if (g.bad) loseLife(); else {
          score++;
          if (score % 5 === 0) {
            giftSpeed += 0.5;
            if (spawnInterval > 500) {
              clearInterval(spawnTimer);
              spawnInterval -= 150;
              startSpawning();
            }
          }
        }
        gifts.splice(i, 1);
        updateDisplays();
      } else if (g.y > canvas.height) {
        if (!g.bad) loseLife();
        gifts.splice(i, 1);
      }
    });
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameRunning) {
      drawFrog();
      drawGifts();
    }
    requestAnimationFrame(gameLoop);
  }

  function updateDisplays() {
    document.getElementById("livesDisplay").innerText = `Жизни: ${"❤️".repeat(lives)}`;
    document.getElementById("scoreDisplay").innerText = `Очки: ${score}`;
  }

  function loseLife() {
    lives--;
    updateDisplays();
    if (lives <= 0) {
      gameRunning = false;
      clearInterval(spawnTimer);
      saveScore();
      alert(`Игра окончена! Ваш счёт: ${score}`);
    }
  }

  function startSpawning() {
    spawnTimer = setInterval(() => {
      const x = giftPositions[Math.floor(Math.random() * giftPositions.length)];
      const isBad = Math.random() < 0.3;
      gifts.push({ x, y: 0, bad: isBad });
    }, spawnInterval);
  }

  function saveScore() {
    fetch(`${SUPABASE_URL}/rest/v1/scores`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ user_id: user.id, username: user.name, score })
    }).then(fetchLeaderboard);
  }

  function fetchLeaderboard() {
    fetch(`${SUPABASE_URL}/rest/v1/scores?select=username,score&order=score.desc&limit=10`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }).then(res => res.json()).then(renderLeaderboard);
  }

  function renderLeaderboard(data) {
    const container = document.getElementById("leaderboard");
    container.innerHTML = '<h3>Топ игроков</h3>';
    const table = document.createElement("table");
    table.innerHTML = `<tr><th>Имя</th><th>Очки</th></tr>` +
      data.map(r => `<tr><td>${r.username}</td><td>${r.score}</td></tr>`).join('');
    container.appendChild(table);
  }

  document.getElementById("left").onclick = () => frogX = Math.max(frogX - 50, 0);
  document.getElementById("right").onclick = () => frogX = Math.min(frogX + 50, canvas.width - frogWidth);
  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("leaderboardBtn").onclick = fetchLeaderboard;

  gameLoop();
}
