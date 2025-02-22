const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const fadeBtn = document.getElementById('fadeBtn');
let context = canvas.getContext('2d');
let dotPositions = [];
let isFaded = false;

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error('Error accessing camera:', error);
  });

// Capture picture from video stream
captureBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Reset state
  dotPositions = [];
  isFaded = false;
});

// Add event listener for placing dots on the canvas
canvas.addEventListener('click', (event) => {
  if (isFaded) {
    // When faded, clicking should reveal the dot if it's at a previously saved position
    revealDot(event);
  } else {
    // When not faded, clicking places new dots
    placeDot(event);
  }
});

// Place a dot on the canvas
function placeDot(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Save the dot's position
  dotPositions.push({ x, y, size: parseInt(dotSizeSlider.value, 10)});

  // Draw the dot
  drawDot(x, y, 'red');
}

// Get the dot size and color controls
const dotSizeSlider = document.getElementById('dotSize');
const dotColorPicker = document.getElementById('dotColor');

// Modify the drawDot function to use the selected size and color
function drawDot(x, y) {
  const dotRadius = parseInt(dotSizeSlider.value, 10);
  const dotColor = dotColorPicker.value;

  context.beginPath();
  context.arc(x, y, dotRadius, 0, 2 * Math.PI, false);
  context.fillStyle = dotColor;
  context.fill();
  context.closePath();
}

// Function to fade the image to black
fadeBtn.addEventListener('click', () => {
  fadeToBlack();
  isFaded = true;
});

// Fade the entire canvas to black
function fadeToBlack() {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Iterate over every pixel and gradually reduce the color values
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 0;     // Red
    data[i + 1] = 0; // Green
    data[i + 2] = 0; // Blue
  }

  // Apply the modified image data to create the fade effect
  context.putImageData(imageData, 0, 0);
}

// Function to "light up" a dot at the saved positions
function revealDot(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Check if the click is near a saved dot position
  for (let dot of dotPositions) {
    const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
    if (distance < dot.size) {
      // Re-draw the dot if the click is within 10px of the saved position
      drawDot(dot.x, dot.y, 'yellow'); // Highlighting with a different color
    }
  }
}
