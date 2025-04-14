export default function initSnakeGame(user) {
  const game = document.getElementById("game");
  game.innerHTML = `
    <div id="gameUI">
      <button id="startBtn">Играть</button>
      <button id="leaderboardBtn">Топ игроков</button>
      <button id="backToMenuBtn">&larr; Назад</button>
      <div id="info" style="margin-top: 10px;">
        <div id="scoreDisplay" style="display:none; color:black;">Очки: 0</div>
      </div>
      <canvas id="gameCanvas" width="400" height="500" style="display:none;"></canvas>
      <div id="leaderboard" style="display:none; margin-top: 20px;"></div>
    </div>
  `;

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gridSize = 20;
  const tileCount = 20;
  let snake = [{ x: 10, y: 10 }];
  let direction = { x: 0, y: 0 };
  let food = { x: 15, y: 15 };
  let score = 0;
  let gameRunning = false;
  let gameInterval;

  const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocm1zZXZ4Ym5xanB0cHVocHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxOTQzODksImV4cCI6MjA1OTc3MDM4OX0.odCOrZw7JZHzFyKYtTBYhUbPfH_6ieynTmW7AfwBJpM";

  function startGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = { x: 15, y: 15 };
    score = 0;
    gameRunning = true;

    document.getElementById("gameCanvas").style.display = "block";
    document.getElementById("scoreDisplay").style.display = "block";
    document.getElementById("leaderboard").style.display = "none";
    document.getElementById("startBtn").style.display = "none";
    document.getElementById("leaderboardBtn").style.display = "none";

    gameInterval = setInterval(gameLoop, 150);
  }

  function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize - 2, gridSize - 2);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (
      head.x < 0 || head.x >= tileCount ||
      head.y < 0 || head.y >= tileCount ||
      snake.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
      endGame();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } else {
      snake.pop();
    }

    updateDisplays();
    drawSquare(food.x, food.y, "red");
    snake.forEach((s, i) => drawSquare(s.x, s.y, i === 0 ? "green" : "lime"));
  }

  function updateDisplays() {
    document.getElementById("scoreDisplay").innerText = `Очки: ${score}`;
  }

  function endGame() {
    clearInterval(gameInterval);
    gameRunning = false;
    saveScore();
    alert(`Игра окончена! Ваш счёт: ${score}`);
    document.getElementById("startBtn").style.display = "inline-block";
    document.getElementById("leaderboardBtn").style.display = "inline-block";
  }

  async function saveScore() {
    const { name: username, id: user_id } = user;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/snake_scores?username=eq.${username}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();

    if (data.length === 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/snake_scores`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ user_id, username, score })
      });
    } else if (score > data[0].score) {
      const id = data[0].id;
      await fetch(`${SUPABASE_URL}/rest/v1/snake_scores?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score })
      });
    }

    fetchLeaderboard();
  }

  function fetchLeaderboard() {
    document.getElementById("gameCanvas").style.display = "none";
    document.getElementById("scoreDisplay").style.display = "none";
    document.getElementById("leaderboard").style.display = "block";

    fetch(`${SUPABASE_URL}/rest/v1/snake_scores?select=username,score&order=score.desc&limit=5`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    })
      .then(res => res.json())
      .then(renderLeaderboard);
  }

  function renderLeaderboard(data) {
    const container = document.getElementById("leaderboard");
    container.innerHTML = '<h3>Топ игроков</h3>';
    const table = document.createElement("table");
    table.innerHTML = `<tr><th>Имя</th><th>Очки</th></tr>` +
      data.map(r => `<tr><td>${r.username}</td><td>${r.score}</td></tr>`).join('');
    container.appendChild(table);
  }

  document.getElementById("startBtn").onclick = startGame;
  document.getElementById("leaderboardBtn").onclick = fetchLeaderboard;
  document.getElementById("backToMenuBtn").onclick = () => {
    document.getElementById("game").style.display = "none";
    document.getElementById("menu").style.display = "block";
    document.getElementById("game").innerHTML = "";
  };

  document.addEventListener("keydown", e => {
    switch (e.key) {
      case "ArrowUp": if (direction.y === 0) direction = { x: 0, y: -1 }; break;
      case "ArrowDown": if (direction.y === 0) direction = { x: 0, y: 1 }; break;
      case "ArrowLeft": if (direction.x === 0) direction = { x: -1, y: 0 }; break;
      case "ArrowRight": if (direction.x === 0) direction = { x: 1, y: 0 }; break;
    }
  });
}
