export function initGame(user) {
    const SUPABASE_URL = "https://uhrmsevxbnqjptpuhprp.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocm1zZXZ4Ym5xanB0cHVocHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxOTQzODksImV4cCI6MjA1OTc3MDM4OX0.odCOrZw7JZHzFyKYtTBYhUbPfH_6ieynTmW7AfwBJpM"; // укоротить

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 500;

    const frogImg = new Image(); frogImg.src = "https://i.imgur.com/eLpERcH.png";
    const giftImg = new Image(); giftImg.src = "https://i.imgur.com/KvLJceM.png";
    const badGiftImg = new Image(); badGiftImg.src = "https://i.imgur.com/Z7RXVbr.png";

    let frogX = 155, frogY = 400;
    const frogWidth = 50, frogHeight = 70;

    const gifts = [];
    const giftPositions = [0, 50, 100, 150, 200, 250, 300, 350];
    let score = 0;
    let lives = 3;
    let giftSpeed = 2;
    let spawnInterval = 2000;
    let gameRunning = true;
    let spawnTimer;

    document.getElementById("scoreDisplay").style.display = "block";
    document.getElementById("livesDisplay").style.display = "block";

    document.getElementById("scoreDisplay").innerText = `Очки: ${score}`;
    document.getElementById("livesDisplay").innerText = `Жизни: ${'❤️'.repeat(lives)}`;

    document.getElementById("left").onclick = () => frogX = Math.max(frogX - 50, 0);
    document.getElementById("right").onclick = () => frogX = Math.min(frogX + 50, canvas.width - frogWidth);

    function drawFrog() {
        ctx.drawImage(frogImg, frogX, frogY, frogWidth, frogHeight);
    }

    function drawGifts() {
        gifts.forEach((g, i) => {
            const img = g.bad ? badGiftImg : giftImg;
            ctx.drawImage(img, g.x, g.y, 30, 30);
            g.y += giftSpeed;

            // Попадание
            if (g.y + 30 > frogY && Math.abs((g.x + 15) - (frogX + frogWidth / 2)) < 30) {
                if (g.bad) {
                    loseLife();
                } else {
                    score++;
                    if (score % 5 === 0) {
                        giftSpeed += 0.5;
                        spawnInterval = Math.max(500, spawnInterval - 100);
                        restartSpawning();
                    }
                }
                gifts.splice(i, 1);
                updateDisplay();
            } else if (g.y > canvas.height) {
                gifts.splice(i, 1);
                if (!g.bad) loseLife();
            }
        });
    }

    function updateDisplay() {
        document.getElementById("scoreDisplay").innerText = `Очки: ${score}`;
        document.getElementById("livesDisplay").innerText = `Жизни: ${'❤️'.repeat(lives)}`;
    }

    function loseLife() {
        lives--;
        updateDisplay();
        if (lives <= 0) endGame();
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
        startSpawning();
    }

    function endGame() {
        gameRunning = false;
        clearInterval(spawnTimer);
        saveScoreToSupabase(score);
        showLeaderboard();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!gameRunning) return;
        drawFrog();
        drawGifts();
        requestAnimationFrame(draw);
    }

    function showLeaderboard() {
        fetch(`${SUPABASE_URL}/rest/v1/scores?select=username,score&order=score.desc&limit=10`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`
            }
        })
            .then(res => res.json())
            .then(data => {
                ctx.fillStyle = "white";
                ctx.fillRect(50, 50, 300, 300);
                ctx.fillStyle = "black";
                ctx.font = "18px sans-serif";
                ctx.fillText("Топ игроков:", 120, 80);
                data.forEach((row, i) => {
                    ctx.fillText(`${i + 1}. ${row.username}: ${row.score}`, 80, 110 + i * 25);
                });
            });
    }

    function saveScoreToSupabase(score) {
        fetch(`${SUPABASE_URL}/rest/v1/scores`, {
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

    startSpawning();
    draw();
}
