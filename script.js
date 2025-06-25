// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// Main game logic for Flow for Good
// This file is for beginners and uses only basic JavaScript and the DOM

const gridEl = document.getElementById('grid');
const pointsEl = document.getElementById('points');
const bonusEl = document.getElementById('bonus');
let points = 0;
let bonus = 0;
let isDragging = false;
let currentGridTypes = [];
let currentRound = 1; // Track the current round (start at 1)
const maxRounds = 5; // Total number of rounds

// Build the grid for the current round
function buildGrid(fromReset = false) {
  gridEl.innerHTML = '';
  if (!fromReset) {
    currentGridTypes = [];
    // Use the same obstacle/bonus frequency for all rounds
    let rockChance = 0.14;
    let dirtyChance = 0.08;
    let bonusChance = 0.04;
    for (let i = 0; i < 100; i++) {
      let type = 'dirt';
      let rand = Math.random();
      if (rand < rockChance) type = 'rock';
      else if (rand < rockChance + dirtyChance) type = 'dirty';
      else if (rand < rockChance + dirtyChance + bonusChance) type = 'bonus';
      currentGridTypes.push(type);
    }
  }
  for (let i = 0; i < 100; i++) {
    const tile = document.createElement('div');
    const type = currentGridTypes[i];
    tile.className = 'tile ' + type;
    if (type === 'rock') tile.textContent = '🪨';
    if (type === 'dirty') tile.textContent = '⚠️';
    if (type === 'bonus') tile.textContent = '💧';
    tile.addEventListener('mousedown', () => {
      isDragging = true;
      digTile(tile);
    });
    tile.addEventListener('mouseover', () => {
      if (isDragging) digTile(tile);
    });
    tile.addEventListener('touchstart', (e) => {
      isDragging = true;
      digTile(tile);
      e.preventDefault();
    });
    tile.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (isDragging && target && target.classList.contains('tile')) {
        digTile(target);
      }
    });
    gridEl.appendChild(tile);
  }
  document.addEventListener('mouseup', () => { isDragging = false; });
  document.addEventListener('touchend', () => { isDragging = false; });
}

// Handle digging and obstacle logic
function digTile(tile) {
  if (tile.classList.contains('dirt')) {
    tile.style.background = '#b3e5fc';
    tile.classList.remove('dirt');
    tile.textContent = '';
  } else if (tile.classList.contains('bonus')) {
    tile.style.background = '#b3e5fc';
    tile.classList.remove('bonus');
    tile.textContent = '';
    bonus++;
    bonusEl.textContent = bonus;
  } else if (tile.classList.contains('rock') || tile.classList.contains('dirty')) {
    points = Math.max(0, points - 2);
    pointsEl.textContent = points;
    showMinusTwoOverlay();
    resetGridToCurrentLayout();
  }
}

// Show a -2 overlay when player hits an obstacle
function showMinusTwoOverlay() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '50%';
  overlay.style.left = '50%';
  overlay.style.transform = 'translate(-50%, -50%)';
  overlay.style.fontSize = '3rem';
  overlay.style.fontWeight = 'bold';
  overlay.style.color = 'red';
  overlay.style.background = 'rgba(255,255,255,0.8)';
  overlay.style.padding = '20px 40px';
  overlay.style.borderRadius = '12px';
  overlay.style.zIndex = '9999';
  overlay.innerText = '-2';
  document.body.appendChild(overlay);
  setTimeout(() => {
    document.body.removeChild(overlay);
  }, 1000);
}

// Reset only the path (not the grid layout)
function resetGridToCurrentLayout() {
  const tiles = gridEl.children;
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    if (!tile.classList.contains('rock') &&
        !tile.classList.contains('dirty') &&
        !tile.classList.contains('bonus') &&
        !tile.classList.contains('dirt')) {
      tile.className = 'tile dirt';
      tile.style.background = '';
      tile.textContent = '';
      currentGridTypes[i] = 'dirt';
    }
  }
  document.getElementById('success').style.display = 'none';
}

// Check if player reached the bucket
function startFlow() {
  let reachedBucket = false;
  const gridTiles = gridEl.children;
  for (let i = 90; i < 100; i++) {
    const tile = gridTiles[i];
    if (!tile.classList.contains('dirt') && !tile.classList.contains('rock') &&
        !tile.classList.contains('dirty') && !tile.classList.contains('bonus')) {
      reachedBucket = true;
    }
  }
  if (reachedBucket) {
    points += 10 + bonus;
    pointsEl.textContent = points;
    document.getElementById('successPoints').textContent = 10 + bonus;
    // If not last round, show round complete overlay, else show finished overlay
    if (currentRound < maxRounds) {
      document.getElementById('roundComplete').style.display = 'flex';
    } else {
      document.getElementById('finished').style.display = 'flex';
    }
    showConfetti(); // Show confetti effect when player wins
  }
}

// Simple confetti effect for beginners
function showConfetti() {
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    const colors = ['#FFC907', '#2E9DF7', '#8d6e63', '#00b0ff', '#ffd700', '#c97272'];
    confetti.style.position = 'fixed';
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = '-30px';
    confetti.style.width = '12px';
    confetti.style.height = '12px';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = '4px';
    confetti.style.opacity = '0.8';
    confetti.style.zIndex = '9999';
    confetti.style.transition = 'top 1.2s linear, left 1.2s linear, opacity 1.2s linear';
    document.body.appendChild(confetti);
    setTimeout(() => {
      confetti.style.top = `${60 + Math.random() * 30}vh`;
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.opacity = '0';
    }, 10);
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 1300);
  }
}

// Reset the grid for the current round
function resetGame() {
  bonus = 0;
  bonusEl.textContent = bonus;
  buildGrid(true);
  document.getElementById('success').style.display = 'none';
}

// Hide the instruction overlay
function hideInstruction() {
  document.getElementById('instruction').style.display = 'none';
}

document.getElementById('instruction').style.display = 'flex';
buildGrid();
document.getElementById('hideInstructionBtn').onclick = hideInstruction;
document.getElementById('resetBtn').onclick = resetGame;
document.getElementById('startFlowBtn').onclick = startFlow;
document.getElementById('nextLevelBtn').onclick = function() {
  // When Next Round is pressed, go to the next round if not at max
  if (currentRound < maxRounds) {
    currentRound++;
    bonus = 0;
    bonusEl.textContent = bonus;
    buildGrid(false); // false means new grid
    document.getElementById('success').style.display = 'none';
  } else {
    // If finished all rounds, show overlay message
    document.getElementById('success').style.display = 'none';
    document.getElementById('finished').style.display = 'flex';
  }
};
document.getElementById('nextRoundBtn').onclick = function() {
  // Go to next round, generate new grid, hide overlay
  currentRound++;
  bonus = 0;
  bonusEl.textContent = bonus;
  buildGrid(false);
  document.getElementById('roundComplete').style.display = 'none';
};
document.getElementById('playAgainAllBtn').onclick = function() {
  // Restart from round 1 and reset points
  currentRound = 1;
  points = 0;
  pointsEl.textContent = points;
  bonus = 0;
  bonusEl.textContent = bonus;
  buildGrid(false);
  document.getElementById('finished').style.display = 'none';
};
document.getElementById('stopBtn').onclick = function() {
  // Show goodbye overlay
  document.getElementById('finished').style.display = 'none';
  document.getElementById('goodbye').style.display = 'flex';
};
document.getElementById('playAgainBtn').onclick = resetGame;
