const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

const frog = { x: 175, y: 500, width: 50, height: 50, speed: 5 };
const gifts = [];
let score = 0;
let gameOver = false;

function drawFrog() {
    ctx.fillStyle = "green";
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
}

function drawGifts() {
    ctx.fillStyle = "red";
    gifts.forEach(gift => ctx.fillRect(gift.x, gift.y, 20, 20));
}

function update() {
    if (gameOver) return;

    gifts.forEach(gift => {
        gift.y += gift.speed;

        if (gift.y > canvas.height) {
            gameOver = true;
            sendScoreToTelegram(); // ← вызываем при проигрыше
        }

        if (
            gift.y + 20 >= frog.y &&
            gift.x >= frog.x &&
            gift.x <= frog.x + frog.width
        ) {
            score++;
            gifts.splice(gifts.indexOf(gift), 1);
        }
    });

    if (Math.random() < 0.02) {
        gifts.push({ x: Math.random() * 380, y: 0, speed: 2 + Math.random() * 3 });
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFrog();
    drawGifts();
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${score}`, 10, 20);
    if (gameOver) ctx.fillText("Game Over", 150, 300);
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && frog.x > 0) frog.x -= frog.speed;
    if (e.key === "ArrowRight" && frog.x < canvas.width - frog.width) frog.x += frog.speed;
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();


// === Добавлено для Telegram WebApp ===
function sendScoreToTelegram() {
    if (window.Telegram && Telegram.WebApp) {
        console.log("Отправка счёта в Telegram:", score);
        Telegram.WebApp.sendData(JSON.stringify({ score }));
    }
}

// Пример: вызов после окончания игры
// ВСТАВЬ ЭТО в нужное место, если у тебя уже есть функция типа endGame(), gameOver() и т.п.
// Здесь просто для примера (ты можешь вызывать sendScoreToTelegram() при поражении)


// --- Отправка очков в Telegram WebApp ---
function sendScoreToTelegram(score) {
    if (Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({
            action: "submit_score",
            score: score
        }));
    }
}

// Пример: вызов функции после завершения игры
// Замените на ваш собственный триггер завершения игры
function endGame() {
    let finalScore = score;  // Замените на вашу переменную очков
    sendScoreToTelegram(finalScore);
