const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const frog = { x: 175, y: 500, width: 50, height: 50, speed: 5 };
const gifts = [];
let score = 0;
let gameOver = false;

let gameState = "login"; // login, menu, playing
let nickname = "";
let cursorVisible = true;

setInterval(() => cursorVisible = !cursorVisible, 500);

// 🎮 Игровые экраны
function drawLoginScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "20px sans-serif";
    ctx.fillText("Введите ник Telegram:", 80, 200);
    ctx.fillStyle = "yellow";
    ctx.fillText(nickname + (cursorVisible ? "_" : ""), 80, 240);
    ctx.fillStyle = "#888";
    ctx.font = "14px sans-serif";
    ctx.fillText("Нажмите Enter, чтобы продолжить", 80, 280);
}

function drawMainMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px sans-serif";
    ctx.fillText(`Привет, ${nickname}`, 100, 180);
    ctx.fillText("1. Играть", 140, 240);
    ctx.fillText("2. Лидерборд", 140, 280);
}

function drawFrog() {
    ctx.fillStyle = "green";
    ctx.fillRect(frog.x, frog.y, frog.width, frog.height);
}

function drawGifts() {
    ctx.fillStyle = "red";
    gifts.forEach(gift => ctx.fillRect(gift.x, gift.y, 20, 20));
}

function drawGame() {
    drawFrog();
    drawGifts();
    ctx.fillStyle = "black";
    ctx.font = "16px sans-serif";
    ctx.fillText(`Очки: ${score}`, 10, 20);
    if (gameOver) ctx.fillText("Игра окончена", 140, 300);
}

function updateGame() {
    if (gameOver || gameState !== "playing") return;

    gifts.forEach(gift => {
        gift.y += gift.speed;

        if (gift.y > canvas.height) {
            gameOver = true;
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

// 🔁 Игровой цикл
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === "login") {
        drawLoginScreen();
    } else if (gameState === "menu") {
        drawMainMenu();
    } else if (gameState === "playing") {
        drawGame();
    }

    requestAnimationFrame(draw);
}

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}
draw();
gameLoop();

// 🕹️ Управление
document.addEventListener("keydown", (e) => {
    if (gameState === "login") {
        if (e.key === "Backspace") {
            nickname = nickname.slice(0, -1);
        } else if (e.key === "Enter") {
            if (nickname.length > 0) gameState = "menu";
        } else if (e.key.length === 1 && nickname.length < 20) {
            nickname += e.key;
        }
    } else if (gameState === "menu") {
        if (e.key === "1") startGame();
        if (e.key === "2") showLeaderboard();
    } else if (gameState === "playing") {
        if (e.key === "ArrowLeft" && frog.x > 0) frog.x -= frog.speed;
        if (e.key === "ArrowRight" && frog.x < canvas.width - frog.width) frog.x += frog.speed;
    }
});

// 🔧 Функции
function startGame() {
    gameState = "playing";
    gameOver = false;
    score = 0;
    gifts.length = 0;
}

function showLeaderboard() {
    alert("Здесь будет лидерборд :)");
}
