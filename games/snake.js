export default function initSnakeGame(user) {
    const game = document.getElementById('game');
    game.innerHTML = `
    <div id="gameUI">
      <button id="startSnakeBtn">Играть</button>
      <button id="leaderboardSnakeBtn">Топ игроков</button>
      <button id="backToMenuBtn">\u2190 Назад</button>
      <div id="info" style="margin-top: 10px;">
        <div id="snakeScoreDisplay" style="display:none; color: black;">Очки: 0</div>
      </div>
      <canvas id="snakeCanvas" width="400" height="400" style="display:none;"></canvas>
      <div id="snakeLeaderboard" style="display:none; margin-top: 20px;"></div>
    </div>
  `;

    const canvas = document.getElementById("snakeCanvas");
    const ctx = canvas.getContext("2d");
    const gridSize = 20;
    let snake, direction, food, score, gameRunning = false, gameLoop;

    const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocm1zZXZ4Ym5xanB0cHVocHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxOTQzODksImV4cCI6MjA1OTc3MDM4OX0.odCOrZw7JZHzFyKYtTBYhUbPfH_6ieynTmW7AfwBJpM"; // обрежь на проде

    function startSnake() {
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
        food = spawnFood();
        score = 0;
        gameRunning = true;

        document.getElementById("snakeCanvas").style.display = "block";
        document.getElementById("snakeScoreDisplay").style.display = "block";
        document.getElementById("snakeLeaderboard").style.display = "none";
        document.getElementById("startSnakeBtn").style.display = "none";
        document.getElementById("leaderboardSnakeBtn").style.display = "none";

        updateSnakeScore();
        clearInterval(gameLoop);
        gameLoop = setInterval(update, 150);
    }

    function update() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (
            head.x < 0 || head.y < 0 ||
            head.x >= canvas.width / gridSize || head.y >= canvas.height / gridSize ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameRunning = false;
            clearInterval(gameLoop);
            saveScore();
            alert(`Игра окончена! Ваш счёт: ${score}`);
            document.getElementById("startSnakeBtn").style.display = "inline-block";
            document.getElementById("leaderboardSnakeBtn").style.display = "inline-block";
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            food = spawnFood();
            updateSnakeScore();
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "green";
        snake.forEach(segment => ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize));

        ctx.fillStyle = "red";
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function spawnFood() {
        return {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    }

    function updateSnakeScore() {
        document.getElementById("snakeScoreDisplay").innerText = `Очки: ${score}`;
    }

    async function saveScore() {
        const { name: username, id: user_id } = user;
        const res = await fetch(`${SUPABASE_URL}/rest/v1/snake_scores?username=eq.${username}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const data = await res.json();

        if (data.length === 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/snake_scores`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ user_id, username, score })
            });
        } else if (score > data[0].score) {
            const id = data[0].id;
            await fetch(`${SUPABASE_URL}/rest/v1/snake_scores?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ score })
            });
        }
        fetchLeaderboard();
    }

    function fetchLeaderboard() {
        document.getElementById("snakeCanvas").style.display = "none";
        document.getElementById("snakeScoreDisplay").style.display = "none";
        document.getElementById("snakeLeaderboard").style.display = "block";

        fetch(`${SUPABASE_URL}/rest/v1/snake_scores?select=username,score&order=score.desc&limit=5`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        })
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("snakeLeaderboard");
                container.innerHTML = '<h3>Топ игроков</h3>';
                const table = document.createElement("table");
                table.innerHTML = `<tr><th>Имя</th><th>Очки</th></tr>` +
                    data.map(r => `<tr><td>${r.username}</td><td>${r.score}</td></tr>`).join('');
                container.appendChild(table);
            });
    }

    document.getElementById("startSnakeBtn").onclick = startSnake;
    document.getElementById("leaderboardSnakeBtn").onclick = fetchLeaderboard;
    document.getElementById("backToMenuBtn").onclick = () => {
        document.getElementById("game").style.display = "none";
        document.getElementById("menu").style.display = "block";
        document.getElementById("game").innerHTML = "";
    };

    document.addEventListener("keydown", e => {
        if (!gameRunning) return;
        switch (e.key) {
            case "ArrowUp": if (direction.y === 0) direction = { x: 0, y: -1 }; break;
            case "ArrowDown": if (direction.y === 0) direction = { x: 0, y: 1 }; break;
            case "ArrowLeft": if (direction.x === 0) direction = { x: -1, y: 0 }; break;
            case "ArrowRight": if (direction.x === 0) direction = { x: 1, y: 0 }; break;
        }
    });
}