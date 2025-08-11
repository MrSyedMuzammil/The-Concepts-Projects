// --- Animated Background Logic (Identical to previous version) ---
const canvas = document.getElementById("canvas-bg");
const ctx = canvas.getContext("2d");
let shapes = [];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let hue = 0;

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
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

// --- Interactive Demo Logic ---
const runBreakBtn = document.getElementById("run-break");
const runContinueBtn = document.getElementById("run-continue");
const breakOutput = document.getElementById("break-output");
const continueOutput = document.getElementById("continue-output");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Break Demo ---
runBreakBtn.addEventListener("click", async () => {
  runBreakBtn.disabled = true;
  runContinueBtn.disabled = true;
  breakOutput.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    breakOutput.appendChild(span);
    await sleep(400);

    if (i === 5) {
      span.classList.add("stopped");
      const stopMsg = document.createElement("span");
      stopMsg.textContent = "...BREAK!";
      stopMsg.classList.add("text-red-400", "ml-2");
      breakOutput.appendChild(stopMsg);
      break; // The actual break statement
    }
  }

  runBreakBtn.disabled = false;
  runContinueBtn.disabled = false;
});

// --- Continue Demo ---
runContinueBtn.addEventListener("click", async () => {
  runBreakBtn.disabled = true;
  runContinueBtn.disabled = true;
  continueOutput.innerHTML = "";

  for (let i = 1; i <= 10; i++) {
    const span = document.createElement("span");
    span.textContent = i;
    continueOutput.appendChild(span);
    await sleep(400);

    if (i === 5) {
      span.classList.add("skipped");
      continue; // The actual continue statement
    }
  }

  runBreakBtn.disabled = false;
  runContinueBtn.disabled = false;
});
