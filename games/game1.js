export default function(container, user) {
  container.innerHTML = `
    <div id="menu" style="text-align:center;">
      <button id="startBtn">Играть</button>
      <button id="leaderBtn">Топ игроков</button>
    </div>

    <div id="hud" style="display:none; text-align:center; color:white;">
      <div id="livesDisplay" style="font-size:18px;">Жизни: ❤️❤️❤️</div>
      <div id="scoreDisplay" style="font-size:18px;">Очки: 0</div>
    </div>

    <canvas id="gameCanvas" style="display:none;"></canvas>

    <div class="controls" id="controls" style="display:none; justify-content:space-between; width:300px; margin:10px auto;">
      <img src="https://i.imgur.com/QUaEIk9.png" id="left" style="width:60px;height:60px;">
      <img src="https://i.imgur.com/05AB2sm.png" id="right" style="width:60px;height:60px;">
    </div>

    <div id="leaderboard" style="color:white; text-align:center; margin-top:10px;"></div>
  `;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 500;

  const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

  const frogImg = new Image(); frogImg.src = "https://i.imgur.com/eLpERcH.png";
  const giftImg = new Image(); giftImg.src = "https://i.imgur.com/KvLJceM.png";
  const badGiftImg = new Image(); badGiftImg.src = "https://i.imgur.com/Z7RXVbr.png";

  const frogWidth = 50, frogHeight = 70;
  const giftPositions = [0, 50, 100, 150, 200, 250, 300, 350];

  let frogX = 155, frogY = 400, score = 0, lives = 3;
  let giftSpeed = 2, spawnInterval = 2000, gameRunning = false;
  const gifts = [];
  let spawnTimer;

  document.getElementById("left").onclick = () => frogX = Math.max(frogX - 50, 0);
  document.getElementById("right").onclick = () => frogX = Math.min(frogX + 50, canvas.width - frogWidth);

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("leaderBtn").onclick = fetchLeaderboard;

  function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("controls").style.display = "flex";
    document.getElementById("leaderboard").innerHTML = "";

    frogX = 155; frogY = 400; score = 0; lives = 3;
    giftSpeed = 2; spawnInterval = 2000;
    gifts.length = 0; gameRunning = true;

    updateScoreDisplay();
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
        if (g.bad) loseLife();
        else {
          score++;
          if (score % 5 === 0) {
            giftSpeed += 0.5;
            spawnInterval = Math.max(500, spawnInterval - 100);
            restartSpawning();
          }
        }
        gifts.splice(i, 1);
        updateScoreDisplay();
      } else if (g.y > canvas.height) {
        gifts.splice(i, 1);
        if (!g.bad) loseLife();
      }
    });
  }

  function updateScoreDisplay() {
    document.getElementById("scoreDisplay").innerText = `Очки: ${score}`;
    document.getElementById("livesDisplay").innerText = `Жизни: ${"❤️".repeat(lives)}`;
  }

  function loseLife() {
    lives--;
    updateScoreDisplay();
    if (lives <= 0) {
      gameRunning = false;
      clearInterval(spawnTimer);
      saveScore(score);
      alert("Игра окончена! Ваш счёт: " + score);
      returnToMenu();
    }
  }

  function returnToMenu() {
    document.getElementById("menu").style.display = "block";
    document.getElementById("hud").style.display = "none";
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("controls").style.display = "none";
  }

  function spawnGift() {
    const x = giftPositions[Math.floor(Math.random() * giftPositions.length)];
    const isBad = Math.random() < 0.3;
    gifts.push({ x, y: 0, bad: isBad });
  }

  function startSpawning() {
    spawnTimer = setInterval(spawnGift, spawnInterval);
  }

  function restartSpawning() {
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnGift, spawnInterval);
  }

  async function saveScore(score) {
    await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ user_id: user.id, username: user.name, score })
    });
  }

  async function fetchLeaderboard() {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/scores?select=username,score&order=score.desc&limit=10`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    renderLeaderboard(data);
  }

  function renderLeaderboard(data) {
    const container = document.getElementById("leaderboard");
    container.innerHTML = "<h3>Топ игроков</h3>";
    const table = document.createElement("table");
    table.innerHTML = `<tr><th>Имя</th><th>Очки</th></tr>` +
      data.map(row => `<tr><td>${row.username}</td><td>${row.score}</td></tr>`).join('');
    container.appendChild(table);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (gameRunning) {
      drawFrog();
      drawGifts();
    }
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}
