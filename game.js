const COLORS = ['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#AF52DE', '#FF2D55'];
const MAX_LAYERS = 4;
let tubes = [];
let selectedTube = null;
let isPaused = false;
let level = 1;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateLevel(levelNum) {
  let numColors = Math.min(3 + Math.floor(levelNum / 4), COLORS.length);
  let tubeCount = numColors + 2;
  let colorPool = [];

  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < MAX_LAYERS; j++) {
      colorPool.push(COLORS[i]);
    }
  }

  shuffle(colorPool);

  let baseTubes = Array.from({ length: tubeCount }, () => []);
  let fillIndex = 0;

  while (colorPool.length > 0) {
    let target = baseTubes[fillIndex % (tubeCount - 2)];
    if (target.length < MAX_LAYERS) {
      target.push(colorPool.pop());
    }
    fillIndex++;
  }

  // Add locked tubes (levels 20+)
  if (levelNum >= 20) {
    let lockedTubes = levelNum >= 25 ? 2 : 1;
    for (let i = 0; i < lockedTubes; i++) {
      let idx;
      do {
        idx = Math.floor(Math.random() * tubeCount);
      } while (baseTubes[idx].length === 0 || baseTubes[idx].locked);
      baseTubes[idx] = { colors: baseTubes[idx], locked: true };
    }
  }

  return baseTubes.map(t => (Array.isArray(t) ? { colors: t, locked: false } : t));
}

function render() {
  const container = document.getElementById("tubes-container");
  container.innerHTML = "";

  tubes.forEach((tube, i) => {
    const tubeDiv = document.createElement("div");
    tubeDiv.className = "tube";
    if (tube.locked) {
      tubeDiv.style.opacity = 0.5;
      tubeDiv.title = "Locked Tube";
    }
    tubeDiv.onclick = () => handleTubeClick(i);

    tube.colors.forEach((color, index) => {
      const liquidDiv = document.createElement("div");
      liquidDiv.className = "liquid";
      liquidDiv.style.height = `${100 / MAX_LAYERS}%`;
      liquidDiv.style.bottom = `${(index * 100) / MAX_LAYERS}%`;
      liquidDiv.style.backgroundColor = color;
      tubeDiv.appendChild(liquidDiv);
    });

    container.appendChild(tubeDiv);
  });

  document.getElementById("level-label").innerText = `Level ${level}`;
}

function handleTubeClick(index) {
  if (isPaused) return;

  const clickedTube = tubes[index];
  if (clickedTube.locked) return;

  if (selectedTube === null) {
    if (clickedTube.colors.length === 0) return;
    selectedTube = index;
  } else {
    if (index === selectedTube) {
      selectedTube = null;
      return;
    }

    let from = tubes[selectedTube].colors;
    let to = clickedTube.colors;

    const movingColor = from[from.length - 1];
    if (to.length < MAX_LAYERS && (to.length === 0 || to[to.length - 1] === movingColor)) {
      while (from.length && from[from.length - 1] === movingColor && to.length < MAX_LAYERS) {
        to.push(from.pop());
      }
      selectedTube = null;
      render();
      checkCompletion();
    } else {
      selectedTube = null;
    }
  }
}

function checkCompletion() {
  const completed = tubes.every(tube => {
    const c = tube.colors;
    return c.length === 0 || (c.length === MAX_LAYERS && new Set(c).size === 1);
  });

  if (completed) {
    setTimeout(() => {
      level++;
      if (level > 30) {
        alert("🎉 Congratulations! You completed all 30 levels!");
        level = 1;
      } else {
        alert("✅ Level Complete!");
      }
      startLevel();
    }, 300);
  }
}

function pauseGame() {
  isPaused = true;
}

function resumeGame() {
  isPaused = false;
}

function startLevel() {
  tubes = generateLevel(level);
  render();
}

startLevel();
