import Matter from "https://cdn.jsdelivr.net/npm/matter-js@0.19.0/+esm";

export default function initGravityGame(user) {
  const game = document.getElementById("game");
  game.innerHTML = `
    <div id="gameUI">
      <button id="startGravityBtn">🚴 Играть</button>
      <button id="backToMenuBtn">← Назад</button>
      <canvas id="gravityCanvas" width="400" height="400" style="display:none;"></canvas>
    </div>
  `;

  const canvas = document.getElementById("gravityCanvas");
  const ctx = canvas.getContext("2d");

  const engine = Matter.Engine.create();
  const world = engine.world;

  const ground = Matter.Bodies.rectangle(200, 390, 800, 20, {
    isStatic: true
  });
  Matter.World.add(world, ground);

  const bikeImg = new Image();
  bikeImg.src = "https://i.imgur.com/5cX1FjC.png"; // условный байк спрайт

  const bikeBody = Matter.Bodies.rectangle(200, 300, 40, 20);
  const frontWheel = Matter.Bodies.circle(215, 310, 10);
  const backWheel = Matter.Bodies.circle(185, 310, 10);

  const axleA = Matter.Constraint.create({
    bodyA: bikeBody,
    bodyB: backWheel,
    length: 15,
    stiffness: 0.8
  });
  const axleB = Matter.Constraint.create({
    bodyA: bikeBody,
    bodyB: frontWheel,
    length: 15,
    stiffness: 0.8
  });

  Matter.World.add(world, [bikeBody, frontWheel, backWheel, axleA, axleB]);

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // рисуем землю
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 380, 400, 20);

    // байк
    ctx.save();
    ctx.translate(bikeBody.position.x, bikeBody.position.y);
    ctx.rotate(bikeBody.angle);
    ctx.drawImage(bikeImg, -20, -10, 40, 20);
    ctx.restore();

    // колеса
    ctx.beginPath();
    ctx.arc(frontWheel.position.x, frontWheel.position.y, 10, 0, Math.PI * 2);
    ctx.arc(backWheel.position.x, backWheel.position.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
  }

  function update() {
    Matter.Engine.update(engine);
    render();
    requestAnimationFrame(update);
  }

  document.getElementById("startGravityBtn").onclick = () => {
    canvas.style.display = "block";
    document.getElementById("startGravityBtn").style.display = "none";
    update();
  };

  document.getElementById("backToMenuBtn").onclick = () => {
    document.getElementById("game").style.display = "none";
    document.getElementById("menu").style.display = "block";
    document.getElementById("game").innerHTML = "";
  };

  // управление стрелками
  document.addEventListener("keydown", (e) => {
    const force = 0.005;
    if (e.key === "ArrowRight") {
      Matter.Body.applyForce(backWheel, backWheel.position, { x: force, y: 0 });
    }
    if (e.key === "ArrowLeft") {
      Matter.Body.applyForce(backWheel, backWheel.position, { x: -force, y: 0 });
    }
  });
}