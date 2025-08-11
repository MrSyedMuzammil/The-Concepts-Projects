// --- Animated Background Logic (Identical) ---
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
let shapes = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let hue = 0;
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("resize", resizeCanvas);
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createAsymmetricShapes();
}
function createAsymmetricShapes() {
  shapes = [];
  const maxShapes = 150;
  const placementAttempts = 50;
  for (let i = 0; i < maxShapes; i++) {
    let validPlacement = false,
      newShape;
    for (let j = 0; j < placementAttempts; j++) {
      const size = Math.random() * 60 + 10;
      const minDistance = size * 2.5;
      const x = Math.random() * (canvas.width + 200) - 100;
      const y = Math.random() * (canvas.height + 200) - 100;
      let isOverlapping = false;
      for (const existingShape of shapes) {
        const dist = Math.sqrt(
          (existingShape.x - x) ** 2 + (existingShape.y - y) ** 2
        );
        if (dist < minDistance) {
          isOverlapping = true;
          break;
        }
      }
      if (!isOverlapping) {
        const sides = Math.floor(Math.random() * 6) + 3;
        newShape = {
          x,
          y,
          size,
          sides,
          targetSides: sides,
          morphProgress: 1,
          targetSize: size,
          sizeProgress: 1,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          rotationOffset: Math.random() * Math.PI * 2,
        };
        validPlacement = true;
        break;
      }
    }
    if (validPlacement) shapes.push(newShape);
  }
}
function drawPolygon(x, y, size, angle, sides, isGlowing, intensity) {
  const angleStep = (Math.PI * 2) / sides;
  if (isGlowing) {
    for (let i = 0; i < sides; i++) {
      const currentAngle = angleStep * i + angle;
      const nextAngle = angleStep * (i + 1) + angle;
      const startX = x + size * Math.cos(currentAngle),
        startY = y + size * Math.sin(currentAngle);
      const endX = x + size * Math.cos(nextAngle),
        endY = y + size * Math.sin(nextAngle);
      const sideHue = (hue + i * (360 / sides)) % 360;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.shadowBlur = intensity * 45;
      ctx.shadowColor = `hsl(${sideHue}, 100%, 60%)`;
      ctx.strokeStyle = `hsla(${sideHue}, 100%, 70%, ${0.6 + intensity * 0.4})`;
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const currentAngle = angleStep * i + angle;
      ctx.lineTo(
        x + size * Math.cos(currentAngle),
        y + size * Math.sin(currentAngle)
      );
    }
    ctx.closePath();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(55, 65, 81, 0.7)";
    ctx.stroke();
  }
}
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const time = Date.now() * 0.0005;
  hue = (hue + 0.5) % 360;
  shapes.forEach((shape) => {
    shape.x += shape.vx;
    shape.y += shape.vy;
    if (
      shape.x - shape.size < -100 ||
      shape.x + shape.size > canvas.width + 100
    )
      shape.vx *= -1;
    if (
      shape.y - shape.size < -100 ||
      shape.y + shape.size > canvas.height + 100
    )
      shape.vy *= -1;
    if (shape.morphProgress >= 1) {
      if (Math.random() < 0.01) {
        shape.sides = shape.targetSides;
        shape.targetSides = Math.floor(Math.random() * 6) + 3;
        shape.morphProgress = 0;
      }
    } else {
      shape.morphProgress += 0.01;
    }
    const interpolatedSides =
      shape.sides + (shape.targetSides - shape.sides) * shape.morphProgress;
    if (shape.sizeProgress >= 1) {
      if (Math.random() < 0.01) {
        shape.size = shape.targetSize;
        shape.targetSize = Math.random() * 60 + 10;
        shape.sizeProgress = 0;
      }
    } else {
      shape.sizeProgress += 0.005;
    }
    const interpolatedSize =
      shape.size + (shape.targetSize - shape.size) * shape.sizeProgress;
    const shapeX = shape.x,
      shapeY = shape.y;
    const distToMouse = Math.sqrt(
      (shapeX - mouse.x) ** 2 + (shapeY - mouse.y) ** 2
    );
    const glowRadius = 150;
    let isGlowing = false,
      intensity = 0;
    if (distToMouse < glowRadius) {
      isGlowing = true;
      intensity = 1 - distToMouse / glowRadius;
    }
    ctx.lineWidth = 1.5;
    const rotation = time + shape.rotationOffset;
    drawPolygon(
      shapeX,
      shapeY,
      interpolatedSize,
      rotation,
      interpolatedSides,
      isGlowing,
      intensity
    );
  });
  ctx.shadowBlur = 0;
  requestAnimationFrame(animate);
}
resizeCanvas();
animate();

// --- Set & Map Playground Logic ---

const setInput = document.getElementById("set-input"),
  setAddBtn = document.getElementById("set-add-btn"),
  setContainer = document.getElementById("set-container"),
  setOpInput = document.getElementById("set-op-input"),
  setHasBtn = document.getElementById("set-has-btn"),
  setLog = document.getElementById("set-log"),
  mySet = new Set();
const mapKeyInput = document.getElementById("map-key-input"),
  mapValueInput = document.getElementById("map-value-input"),
  mapAddBtn = document.getElementById("map-add-btn"),
  mapContainer = document.getElementById("map-container"),
  mapOpInput = document.getElementById("map-op-input"),
  mapGetBtn = document.getElementById("map-get-btn"),
  mapLog = document.getElementById("map-log"),
  myMap = new Map();

// --- Helper for animated logs ---
function showLog(logEl, message, isSuccess) {
  logEl.innerHTML = ""; // Clear previous log
  const msgDiv = document.createElement("div");
  const successClass = isSuccess ? "log-success" : "log-fail";
  const icon = isSuccess ? "✓" : "✗";

  msgDiv.className = `log-message ${successClass}`;
  msgDiv.innerHTML = `<span class="mr-2 font-bold">${icon}</span> <span>${message}</span>`;

  logEl.appendChild(msgDiv);
}

// --- Set Logic ---
function renderSet() {
  setContainer.innerHTML = "";
  mySet.forEach((value) => {
    const item = document.createElement("div");
    item.className =
      "set-item bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center gap-2";
    item.textContent = value;
    item.dataset.value = value;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.className =
      "text-yellow-500 hover:text-yellow-300 font-bold -mr-1";
    deleteBtn.onclick = () => {
      mySet.delete(value);
      renderSet();
    };
    item.appendChild(deleteBtn);
    setContainer.appendChild(item);
  });
}

function handleSetAdd() {
  const value = setInput.value.trim();
  if (!value) return;
  if (mySet.has(value)) {
    const existingItem = setContainer.querySelector(`[data-value="${value}"]`);
    if (existingItem) {
      existingItem.classList.add("flash-exists");
      setTimeout(() => existingItem.classList.remove("flash-exists"), 700);
    }
  } else {
    mySet.add(value);
    renderSet();
    const newItem = setContainer.querySelector(`[data-value="${value}"]`);
    if (newItem) {
      newItem.classList.add("flash-add");
      setTimeout(() => newItem.classList.remove("flash-add"), 700);
    }
  }
  setInput.value = "";
  setInput.focus();
}

function handleSetHas() {
  const value = setOpInput.value.trim();
  if (!value) return;
  const hasValue = mySet.has(value);
  const message = `.has('<strong class="text-white">${value}</strong>') &nbsp;=&gt;&nbsp; <strong>${hasValue}</strong>`;
  showLog(setLog, message, hasValue);
}

setAddBtn.addEventListener("click", handleSetAdd);
setInput.addEventListener(
  "keydown",
  (e) => e.key === "Enter" && handleSetAdd()
);
setHasBtn.addEventListener("click", handleSetHas);
setOpInput.addEventListener(
  "keydown",
  (e) => e.key === "Enter" && handleSetHas()
);

// --- Map Logic ---
function renderMap() {
  mapContainer.innerHTML = "";
  myMap.forEach((value, key) => {
    const item = document.createElement("div");
    item.className = "flex items-center gap-2";
    item.dataset.key = key;
    item.innerHTML = `<div class="map-key bg-blue-500/20 text-blue-300 px-3 py-1 rounded-md text-sm">${key}</div><span class="text-gray-500">→</span><div class="map-value bg-gray-700 text-white px-3 py-1 rounded-md text-sm">${value}</div>`;
    mapContainer.appendChild(item);
  });
}

function handleMapSet() {
  const key = mapKeyInput.value.trim();
  const value = mapValueInput.value.trim();
  if (!key || !value) return;
  const existed = myMap.has(key);
  myMap.set(key, value);
  renderMap();
  const item = mapContainer.querySelector(`[data-key="${key}"]`);
  if (item) {
    const flashClass = existed ? "flash-update" : "flash-add";
    item.classList.add(flashClass);
    setTimeout(() => item.classList.remove(flashClass), 700);
  }
  mapKeyInput.value = "";
  mapValueInput.value = "";
  mapKeyInput.focus();
}

function handleMapGet() {
  const key = mapOpInput.value.trim();
  if (!key) return;
  const value = myMap.get(key);
  const hasKey = value !== undefined;
  const valueString = hasKey
    ? `'<strong class="text-white">${value}</strong>'`
    : `<strong>undefined</strong>`;
  const message = `.get('<strong class="text-white">${key}</strong>') &nbsp;=&gt;&nbsp; ${valueString}`;
  showLog(mapLog, message, hasKey);
}

mapAddBtn.addEventListener("click", handleMapSet);
mapKeyInput.addEventListener(
  "keydown",
  (e) => e.key === "Enter" && mapValueInput.focus()
);
mapValueInput.addEventListener(
  "keydown",
  (e) => e.key === "Enter" && handleMapSet()
);
mapGetBtn.addEventListener("click", handleMapGet);
mapOpInput.addEventListener(
  "keydown",
  (e) => e.key === "Enter" && handleMapGet()
);

renderSet();
renderMap();
