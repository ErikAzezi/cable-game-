let gameState = "dialog"; // "dialog" | "game" | "gameOver"
let dialogState = "idle"; // "idle" | "typing" | "waiting" (for continue) | "choice"
let dialogcharacterImg;
// --- Dialog storage (queue-based) ---
let dialogQueue = [
  "Hey there! who is there..? ⚡",
  "Do you think you could attach me to the correct appliances?",
  "Great! however, please be mindful of the red currents- they can damage me!"
];
let currentDialogText = "";
let typedText = "";
let typingSpeed = 10;
let lastTypeTime = 0;
let charIndex = 0;
let showContinueArrow = false;
let showChoice = false;
let yesBtn = null, noBtn = null;
let padding = 10;

// --- Game ---
let player = null;
let playerSpeed = 8
let arrows = [];
let arrowSpeed = 1;
let score = 0;

// --- Controls ---
let joyX = 0, joyY = 0;
let joystickSize = 60;


// --- Milestones ---
let scoreMilestones = [
  { score: 1, msgs: ["Oooh look at you~ not bad!"] },
  { score: 5, msgs: ["Don't get excited, things are speeding up~"] },
  { score: 10, msgs: ["Keep it up! You're doing great!"] },
  { score: 50, msgs: ["Wow, impressive!"] }, 
  { score: 100, msgs: ["Unstoppable! You're a dodge master!"] }
]; 

// let interactableDialog = [
//   {dialog2: [
//     { answer: 1, msgs: ["blab"] },
//     { answer: 2, msgs: ["blab"] },
//   ], text: " 50 scores, want to continue ?"}
// ]
// function dialogInteration(){
//   switch(button) {
//     case 2: showGameOver()
//   }
// }

let milestoneIndex = 0;

function preload() {
  dialogcharacterImg = loadImage("Image1.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, TOP);
  textSize(18);
  noStroke();
  startTypingNext(); // begin initial dialog
}

function draw() {
  background(0);
  let dialogH = height * 0.25;
  let gameH = height * 0.55;
  let controlH = height * 0.20;
  // TOP: dialog box (always visible)
  fill(30);
  rect(0, 0, width, dialogH);
  fill(255);

// Draw image on right side without warping
let textMargin = 20;
let textW = width - textMargin * 3;

if (dialogcharacterImg) {
  let aspect = dialogcharacterImg.width / dialogcharacterImg.height;
  let imgH = dialogH * 0.9;
  let imgW = imgH * aspect;
  let imgX = width - imgW - 10;
  let imgY = (dialogH - imgH) / 2;
  image(dialogcharacterImg, imgX, imgY, imgW, imgH);
  textW -= imgW; // reduce text space to make room for image
}

// Draw text slightly to the left
text(typedText, textMargin, 20, textW, dialogH - 40);

// Continue arrow logic
if (showContinueArrow && dialogState === "waiting") {
  textAlign(RIGHT, BOTTOM);
  text("▼", width - 25, dialogH - 15);
  textAlign(LEFT, TOP);
}

  // MID: game box (always visible)
  fill(10);
  rect(0, dialogH, width, gameH);

  // Score tracker top-left inside game box
  fill(255);
  textAlign(LEFT, TOP);
  if (gameState === "game") text("Score: " + score, 10, dialogH + 10);

  // BOTTOM: controller box (always visible)
  fill(20);
  rect(0, dialogH + gameH, width, controlH);

  // Dialog typing update (non-blocking)
  if (dialogState === "typing") updateTyping();

  // Game runs independently when in "game" or even when dialog shows
  if (gameState === "game") {
    playGame(dialogH, gameH, controlH);
  } else if (gameState === "gameOver") {
    showGameOver(dialogH);
  }

  // If queue has lines and nothing is typing, start next automatically (visible in top box)
  if (dialogState === "idle" && dialogQueue.length > 0) {
    startTypingNext();
  }

  // If we finished all dialogs and there is a pending choice, create buttons
  if (dialogState === "waiting" && showChoice && !yesBtn && !noBtn) {
    createChoiceButtons();
  }
}

// ---------------- Dialog helpers ----------------
  function startTypingNext() {
  if (dialogQueue.length === 0) {
    dialogState = "idle";
    typedText = "";
    showContinueArrow = false;
    return;
  }
  currentDialogText = dialogQueue.shift();
  typedText = "";
  charIndex = 0;
  lastTypeTime = millis();
  dialogState = "typing";
  showContinueArrow = false;

  // Only show YES/NO choice after the last line is typed
  if (dialogQueue.length === 0) {
    // This will trigger after the current line finishes typing
    showChoice = true;
  }
}

function updateTyping() {
  if (charIndex < currentDialogText.length && millis() - lastTypeTime > typingSpeed) {
    typedText += currentDialogText[charIndex];
    charIndex++;
    lastTypeTime = millis();
    if (charIndex >= currentDialogText.length) {
      dialogState = "waiting";
      showContinueArrow = dialogQueue.length > 0 || showChoice;
      // if this line requests choice, ensure showChoice true (buttons created in draw)
      return;
    }
  }
}

function pushDialogLines(lines) {
  for (let l of lines) dialogQueue.push(l);
  // if idle, start immediately (without pausing game)
  if (dialogState === "idle" || gameState === "game") startTypingNext();
}

// ---------------- Input handling ----------------
function mousePressed() { handleClickOrTouch(); }
function touchStarted() { handleClickOrTouch(); return false; } // prevent scroll

function handleClickOrTouch() {
  let dialogH = height * 0.25;
  let y = mouseY || touchY;

  // --- Tap during gameOver restarts ---
  if (gameState === "gameOver") {
    resetGame();
    return;
  }
  // --- Taps in dialog box ---
  if (y <= dialogH) {
    if (dialogState === "typing") {
      typedText = currentDialogText;
      charIndex = currentDialogText.length;
      dialogState = "waiting";
      showContinueArrow = true;
      return;
    } else if (dialogState === "waiting") {
      if (showChoice) return; // must use buttons for choices
      showContinueArrow = false;
      dialogState = "idle";
      startTypingNext();
      return;
    } else {
      startTypingNext();
      return;
    }
  }
}


// ---------------- Choice UI ----------------
function createChoiceButtons() {
  if (yesBtn || noBtn) return;
  let dialogH = height * 0.25;
  let btnH = 36;
  let btnY = dialogH - btnH - 12;
  yesBtn = createButton("YES");
  noBtn  = createButton("NO");
  yesBtn.position(width/2 - 60, btnY);
  noBtn.position(width/2 + 10, btnY);
  yesBtn.style("font-size","16px");
  noBtn.style("font-size","16px");
  yesBtn.mousePressed(() => { clearChoiceButtons(); startGame(); });
  yesBtn.touchStarted(() => { clearChoiceButtons(); startGame(); return false; });

  noBtn.mousePressed(() => { clearChoiceButtons(); declineGame(); });
  noBtn.touchStarted(() => { clearChoiceButtons(); declineGame(); return false; });
}
function clearChoiceButtons() {
  if (yesBtn) { yesBtn.remove(); yesBtn = null; }
  if (noBtn)  { noBtn.remove();  noBtn = null;  }
  showChoice = false;
}

// ---------------- Game flow ----------------
function startGame() {
  clearChoiceButtons();
  // clear any queued dialogs that were start prompts
  dialogQueue = [];
  typedText = "";
  dialogState = "idle";
  showContinueArrow = false;
  gameState = "game";
  player = { x: width/2, y: height * 0.25 + (height * 0.55)/2, size: 30 };
  arrows = [];
  score = 0;
  arrowSpeed = 3;
  milestoneIndex = 0;
  showChoice  = false;
}

function declineGame() {
  clearChoiceButtons();
  pushDialogLines(["Aww come on!", "You can’t escape destiny!", "Would you like to start now?"]);
}

// ---------------- Game logic ----------------
function playGame(dialogH, gameH, controlH) {
  // constrain player to game box
  player.x = constrain(player.x, player.size/2, width - player.size/2);
  player.y = constrain(player.y, dialogH + player.size/2, dialogH + gameH - player.size/2);

  // draw player
  fill(255);
  ellipse(player.x, player.y, player.size);

  // spawn arrows
  let spawnInterval = max(10, 40 - floor(score / 2));
  if (frameCount % spawnInterval === 0) spawnArrow(dialogH, gameH);

  // update arrows
  for (let i = arrows.length - 1; i >= 0; i--) {
    let a = arrows[i];
    fill(a.color);
    push();
    translate(a.x, a.y);
    rotate(atan2(a.dy, a.dx));
    triangle(0, 0, -20, -8, -20, 8);
    pop();

    a.x += a.dx * a.speed;
    a.y += a.dy * a.speed;

    let d = dist(player.x, player.y, a.x, a.y);
    if (d < player.size/2 + 8) {
      if (a.good) {
        score++;
        arrows.splice(i,1);
        arrowSpeed += 0.2;
        checkMilestones();
      } else {
        gameState = "gameOver";
      }
    }

    if (a.x < 0 - padding || a.x > width + padding || a.y < dialogH + padding || a.y > dialogH + gameH - padding) {
      arrows.splice(i, 1);
    }
  }

  // joystick draw & input
  let cx = width/2;
  let cy = dialogH + gameH + controlH/2;
  fill(80); ellipse(cx, cy, joystickSize*2);
  fill(160); ellipse(cx + joyX * joystickSize, cy + joyY * joystickSize, joystickSize);

  if (mouseIsPressed && mouseY > dialogH + gameH) {
    let dx = mouseX - cx;
    let dy = mouseY - cy;
    let mag = sqrt(dx*dx + dy*dy);
    if (mag > 0) {
      joyX = constrain(dx/joystickSize, -1, 1);
      joyY = constrain(dy/joystickSize, -1, 1);
    }
  } else {
    joyX = 0; joyY = 0;
  }

  player.x += joyX * playerSpeed;
  player.y += joyY * playerSpeed;
}

// ---------------- Milestones (non-blocking) ----------------
function checkMilestones() {
  while (milestoneIndex < scoreMilestones.length) {
    let milestone = scoreMilestones[milestoneIndex];
    if (score >= milestone.score) {
      pushDialogLines(milestone.msgs);
      milestoneIndex++;
    } else break;
  }
}

// ---------------- Arrow spawn ----------------
function spawnArrow(dialogH, gameH) {
  let side = floor(random(8));
  let a = { x:0,y:0,dx:0,dy:0,speed:arrowSpeed,good:random() < 0.2 };
  let topY = dialogH + padding;
  let bottomY = dialogH + gameH - padding;
  if (side === 0) { a.x = 0; a.y = random(topY, bottomY); a.dx = 1; a.dy = 0; }
  else if (side === 1) { a.x = width; a.y = random(topY, bottomY); a.dx = -1; a.dy = 0; }
  else if (side === 2) { a.x = random(width); a.y = topY; a.dx = 0; a.dy = 1; }
  else if (side === 3) { a.x = random(width); a.y = bottomY; a.dx = 0; a.dy = -1; }
  else if (side === 4) { a.x = 0; a.y = topY; a.dx = 0.7; a.dy = 0.7; }
  else if (side === 5) { a.x = width; a.y = topY; a.dx = -0.7; a.dy = 0.7; }
  else if (side === 6) { a.x = 0; a.y = bottomY; a.dx = 0.7; a.dy = -0.7; }
  else { a.x = width; a.y = bottomY; a.dx = -0.7; a.dy = -0.7; }
  a.color = a.good ? color(0,255,0) : color(255,0,0);
  arrows.push(a);
}

// ---------------- GameOver ----------------
function showGameOver(dialogH) {
  fill(255);
  textAlign(CENTER);
  text("💀 Oops! Cable got tangled.", width/2, dialogH/2);
  text("Touch anywhere to restart.", width/2, dialogH/2 + 30);
  textAlign(LEFT, TOP);
}

function resetGame() {
  arrows = [];
  arrowSpeed = 3;
  score = 0;
  milestoneIndex = 0;
  dialogQueue = ["Cable’s back online!", "Ready for another round?", "Would you like to start?"];
  typedText = "";
  currentDialogText = "";
  dialogState = "idle";
  showContinueArrow = false;
  showChoice = false;
  clearChoiceButtons();
  gameState = "dialog";
  startTypingNext();
}
 

function windowResized(){ resizeCanvas(windowWidth, windowHeight); }