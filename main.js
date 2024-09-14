const emptyTile = document.querySelector('#tile-empty');
const shuffleBtn = document.querySelector('.shuffleBtn');
const easyBtn = document.querySelector('.easyBtn');
const mediumBtn = document.querySelector('.mediumBtn');
const hardBtn = document.querySelector('.hardBtn');
const board = document.querySelector('.puzzle-board');
const moveCounter = document.querySelector('#move-counter'); // For tracking moves
const timerDisplay = document.querySelector('#timer'); // For showing the timer
const restartBtn = document.querySelector('.restartBtn');

let tiles = document.querySelectorAll('.puzzle-tile');
let tilePositions = [];

let emptyTileIndex = 15;
let boardSize = 4;
let draggedTileIndex = 0;
let dragOverTileIndex = 0;
let moveCount = 0;
let timerInterval;
let timeLeft = 300; // 5 minutes in seconds

easyBtn.addEventListener('click', () => {
  initGame(8);
});

mediumBtn.addEventListener('click', () => {
  initGame(15);
});

hardBtn.addEventListener('click', () => {
  initGame(24);
});

shuffleBtn.addEventListener('click', () => {
  shuffleBoxes();
});
restartBtn.addEventListener('click', () => {
  resetGame();
});

initGame();

function initGame(cube = 15) {
  resetConfig();
  initDefaultValues(cube);
  initCubesHTML();
  initStyles();
  initTilePositions();
  renderTiles();
  initDragFunctions();
  shuffleBoxes();
  startTimer(); // Start the timer when game is initialized
}

function initCubesHTML() {
  board.innerHTML = "";
  for (let i = 0; i < emptyTileIndex + 1; i++) {
    if (i + 1 === emptyTileIndex) {
      board.innerHTML += `
        <div class="puzzle-tile empty-tile" id="tile-empty"></div>
      `;
    } else {
      board.innerHTML += `
        <div class="puzzle-tile"></div>
      `;
    }
  }
  tiles = document.querySelectorAll('.puzzle-tile');
}

function initStyles() {
  const size = boardSize;
  board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
}

function initDefaultValues(cube) {
  emptyTileIndex = cube;
  boardSize = Math.sqrt(emptyTileIndex + 1);
  moveCount = 0;
  moveCounter.textContent = moveCount; // Reset move counter display
}

function resetConfig() {
  clearInterval(timerInterval); // Clear previous timer
  timeLeft = 300; // Reset timer to 5 minutes
  moveCount = 0; // Reset move count
  moveCounter.textContent = 0; // Display reset move count
  timerDisplay.textContent = '05:00'; // Reset timer display
}

function startTimer() {
  clearInterval(timerInterval); // Clear any previous timer
  timerInterval = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      displayAlert('Time\'s up!', 'error', 'You ran out of time!');
      resetGame();
    }
  }, 1000);
}

function incrementMoveCount() {
  moveCount++;
  moveCounter.textContent = moveCount;
  
  if (moveCount >= 50) {
    displayAlert('Oops!', 'error', 'You\'ve used all your moves. Try again!');
    resetGame();
  }
}

function resetGame() {
  resetConfig();
  shuffleBoxes();
  startTimer(); // Restart the timer when game is reset
}

function initTilePositions() {
  tilePositions = [];
  for (let i = 0; i < emptyTileIndex + 1; i++) {
    if (i === emptyTileIndex) {
      tilePositions.push('');
    } else {
      tilePositions.push(i + 1);
    }
  }
}

function shuffleBoxes() {
  for (let i = tilePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tilePositions[i], tilePositions[j]] = [tilePositions[j], tilePositions[i]];
  }
  renderTiles();
}

function resetGame() {
  resetConfig();
  shuffleBoxes();
  startTimer(); // Restart the timer when the game is reset
}

function initDragFunctions() {
  tiles.forEach(tile => {
    tile.addEventListener('dragstart', function () {
      this.classList.add('dragging');
      draggedTileIndex = Array.from(tiles).indexOf(this);
      if (this.classList.contains('empty-tile')) {
        draggedTileIndex = emptyTileIndex;
      }
    });
    tile.addEventListener('dragover', function (event) {
      event.preventDefault();
      this.classList.add('drag-over');
      dragOverTileIndex = Array.from(tiles).indexOf(this);
    });
    tile.addEventListener('dragenter', function (event) {
      event.preventDefault();
    });
    tile.addEventListener('dragleave', function () {
      this.classList.remove('drag-over');
    });
    tile.addEventListener('drop', function () {
      const isAdjacent = (draggedTileIndex === dragOverTileIndex - 1 || draggedTileIndex === dragOverTileIndex + 1 ||
        draggedTileIndex === dragOverTileIndex - boardSize || draggedTileIndex === dragOverTileIndex + boardSize);
      if (draggedTileIndex !== undefined && dragOverTileIndex !== undefined && draggedTileIndex !== dragOverTileIndex && isAdjacent) {
        const draggedTileIsTitled = !tiles[draggedTileIndex].classList.contains('empty-tile');
        const dropTargetIsTitled = !tiles[dragOverTileIndex].classList.contains('empty-tile');
        if ((draggedTileIsTitled && dropTargetIsTitled) || (!draggedTileIsTitled && !dropTargetIsTitled)) {
          return;
        }
        [tilePositions[draggedTileIndex], tilePositions[dragOverTileIndex]] = [tilePositions[dragOverTileIndex], tilePositions[draggedTileIndex]];
        renderTiles();
        incrementMoveCount(); // Increment move count on valid tile drop
      }
      this.classList.remove('drag-over');
      checkWin();
    });
    tile.addEventListener('dragend', function () {
      this.classList.remove('dragging');
    });
  });
}

function checkWin() {
  let isWon = true;
  const size = boardSize * boardSize;
  for (let i = 1; i <= size; i++) {
    if (i !== tilePositions[i - 1]) {
      if (i === size && tilePositions[i - 1] === '') {
        continue;
      }
      isWon = false;
      break;
    }
  }
  if (isWon) {
    displayAlert('Congrats', 'success', 'You won the game!');
    resetGame();
  }
}

function renderTiles() {
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const tileNumber = tilePositions[i];
    tile.innerText = tileNumber;
    tile.setAttribute('draggable', true);
    tile.classList.remove('empty-tile');
    if (tileNumber === '') {
      tile.innerText = '';
      tile.setAttribute('draggable', false);
      tile.classList.add('empty-tile');
      emptyTileIndex = i;
    }
  }
}

function displayAlert(title, icon, text) {
  Swal.fire({ title, icon, text });
}
