const game = document.getElementById("game");

const player = document.getElementById("player");

const scoreEl = document.getElementById("score");

const livesEl = document.getElementById("lives");

const message = document.getElementById("message");

const startBtn = document.getElementById("startBtn");

const powerEl = document.getElementById("power");


let running = false;

let score = 0;

let lives = 3;

let playerX = 50;

let objects = [];

let keys = {};

let lastSpawn = 0;

let lastTime = 0;

let powerReady = true;

let speed = 190;


/* RESET GAME */

function resetGame() {

  score = 0;

  lives = 3;

  playerX = 50;

  objects.forEach(object => {

    object.el.remove();

  });

  objects = [];

  powerReady = true;

  speed = 190;

  scoreEl.textContent = score;

  livesEl.textContent = lives;

  setPlayer();

}


/* MOVE PLAYER */

function setPlayer() {

  player.style.left = playerX + "%";

}


/* START */

function startGame() {

  resetGame();

  running = true;

  message.style.display = "none";

  lastTime = performance.now();

  requestAnimationFrame(loop);

}


/* GAME OVER */

function endGame(won = false) {

  running = false;

  message.style.display = "grid";

  message.querySelector("h2").textContent =
    won
      ? "Paris is Safe! 🐞✨"
      : "Game Over 💜";

  message.querySelector("p").textContent =
    won
      ? `Amazing! Final score: ${score}`
      : `Final score: ${score}. Try again, Hero!`;

  startBtn.textContent = "PLAY AGAIN";

}


/* CREATE OBJECT */

function spawn(type) {

  const el = document.createElement("div");

  el.className =
    type === "enemy"
      ? "enemy"
      : "coin";

  el.textContent =
    type === "enemy"
      ? "🦋"
      : "🐞";

  const x =
    8 + Math.random() * 84;

  el.style.left = x + "%";

  el.style.top = "-50px";

  game.appendChild(el);

  objects.push({

    el,

    type,

    x,

    y: -50,

    speed:
      type === "enemy"
        ? speed
        : speed * .82

  });

}


/* COLLISION */

function hit(a, b) {

  const ar =
    a.getBoundingClientRect();

  const br =
    b.getBoundingClientRect();

  return (

    ar.left < br.right &&

    ar.right > br.left &&

    ar.top < br.bottom &&

    ar.bottom > br.top

  );

}


/* LUCKY CHARM */

function luckyCharm() {

  if (!running || !powerReady)
    return;

  powerReady = false;

  powerEl.classList.add("show");


  objects = objects.filter(object => {

    if (

      object.type === "enemy" &&

      object.y > 0 &&

      object.y < game.clientHeight * .75

    ) {

      object.el.remove();

      score += 25;

      return false;

    }

    return true;

  });


  scoreEl.textContent = score;


  setTimeout(() => {

    powerEl.classList.remove("show");

  }, 700);


  setTimeout(() => {

    powerReady = true;

  }, 3500);

}


/* MAIN GAME LOOP */

function loop(now) {

  if (!running)
    return;


  const dt =
    Math.min(
      (now - lastTime) / 1000,
      .04
    );

  lastTime = now;


  /* MOVEMENT */

  if (
    keys.ArrowLeft ||
    keys.a
  ) {

    playerX -= 42 * dt;

  }


  if (
    keys.ArrowRight ||
    keys.d
  ) {

    playerX += 42 * dt;

  }


  playerX =
    Math.max(
      5,
      Math.min(95, playerX)
    );

  setPlayer();


  /* SPAWN */

  if (
    now - lastSpawn >
    Math.max(
      380,
      850 - score * 3
    )
  ) {

    spawn(
      Math.random() < .62
        ? "enemy"
        : "coin"
    );

    lastSpawn = now;

  }


  /* MOVE OBJECTS */

  for (
    let i = objects.length - 1;
    i >= 0;
    i--
  ) {

    const object = objects[i];

    object.y +=
      object.speed * dt;

    object.el.style.top =
      object.y + "px";


    /* COLLISION */

    if (
      hit(
        object.el,
        player
      )
    ) {

      if (
        object.type === "coin"
      ) {

        score += 10;

        scoreEl.textContent =
          score;

      }

      else {

        lives--;

        livesEl.textContent =
          lives;


        if (lives <= 0) {

          object.el.remove();

          objects.splice(i, 1);

          endGame(false);

          return;

        }

      }


      object.el.remove();

      objects.splice(i, 1);

      continue;

    }


    /* REMOVE OFFSCREEN */

    if (
      object.y >
      game.clientHeight + 60
    ) {

      object.el.remove();

      objects.splice(i, 1);

    }

  }


  /* WIN */

  if (score >= 300) {

    endGame(true);

    return;

  }


  speed += dt * 2;


  requestAnimationFrame(loop);

}


/* KEYBOARD */

document.addEventListener(
  "keydown",
  event => {

    keys[event.key] = true;


    if (
      event.code === "Space"
    ) {

      event.preventDefault();

      luckyCharm();

    }

  }
);


document.addEventListener(
  "keyup",
  event => {

    keys[event.key] = false;

  }
);


/* START BUTTON */

startBtn.addEventListener(
  "click",
  startGame
);


/* MOBILE CONTROLS */

game.addEventListener(
  "pointerdown",
  event => {

    if (!running)
      return;

    const rect =
      game.getBoundingClientRect();

    if (
      event.clientX <
      rect.left + rect.width / 2
    ) {

      playerX -= 8;

    }

    else {

      playerX += 8;

    }


    playerX =
      Math.max(
        5,
        Math.min(95, playerX)
      );

    setPlayer();

  }
);
