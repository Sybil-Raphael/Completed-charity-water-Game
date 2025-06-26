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
const maxRounds = 3; // Total number of rounds (changed from 5 to 3)

// Difficulty system variables
let currentDifficulty = 'normal'; // Default difficulty
let difficultySettings = {
  easy: {
    rockChance: 0.04,    // Very few rocks - easier to win
    dirtyChance: 0.02,   // Very few pollution tiles
    bonusChance: 0.08,   // More bonus droplets for extra points
    penalty: 1,          // Lower penalty for hitting obstacles
    pointsReward: 12     // Higher base reward
  },
  normal: {
    rockChance: 0.08,    // Reduced rocks - more winnable
    dirtyChance: 0.04,   // Reduced pollution tiles
    bonusChance: 0.06,   // More bonus droplets
    penalty: 2,          // Standard penalty
    pointsReward: 10     // Standard reward
  },
  hard: {
    rockChance: 0.12,    // Reduced from 0.20 - still challenging but fair
    dirtyChance: 0.06,   // Reduced from 0.12 - still tough but beatable
    bonusChance: 0.04,   // Standard bonus droplets
    penalty: 3,          // Higher penalty
    pointsReward: 8      // Lower base reward
  }
};

// Milestone system - encouraging messages for different scores (adjusted for 3 rounds)
const milestones = [
  { score: 15, message: "Great progress! 🌟", shown: false },
  { score: 30, message: "You're doing amazing! 💪", shown: false },
  { score: 45, message: "Water champion! 🏆", shown: false },
  { score: 60, message: "You're unstoppable! 🔥", shown: false }
];

// Build the grid for the current round
function buildGrid(fromReset = false) {
  gridEl.innerHTML = '';
  if (!fromReset) {
    currentGridTypes = [];
    // Use the same obstacle/bonus frequency for all rounds
    let { rockChance, dirtyChance, bonusChance } = difficultySettings[currentDifficulty];
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
    points = Math.max(0, points - difficultySettings[currentDifficulty].penalty);
    pointsEl.textContent = points;
    showMinusTwoOverlay();
    resetGridToCurrentLayout();
  }
}

// Show penalty overlay when player hits an obstacle
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
  overlay.innerText = `-${difficultySettings[currentDifficulty].penalty}`;
  document.body.appendChild(overlay);
  setTimeout(() => {
    document.body.removeChild(overlay);
  }, 1000);
}

// Reset the grid for the current round
function resetGame() {
  bonus = 0;
  bonusEl.textContent = bonus;
  buildGrid(true);
  document.getElementById('success').style.display = 'none';
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

// Function to play victory sound
function playVictorySound() {
  // Get the audio element
  const victorySound = document.getElementById('victorySound');
  
  // Check if the audio element exists and can play
  if (victorySound) {
    // Reset the audio to the beginning in case it was played before
    victorySound.currentTime = 0;
    
    // Play the sound and handle any errors
    victorySound.play().catch(error => {
      // Log error if sound fails to play (common on some browsers)
      console.log('Could not play victory sound:', error);
    });
  }
}

// Function to check and show milestone messages
function checkMilestones(currentScore) {
  // Loop through each milestone to see if we should show it
  for (let i = 0; i < milestones.length; i++) {
    const milestone = milestones[i];
    
    // Check if player reached this milestone score and hasn't seen this message yet
    if (currentScore >= milestone.score && !milestone.shown) {
      // Mark this milestone as shown so it won't appear again
      milestone.shown = true;
      
      // Show the milestone message to the player
      showMilestoneMessage(milestone.message);
      
      // Only show one milestone at a time, so break out of the loop
      break;
    }
  }
}

// Function to display milestone messages on screen
function showMilestoneMessage(message) {
  // Create a new div element for the milestone message
  const milestoneOverlay = document.createElement('div');
  
  // Style the milestone message overlay
  milestoneOverlay.style.position = 'fixed';
  milestoneOverlay.style.top = '20%';
  milestoneOverlay.style.left = '50%';
  milestoneOverlay.style.transform = 'translate(-50%, -50%)';
  milestoneOverlay.style.fontSize = '1.8rem';
  milestoneOverlay.style.fontWeight = 'bold';
  milestoneOverlay.style.color = '#2E9DF7';
  milestoneOverlay.style.background = 'linear-gradient(135deg, #FFC907, #ffdc42)';
  milestoneOverlay.style.padding = '16px 32px';
  milestoneOverlay.style.borderRadius = '20px';
  milestoneOverlay.style.zIndex = '9999';
  milestoneOverlay.style.boxShadow = '0 6px 20px rgba(255, 201, 7, 0.4)';
  milestoneOverlay.style.fontFamily = 'Montserrat, sans-serif';
  milestoneOverlay.style.textAlign = 'center';
  milestoneOverlay.style.border = '3px solid #2E9DF7';
  
  // Set the message text
  milestoneOverlay.textContent = message;
  
  // Add the overlay to the page
  document.body.appendChild(milestoneOverlay);
  
  // Remove the message after 2.5 seconds
  setTimeout(() => {
    document.body.removeChild(milestoneOverlay);
  }, 2500);
}

// Function to reset milestones when starting a new game
function resetMilestones() {
  // Reset all milestone flags so they can be shown again
  for (let i = 0; i < milestones.length; i++) {
    milestones[i].shown = false;
  }
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
    points += difficultySettings[currentDifficulty].pointsReward + bonus;
    pointsEl.textContent = points;
    
    // Check for milestone messages when points increase
    checkMilestones(points);
    
    document.getElementById('successPoints').textContent = difficultySettings[currentDifficulty].pointsReward + bonus;
    // If not last round, show round complete overlay, else show finished overlay
    if (currentRound < maxRounds) {
      document.getElementById('roundComplete').style.display = 'flex';
    } else {
      // Player finished all rounds - play victory sound!
      playVictorySound();
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

// Hide the instruction overlay
function hideInstruction() {
  document.getElementById('instruction').style.display = 'none';
  // Show difficulty selection after hiding instructions
  document.getElementById('difficultySelect').style.display = 'flex';
}

// Handle difficulty selection
function selectDifficulty(difficulty) {
  currentDifficulty = difficulty;
  console.log(`Selected difficulty: ${difficulty}`);
  // Update the difficulty display in the header
  const difficultyDisplay = document.getElementById('difficultyDisplay');
  difficultyDisplay.textContent = `(${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
  // Hide difficulty selection overlay
  document.getElementById('difficultySelect').style.display = 'none';
  // Rebuild grid with new difficulty settings
  buildGrid(false);
}

// Add event listeners for difficulty buttons
document.getElementById('easyBtn').onclick = function() {
  selectDifficulty('easy');
};

document.getElementById('normalBtn').onclick = function() {
  selectDifficulty('normal');
};

document.getElementById('hardBtn').onclick = function() {
  selectDifficulty('hard');
};

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
  
  // Reset milestones for new game
  resetMilestones();
  
  // Hide finished overlay and show difficulty selection again
  document.getElementById('finished').style.display = 'none';
  document.getElementById('difficultySelect').style.display = 'flex';
};
document.getElementById('stopBtn').onclick = function() {
  // Show goodbye overlay
  document.getElementById('finished').style.display = 'none';
  document.getElementById('goodbye').style.display = 'flex';
};
document.getElementById('playAgainBtn').onclick = resetGame;
