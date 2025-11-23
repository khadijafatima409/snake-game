const board = document.querySelector(".board");

const desiredCell = 40;

function buildGrid() {
  // clear existing
  board.innerHTML = "";

  const boardWidth = board.clientWidth;
  const boardHeight = board.clientHeight;

  // Start with a cols estimate based on desiredCell, at least 1
  let cols = Math.max(1, Math.floor(boardWidth / desiredCell));

  // Compute a cellSize from width and cols, then derive rows from height
  let cellSize = Math.floor(boardWidth / cols) || 1;
  let rows = Math.max(1, Math.floor(boardHeight / cellSize));

  // Recompute cellSize to ensure it fits both cols and rows (square cells)
  cellSize = Math.floor(
    Math.min(Math.floor(boardWidth / cols), Math.floor(boardHeight / rows))
  );

  // If recomputed cellSize becomes 0 (very small board), fallback to 1
  if (cellSize < 1) cellSize = 1;

  // Recompute rows in case cellSize changed
  rows = Math.max(1, Math.floor(boardHeight / cellSize));

  // Apply exact px sizes to the grid so there are no fractional gaps
  board.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  board.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
  board.style.gap = `0`;

  // Create blocks
  const total = cols * rows;
  for (let i = 0; i < total; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    board.appendChild(block);
  }

  return { cols, rows, cellSize };
}

let { cols, rows } = buildGrid();
let blocks = document.querySelectorAll(".block");

// Game State
let snake = [{ row: 5, col: 5 }];
let direction = { row: 0, col: 1 }; // right
let food = null;
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;

document.getElementById("high-score").textContent = highScore;

// Convert grid to index
function index(row, col) {
  return row * cols + col;
}

// Place Food
function placeFood() {
  let r, c;
  do {
    r = Math.floor(Math.random() * rows);
    c = Math.floor(Math.random() * cols);
  } while (snake.some((s) => s.row === r && s.col === c));

  food = { row: r, col: c };
}

// Render Everything
function render() {
  blocks.forEach((b) => (b.style.background = ""));

  // Snake
  snake.forEach((part) => {
    blocks[index(part.row, part.col)].style.background = "limegreen";
  });

  // Food
  blocks[index(food.row, food.col)].style.background = "red";
}

// Move Snake
function moveSnake() {
  const head = snake[0];
  const newHead = {
    row: head.row + direction.row,
    col: head.col + direction.col,
  };

  // Wall Collision
  if (
    newHead.row < 0 ||
    newHead.row >= rows ||
    newHead.col < 0 ||
    newHead.col >= cols
  ) {
    return gameOver();
  }

  // Self Collision
  if (snake.some((s) => s.row === newHead.row && s.col === newHead.col)) {
    return gameOver();
  }

  snake.unshift(newHead);

  // Food
  if (newHead.row === food.row && newHead.col === food.col) {
    score++;
    document.getElementById("score").textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
}

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && direction.row !== 1)
    direction = { row: -1, col: 0 };
  else if (e.key === "ArrowDown" && direction.row !== -1)
    direction = { row: 1, col: 0 };
  else if (e.key === "ArrowLeft" && direction.col !== 1)
    direction = { row: 0, col: -1 };
  else if (e.key === "ArrowRight" && direction.col !== -1)
    direction = { row: 0, col: 1 };
});

// Game Over
function gameOver() {
  clearInterval(loop);

  if (score > highScore) {
    localStorage.setItem("snakeHighScore", score);
  }

  alert("Game Over! Your Score: " + score);
  window.location.reload();
}

// Timer (MM-SS)
let seconds = 0;
setInterval(() => {
  seconds++;
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  document.getElementById("time").textContent = `${mins}-${secs}`;
}, 1000);

// Start Game
placeFood();
render();
const loop = setInterval(() => {
  moveSnake();
  render();
}, 200);

// Rebuild grid on window resize so cols/rows remain evenly distributed
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const prevSnake = snake.slice();
    const prevFood = food ? { ...food } : null;

    // rebuild grid and update references
    const result = buildGrid();
    cols = result.cols;
    rows = result.rows;
    blocks = document.querySelectorAll(".block");

    // Reset game state conservatively (simple approach)
    snake = [{ row: 0, col: 0 }];
    direction = { row: 0, col: 1 };
    score = 0;
    placeFood();
    render();
  }, 120);
});
