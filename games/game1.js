// games/game1.js
export default function (container, user) {
    container.innerHTML = `
        <div style="margin-bottom: 10px;">
            <div id="livesDisplay" style="color:white; font-size: 18px;">Жизни: ❤️❤️❤️</div>
            <div id="scoreDisplay" style="color:white; font-size: 18px;">Очки: 0</div>
        </div>
        <canvas id="gameCanvas"></canvas>
        <div class="controls" style="display:flex; justify-content: space-between; width:300px; margin:10px auto;">
            <img src="https://i.imgur.com/QUaEIk9.png" id="left" style="width:60px; height:60px;">
            <img src="https://i.imgur.com/05AB2sm.png" id="right" style="width:60px; height:60px;">
        </div>
    `;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 500;

    const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocm1zZXZ4Ym5xanB0cHVocHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxOTQzODksImV4cCI6MjA1OTc3MDM4OX0.odCOrZw7JZHzFyKYtTBYhUbPfH_6ieynTmW7AfwBJpM";

    const frogImg = new Image(); frogImg.src = "https://i.imgur.com/eLpERcH.png";
    const giftImg = new Image(); giftImg.src = "https://i.imgur.com/KvLJceM.png";
    const badGiftImg = new Image(); badGiftImg.src = "https://i.imgur.com/Z7RXVbr.png";

    let frogX = 155, frogY = 400;
    const frogWidth = 50, frogHeight = 70;
    let score = 0, lives = 3, giftSpeed = 2, spawnInterval = 2000;
    let gameRunning = true;

    const gifts = [];
    const giftPositions = [0, 50, 100, 150, 200, 250, 300, 350];
    let spawnTimer;

    document.getElementById("livesDisplay").innerText = `Жизни: ❤️❤️❤️`;
    document.getElementById("scoreDisplay").innerText = `Очки: 0`;

    document.getElementById("left").onclick = () => frogX = Math.max(frogX - 50, 0);
    document.getElementById("right").onclick = () => frogX = Math.min(frogX + 50, canvas.width - frogWidth);

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
            alert(`Игра окончена! Ваш счёт: ${score}`);
        }
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

    function spawnGift() {
        const x = giftPositions[Math.floor(Math.random() * giftPositions.length)];
        const isBad = Math.random() < 0.3;
        gifts.push({ x, y: 0, bad: isBad });
    }

    function restartSpawning() {
        clearInterval(spawnTimer);
        spawnTimer = setInterval(spawnGift, spawnInterval);
    }

    function saveScore(score) {
        fetch(`${SUPABASE_URL}/rest/v1/scores`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({ user_id: user.id, username: user.name, score })
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

    restartSpawning();
    gameLoop();
}
