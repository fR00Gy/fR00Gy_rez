export default function initGravityGame(user) {
  const game = document.getElementById("game");
  game.innerHTML = `
    <div id="gravityUI">
      <button id="startGravityBtn">Играть</button>
      <button id="backToMenuBtn">\u2190 Назад</button>
      <canvas id="gravityCanvas" width="400" height="400" style="display: none;"></canvas>
    </div>
  `;

  const canvas = document.getElementById("gravityCanvas");
  const ctx = canvas.getContext("2d");

  const bikeImg = new Image();
  const wheelImg = new Image();
  bikeImg.src = "https://i.imgur.com/yTNXNKW.png";
  wheelImg.src = "https://i.imgur.com/sgzIpxf.png";

  let bikeX = 200;
  let bikeY = 300;
  let bikeAngle = 0;

  function drawBike(x, y, angle = 0) {
    const wheelOffset = 20;

    // Заднее колесо
    ctx.save();
    ctx.translate(x - wheelOffset, y);
    ctx.rotate(angle);
    ctx.drawImage(wheelImg, -15, -15, 30, 30);
    ctx.restore();

    // Переднее колесо
    ctx.save();
    ctx.translate(x + wheelOffset, y);
    ctx.rotate(angle);
    ctx.drawImage(wheelImg, -15, -15, 30, 30);
    ctx.restore();

    // Байк
    ctx.save();
    ctx.translate(x, y - 20);
    ctx.drawImage(bikeImg, -40, -30, 80, 60);
    ctx.restore();
  }

  function startGame() {
    document.getElementById("gravityCanvas").style.display = "block";
    document.getElementById("startGravityBtn").style.display = "none";
    gameLoop();
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBike(bikeX, bikeY, bikeAngle);

    requestAnimationFrame(gameLoop);
  }

  document.getElementById("startGravityBtn").onclick = startGame;
  document.getElementById("backToMenuBtn").onclick = () => {
    document.getElementById("game").style.display = "none";
    document.getElementById("menu").style.display = "block";
    document.getElementById("game").innerHTML = "";
  };
}
