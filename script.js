// --- Canvas Background Animation ---
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
let shapes = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let hue = 0;

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createAsymmetricShapes();
}

function createAsymmetricShapes() {
  shapes = [];
  const maxShapes = 75;
  const placementAttempts = 50;

  for (let i = 0; i < maxShapes; i++) {
    let validPlacement = false;
    let newShape;

    for (let j = 0; j < placementAttempts; j++) {
      const size = Math.random() * 35 + 25;
      const minDistance = size * 3;
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
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          depth: Math.random() * 0.4 + 0.1,
          pulseOffset: Math.random() * Math.PI * 2,
        };
        validPlacement = true;
        break;
      }
    }
    if (validPlacement) shapes.push(newShape);
  }
}

function drawPolygon(x, y, size, angle, sides) {
  ctx.beginPath();
  const angleStep = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const currentAngle = angleStep * i + angle;
    ctx.lineTo(
      x + size * Math.cos(currentAngle),
      y + size * Math.sin(currentAngle)
    );
  }
  ctx.closePath();
  ctx.stroke();
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const time = Date.now() * 0.0005;
  hue = (hue + 0.5) % 360;

  shapes.forEach((shape) => {
    shape.x += shape.vx;
    shape.y += shape.vy;
    if (shape.x - shape.size < -50 || shape.x + shape.size > canvas.width + 50)
      shape.vx *= -1;
    if (shape.y - shape.size < -50 || shape.y + shape.size > canvas.height + 50)
      shape.vy *= -1;

    if (shape.morphProgress >= 1) {
      if (Math.random() < 0.002) {
        shape.sides = shape.targetSides;
        shape.targetSides = Math.floor(Math.random() * 6) + 3;
        shape.morphProgress = 0;
      }
    } else {
      shape.morphProgress += 0.01;
    }

    const interpolatedSides =
      shape.sides + (shape.targetSides - shape.sides) * shape.morphProgress;

    const dx = mouse.x - canvas.width / 2;
    const dy = mouse.y - canvas.height / 2;
    const offsetX = dx * shape.depth * 0.1;
    const offsetY = dy * shape.depth * 0.1;
    const shapeX = shape.x - offsetX;
    const shapeY = shape.y - offsetY;

    const distToMouse = Math.sqrt(
      (shapeX - mouse.x) ** 2 + (shapeY - mouse.y) ** 2
    );
    const glowRadius = 250;

    if (distToMouse < glowRadius) {
      const intensity = 1 - distToMouse / glowRadius;
      ctx.shadowBlur = intensity * 35;
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.5 + intensity * 0.5})`;
    } else {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(55, 65, 81, 0.7)";
    }

    ctx.lineWidth = 1.5;

    const pulse = Math.sin(time * 2 + shape.pulseOffset) * 2;
    const currentSize = shape.size + pulse;
    const rotation = time * shape.depth;

    drawPolygon(shapeX, shapeY, currentSize, rotation, interpolatedSides);
  });

  ctx.shadowBlur = 0;
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animate();

// --- Interactive Loop Logic ---
const forInBtn = document.getElementById("run-for-in");
const forOfBtn = document.getElementById("run-for-of");
const forInOutput = document.getElementById("for-in-output");
const forOfOutput = document.getElementById("for-of-output");
const forInObjectDisplay = document.getElementById("for-in-object-display");
const forOfArrayDisplay = document.getElementById("for-of-array-display");

const userProfile = {
  username: "Alex",
  level: 12,
  is_active: true,
};

const userBadges = ["Gold", "First-Post", "Top-Commenter"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function typeText(element, text) {
  const div = document.createElement("div");
  element.appendChild(div);
  for (const char of text) {
    div.textContent += char;
    await sleep(50);
  }
}

forInBtn.addEventListener("click", async () => {
  forInBtn.disabled = true;
  forOfBtn.disabled = true;
  forInOutput.innerHTML = "";
  forInObjectDisplay.classList.add("highlight");
  await sleep(1000);

  for (const key in userProfile) {
    const keyElement = document.getElementById(`key-${key}`);
    if (keyElement) keyElement.classList.add("highlight");
    await typeText(forInOutput, key);
    await sleep(500);
    if (keyElement) keyElement.classList.remove("highlight");
  }

  await sleep(500);
  forInObjectDisplay.classList.remove("highlight");
  forInBtn.disabled = false;
  forOfBtn.disabled = false;
});

forOfBtn.addEventListener("click", async () => {
  forInBtn.disabled = true;
  forOfBtn.disabled = true;
  forOfOutput.innerHTML = "";
  forOfArrayDisplay.classList.add("highlight");
  await sleep(1000);

  for (const badge of userBadges) {
    // --- BUG FIX IS HERE ---
    // The .replace() was removed. Now it correctly finds IDs with hyphens.
    const badgeId = `val-${badge.toLowerCase()}`;
    const valueElement = document.getElementById(badgeId);

    if (valueElement) valueElement.classList.add("highlight");
    await typeText(forOfOutput, `'${badge}'`);
    await sleep(500);
    if (valueElement) valueElement.classList.remove("highlight");
  }

  await sleep(500);
  forOfArrayDisplay.classList.remove("highlight");
  forInBtn.disabled = false;
  forOfBtn.disabled = false;
});
