const game = document.getElementById('game');
const player = document.getElementById('player');
const scoreEl = document.getElementById('score');
const speedEl = document.getElementById('speed');
const levelEl = document.getElementById('level');
const livesEl = document.getElementById('lives');

const shopBtn = document.getElementById('shopBtn');
const shop = document.getElementById('shop');
const scoreShopEl = document.getElementById('scoreShop');
const buySpeedBtn = document.getElementById('buySpeed');
const buyShieldBtn = document.getElementById('buyShield');
const buyBonusBtn = document.getElementById('buyBonus');
const closeShopBtn = document.getElementById('closeShop');

const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

const lanes = [20, 120, 220];
let currentLane = 0;
let obstacles = [];
let coins = [];
let score = 0;
let speed = 2;
let level = 1;
let lives = 3;
let shield = false; // щит для защиты от столкновения

let gameInterval;
let obstacleInterval;
let coinInterval;
let isGameOver = false;

function movePlayer() {
  player.style.left = lanes[currentLane] + 'px';
}

// Создаем препятствия (маленькие прямоугольники)
function createObstacle() {
  if (isGameOver) return;

  const maxObstaclesCount = Math.floor(Math.random() * 2) + 1; // 1 или 2
  const availableLanes = [0, 1, 2];

  for (let i = 0; i < maxObstaclesCount; i++) {
    if (availableLanes.length === 0) break;
    const idx = Math.floor(Math.random() * availableLanes.length);
    const lane = availableLanes.splice(idx, 1)[0];

    const laneObstacles = obstacles.filter(
      (obs) => parseInt(obs.style.left) === lanes[lane]
    );

    if (laneObstacles.some((obs) => parseInt(obs.style.top) < 150)) continue;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    obstacle.style.left = lanes[lane] + 'px';
    obstacle.style.top = '-30px';
    game.appendChild(obstacle);
    obstacles.push(obstacle);
  }
}

// Создаем монеты
function createCoin() {
  if (isGameOver) return;

  const lane = Math.floor(Math.random() * 3);

  const laneCoins = coins.filter(
    (coin) => parseInt(coin.style.left) === lanes[lane] + 14
  );

  if (laneCoins.some((coin) => parseInt(coin.style.top) < 100)) return;

  const coin = document.createElement('div');
  coin.classList.add('coin');
  coin.style.left = lanes[lane] + 14 + 'px';
  coin.style.top = '-20px';
  game.appendChild(coin);
  coins.push(coin);
}

// Проверка столкновений
function checkCollisions() {
  const playerRect = player.getBoundingClientRect();

  obstacles.forEach((obs, i) => {
    let top = parseInt(obs.style.top);
    top += speed;
    obs.style.top = top + 'px';

    const obsRect = obs.getBoundingClientRect();

    if (top > game.clientHeight) {
      obs.remove();
      obstacles.splice(i, 1);
      score += 5;
      updateScore();
      return;
    }

    if (
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.top < obsRect.bottom &&
      playerRect.bottom > obsRect.top
    ) {
      // Столкновение
      obs.remove();
      obstacles.splice(i, 1);
      if (shield) {
        shield = false;
        alert('Щит сработал! Ты сохранил жизнь.');
      } else {
        lives--;
        updateLives();
        if (lives <= 0) {
          endGame();
        }
      }
    }
  });

  coins.forEach((coin, i) => {
    let top = parseInt(coin.style.top);
    top += speed;
    coin.style.top = top + 'px';

    const coinRect = coin.getBoundingClientRect();

    if (top > game.clientHeight) {
      coin.remove();
      coins.splice(i, 1);
      return;
    }

    if (
      playerRect.left < coinRect.right &&
      playerRect.right > coinRect.left &&
      playerRect.top < coinRect.bottom &&
      playerRect.bottom > coinRect.top
    ) {
      coin.remove();
      coins.splice(i, 1);
      score += 10;
      updateScore();
    }
  });
}

function updateScore() {
  scoreEl.textContent = score;
  scoreShopEl.textContent = score;
  checkLevelUp();
  updateShopButtons();
}

function updateLives() {
  livesEl.textContent = lives;
}

function updateSpeed() {
  speedEl.textContent = speed;
}

function updateLevel() {
  levelEl.textContent = level;
}

function checkLevelUp() {
  const newLevel = Math.floor(score / 100) + 1;
  if (newLevel > level) {
    level = newLevel;
    updateLevel();
    speed += 0.5; // увеличиваем скорость на 0.5 с каждым уровнем
    updateSpeed();
    alert(`Поздравляем! Уровень ${level} достигнут. Скорость увеличена.`);
  }
}

function updateShopButtons() {
  buySpeedBtn.disabled = score < 50;
  buyShieldBtn.disabled = score < 100 || shield;
  buyBonusBtn.disabled = score < 80;
}

function gameLoop() {
  if (isGameOver) return;

  checkCollisions();
  updateSpeed();
}

function endGame() {
  isGameOver = true;
  gameOverEl.classList.remove('hidden');
  clearInterval(gameInterval);
  clearInterval(obstacleInterval);
  clearInterval(coinInterval);
}

function startGame() {
  isGameOver = false;
  score = 0;
  speed = 2;
  level = 1;
  lives = 3;
  shield = false;
  currentLane = 0;

  scoreEl.textContent = score;
  speedEl.textContent = speed;
  levelEl.textContent = level;
  livesEl.textContent = lives;
  scoreShopEl.textContent = score;

  // Убрано upgradeBtn.disabled, т.к. этой переменной нет в коде

  gameOverEl.classList.add('hidden');
  shop.classList.add('hidden');

  obstacles.forEach((o) => o.remove());
  coins.forEach((c) => c.remove());
  obstacles = [];
  coins = [];

  movePlayer();

  gameInterval = setInterval(gameLoop, 20);
  obstacleInterval = setInterval(createObstacle, 1500);
  coinInterval = setInterval(createCoin, 2500);
}

window.addEventListener('keydown', (e) => {
  if (isGameOver) return;
  if (e.key === 'ArrowLeft' && currentLane > 0) {
    currentLane--;
    movePlayer();
  } else if (e.key === 'ArrowRight' && currentLane < lanes.length - 1) {
    currentLane++;
    movePlayer();
  }
});

// Магазин - открытие / закрытие
shopBtn.addEventListener('click', () => {
  if (isGameOver) return;
  shop.classList.toggle('hidden');
  updateShopButtons();
});

// Кнопки магазина
buySpeedBtn.addEventListener('click', () => {
  if (score >= 50) {
    score -= 50;
    speed += 1;
    updateScore();
    updateSpeed();
    alert('Скорость увеличена на +1!');
  }
  updateShopButtons();
});

buyShieldBtn.addEventListener('click', () => {
  if (score >= 100 && !shield) {
    score -= 100;
    shield = true;
    updateScore();
    alert('Щит активирован! Ты защитишься от одного столкновения.');
  }
  updateShopButtons();
});

buyBonusBtn.addEventListener('click', () => {
  if (score >= 80) {
    score -= 80;
    score += 100;
    updateScore();
    alert('Получено +100 очков!');
  }
  updateShopButtons();
});

closeShopBtn.addEventListener('click', () => {
  shop.classList.add('hidden');
});

// Перезапуск игры
restartBtn.addEventListener('click', () => {
  startGame();
});

startGame();
