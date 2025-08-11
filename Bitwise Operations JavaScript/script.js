// --- Animated Background Logic ---
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

// --- Modified drawing function for multi-color sides ---
function drawPolygon(
  x,
  y,
  size,
  angle,
  sides,
  isGlowing,
  intensity,
  colorOffset
) {
  const angleStep = (Math.PI * 2) / sides;

  // Draw each side individually to apply unique colors
  for (let i = 0; i < sides; i++) {
    const currentAngle = angleStep * i + angle;
    const nextAngle = angleStep * (i + 1) + angle;

    const startX = x + size * Math.cos(currentAngle);
    const startY = y + size * Math.sin(currentAngle);
    const endX = x + size * Math.cos(nextAngle);
    const endY = y + size * Math.sin(nextAngle);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    if (isGlowing) {
      const sideHue = (hue + i * (360 / sides)) % 360;
      ctx.shadowBlur = intensity * 45;
      ctx.shadowColor = `hsl(${sideHue}, 100%, 60%)`;
      ctx.strokeStyle = `hsla(${sideHue}, 100%, 70%, ${0.6 + intensity * 0.4})`;
    } else {
      // Apply a subtle, cycling color to non-glowing shapes
      const sideHue = (hue + colorOffset * 40 + i * (360 / sides)) % 360;
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `hsla(${sideHue}, 50%, 30%, 0.8)`;
    }
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
    // Pass the shape's unique offset to the draw function for color variation
    drawPolygon(
      shapeX,
      shapeY,
      interpolatedSize,
      rotation,
      interpolatedSides,
      isGlowing,
      intensity,
      shape.rotationOffset
    );
  });
  ctx.shadowBlur = 0;
  requestAnimationFrame(animate);
}
resizeCanvas();
animate();

// --- Bitwise Visualizer Logic ---
const num1Input = document.getElementById("num1");
const num2Input = document.getElementById("num2");
const bin1Display = document.getElementById("bin1");
const bin2Display = document.getElementById("bin2");

const andOpDisplay = document.getElementById("and-op");
const orOpDisplay = document.getElementById("or-op");
const xorOpDisplay = document.getElementById("xor-op");

const andResultDisplay = document.getElementById("and-result");
const orResultDisplay = document.getElementById("or-result");
const xorResultDisplay = document.getElementById("xor-result");

function toBinary(num) {
  return num.toString(2).padStart(8, "0");
}

function updateVisuals() {
  const num1 = parseInt(num1Input.value) || 0;
  const num2 = parseInt(num2Input.value) || 0;

  const bin1 = toBinary(num1);
  const bin2 = toBinary(num2);

  bin1Display.textContent = bin1;
  bin2Display.textContent = bin2;

  const andResult = num1 & num2;
  const orResult = num1 | num2;
  const xorResult = num1 ^ num2;

  renderOperation(andOpDisplay, bin1, bin2, toBinary(andResult), "&");
  renderOperation(orOpDisplay, bin1, bin2, toBinary(orResult), "|");
  renderOperation(xorOpDisplay, bin1, bin2, toBinary(xorResult), "^");

  andResultDisplay.textContent = `${toBinary(andResult)} = ${andResult}`;
  orResultDisplay.textContent = `${toBinary(orResult)} = ${orResult}`;
  xorResultDisplay.textContent = `${toBinary(xorResult)} = ${xorResult}`;
}

// Renders a single operation grid with correct alignment
function renderOperation(container, bin1, bin2, binResult, opSymbol) {
  container.innerHTML = "";

  // First number (with a blank space in the first column)
  container.appendChild(document.createElement("span"));
  for (const bit of bin1) {
    const span = document.createElement("span");
    span.textContent = bit;
    container.appendChild(span);
  }

  // Operator symbol in the first column
  const symbolSpan = document.createElement("span");
  symbolSpan.className = "op-symbol";
  symbolSpan.textContent = opSymbol;
  container.appendChild(symbolSpan);

  // Second number
  for (const bit of bin2) {
    const span = document.createElement("span");
    span.textContent = bit;
    container.appendChild(span);
  }

  // Line
  const line = document.createElement("div");
  line.className = "op-line";
  container.appendChild(line);

  // Result (with a blank space in the first column)
  container.appendChild(document.createElement("span"));
  for (const bit of binResult) {
    const span = document.createElement("span");
    span.className = "result-bit";
    span.textContent = bit;
    container.appendChild(span);
  }
}

num1Input.addEventListener("input", updateVisuals);
num2Input.addEventListener("input", updateVisuals);

updateVisuals();
