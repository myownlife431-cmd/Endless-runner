// ========================================
// ELEMENTS
// ========================================

const game =
    document.getElementById("game");

const player =
    document.getElementById("player");

const scoreElement =
    document.getElementById("score");

const coinsElement =
    document.getElementById("coins");

const livesElement =
    document.getElementById("lives");

const gameOverScreen =
    document.getElementById("gameOver");

const startScreen =
    document.getElementById("startScreen");

const pauseScreen =
    document.getElementById("pauseScreen");

const finalScore =
    document.getElementById("finalScore");

const bestScore =
    document.getElementById("bestScore");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");

const pauseBtn =
    document.getElementById("pauseBtn");

const resumeBtn =
    document.getElementById("resumeBtn");

const mobileJump =
    document.getElementById("mobileJump");


// ========================================
// GAME VARIABLES
// ========================================

let gameRunning = false;

let paused = false;

let score = 0;

let coins = 0;

let lives = 3;

let speed = 5;

let obstacleTimer = null;

let coinTimer = null;

let scoreTimer = null;

let animationFrame = null;

let isJumping = false;

let jumpVelocity = 0;

let playerBottom = 100;

let best =
    Number(
        localStorage.getItem(
            "runnerBest"
        )
    ) || 0;

bestScore.textContent = best;


// ========================================
// START GAME
// ========================================

function startGame() {

    // Reset values

    score = 0;

    coins = 0;

    lives = 3;

    speed = 5;

    playerBottom = 100;

    isJumping = false;

    jumpVelocity = 0;

    paused = false;

    gameRunning = true;


    // Update display

    updateHUD();


    // Hide screens

    startScreen.style.display =
        "none";

    gameOverScreen.style.display =
        "none";

    pauseScreen.style.display =
        "none";


    // Remove old objects

    document
        .querySelectorAll(
            ".obstacle, .coin"
        )
        .forEach(element => {
            element.remove();
        });


    // Start running animation

    player.classList.add(
        "running"
    );


    // Start game systems

    startGameLoops();

}


// ========================================
// GAME LOOPS
// ========================================

function startGameLoops() {

    clearInterval(obstacleTimer);

    clearInterval(coinTimer);

    clearInterval(scoreTimer);


    // Obstacles

    obstacleTimer =
        setInterval(
            createObstacle,
            1300
        );


    // Coins

    coinTimer =
        setInterval(
            createCoin,
            1700
        );


    // Score

    scoreTimer =
        setInterval(() => {

            if (
                gameRunning &&
                !paused
            ) {

                score++;

                speed += 0.01;

                updateHUD();

            }

        }, 100);


    gameLoop();

}


// ========================================
// GAME LOOP
// ========================================

function gameLoop() {

    if (
        !gameRunning
    ) {

        return;

    }


    if (!paused) {

        moveObjects();

        updatePlayer();

    }


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );

}


// ========================================
// CREATE OBSTACLE
// ========================================

function createObstacle() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    const obstacle =
        document.createElement("div");

    obstacle.className =
        "obstacle";


    obstacle.style.right =
        "-60px";


    game.appendChild(
        obstacle
    );

}


// ========================================
// CREATE COIN
// ========================================

function createCoin() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    const coin =
        document.createElement("div");

    coin.className =
        "coin";


    const randomHeight =
        150 +
        Math.random() * 130;


    coin.style.bottom =
        randomHeight + "px";


    coin.style.right =
        "-40px";


    game.appendChild(
        coin
    );

}


// ========================================
// MOVE OBJECTS
// ========================================

function moveObjects() {

    const objects =
        document.querySelectorAll(
            ".obstacle, .coin"
        );


    objects.forEach(
        object => {

            let right =
                parseFloat(
                    getComputedStyle(
                        object
                    ).right
                );


            right += speed;


            object.style.right =
                right + "px";


            // Remove objects

            if (
                right >
                game.clientWidth + 100
            ) {

                object.remove();

            }

        }
    );


    checkCollisions();

}


// ========================================
// PLAYER PHYSICS
// ========================================

function updatePlayer() {

    if (!isJumping) {

        return;

    }


    playerBottom +=
        jumpVelocity;


    jumpVelocity -= 0.7;


    if (
        playerBottom <= 100
    ) {

        playerBottom = 100;

        jumpVelocity = 0;

        isJumping = false;

    }


    player.style.bottom =
        playerBottom + "px";

}


// ========================================
// JUMP
// ========================================

function jump() {

    if (
        !gameRunning ||
        paused
    ) {

        return;

    }


    if (isJumping) {

        return;

    }


    isJumping = true;

    jumpVelocity = 15;

}


// ========================================
// KEYBOARD
// ========================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            jump();

        }


        if (
            event.code === "KeyP"
        ) {

            togglePause();

        }

    }
);


// ========================================
// MOBILE JUMP
// ========================================

mobileJump.addEventListener(
    "click",
    jump
);


// ========================================
// COLLISION DETECTION
// ========================================

function checkCollisions() {

    const playerRect =
        player.getBoundingClientRect();


    // Obstacles

    document
        .querySelectorAll(
            ".obstacle"
        )
        .forEach(
            obstacle => {

                const obstacleRect =
                    obstacle.getBoundingClientRect();


                if (
                    isColliding(
                        playerRect,
                        obstacleRect
                    )
                ) {

                    hitObstacle(
                        obstacle
                    );

                }

            }
        );


    // Coins

    document
        .querySelectorAll(
            ".coin"
        )
        .forEach(
            coin => {

                const coinRect =
                    coin.getBoundingClientRect();


                if (
                    isColliding(
                        playerRect,
                        coinRect
                    )
                ) {

                    collectCoin(
                        coin
                    );

                }

            }
        );

}


// ========================================
// COLLISION FUNCTION
// ========================================

function isColliding(
    rect1,
    rect2
) {

    return (

        rect1.left <
        rect2.right &&

        rect1.right >
        rect2.left &&

        rect1.top <
        rect2.bottom &&

        rect1.bottom >
        rect2.top

    );

}


// ========================================
// HIT OBSTACLE
// ========================================

function hitObstacle(
    obstacle
) {

    if (
        obstacle.dataset.hit
    ) {

        return;

    }


    obstacle.dataset.hit =
        "true";


    obstacle.remove();


    lives--;


    updateHUD();


    // Small visual effect

    player.style.transform =
        "translateX(-8px)";


    setTimeout(() => {

        player.style.transform =
            "translateX(0)";

    }, 100);


    if (
        lives <= 0
    ) {

        endGame();

    }

}


// ========================================
// COLLECT COIN
// ========================================

function collectCoin(
    coin
) {

    if (
        coin.dataset.collected
    ) {

        return;

    }


    coin.dataset.collected =
        "true";


    coin.remove();


    coins++;

    score += 10;


    updateHUD();

}


// ========================================
// UPDATE HUD
// ========================================

function updateHUD() {

    scoreElement.textContent =
        score;

    coinsElement.textContent =
        coins;

    livesElement.textContent =
        lives;

}


// ========================================
// PAUSE
// ========================================

function togglePause() {

    if (
        !gameRunning
    ) {

        return;

    }


    paused =
        !paused;


    if (paused) {

        pauseScreen.style.display =
            "flex";

        pauseBtn.textContent =
            "▶";

    } else {

        pauseScreen.style.display =
            "none";

        pauseBtn.textContent =
            "⏸";

    }

}


pauseBtn.addEventListener(
    "click",
    togglePause
);


resumeBtn.addEventListener(
    "click",
    togglePause
);


// ========================================
// END GAME
// ========================================

function endGame() {

    gameRunning = false;

    paused = false;


    clearInterval(
        obstacleTimer
    );

    clearInterval(
        coinTimer
    );

    clearInterval(
        scoreTimer
    );


    cancelAnimationFrame(
        animationFrame
    );


    player.classList.remove(
        "running"
    );


    // Update best score

    if (
        score > best
    ) {

        best = score;

        localStorage.setItem(
            "runnerBest",
            best
        );

    }


    finalScore.textContent =
        score;

    bestScore.textContent =
        best;


    gameOverScreen.style.display =
        "flex";

}


// ========================================
// START / RESTART
// ========================================

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);