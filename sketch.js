let gameState = "dialog"; // "dialog" | "game" | "gameOver"
let dialogState = "idle"; // "idle" | "typing" | "waiting" (for continue) | "choice"
let dialogcharacterImg;
let initialChoiceDone = false;
let cornerImages = {};
let currentCornerImage;
let deathCount = 0;
let milestoneChoiceActive = false;
let currentMilestone = 0;
let milestoneButtons = [];
let bgImg;

let deathDialogs = [
  ["AHH, that is clearly my nose, be careful."],
  ["Okay okay… what part of DO NOT PLUG INTO MY NOSE* you dont understand?"],
  ["You know, this can damage me right?"],
  ["Look, I will dumb this down for you since you dont get it, AVOID THE RED ARROWS"],
  ["Again?? ARE YOU DOING THIS ON PURPOSE."],
  ["My warranty does NOT cover emotional damage."],
  ["I swear you’re trying to send me to cable heaven."],
  ["Stop. Plugging. Me. Into. Pain."],
  ["Ahhhhhhhhh."],
  ["This is fine. I’m fine. Everything is fine. HAHAHA.... wait, hello?"],
  ["I cant see, I cant feel, what are you doing to me."],
];


let enableZigzagArrows = false;
let draggingJoystick = false;
let dragId = null; // track the pointer/finger
let dragStartX = 0;
let dragStartY = 0;
let purpleLines = [];
let purpleLineCooldown = 0;
let playerSlowed = false;
let slowTimer = 0;

let milestoneChoices = {
  5: {
    question: ["Nice, that is 10 percent of all the appliances in the warehouse done."],
    options: ["Only 10 percent?", "This is really easy", "OK", "Sure"],
    postText: ["I dont really like your attiture but keep going I guess."]
  },
  10: {
    question: ["that is 20 percent, watch out, some of those arrows appear to be moving differently now."],
    options: ["Do I have to help you?", "What", "OK", "why is this happening"],
    postText: ["Keep going, you are doing a decent job."]
  },
  15: {
    question: ["that's 30 percent now."],
    options: ["Stop interupting me", "why are we doing this again", "OK", "Huh"],
    postText: ["watch out, dont get tangled in those wires now."]
  },
  20: {
    question: ["We are half way there now."],
    options: ["You mean 40 percent", "Your math is bad", "OK", "I'm bored"],
    postText: ["I don't really care about your math skills."]
  },
  30: {
    question: ["Wow, 45 percent already!"],
    options: ["This is getting tiring", "Can we stop?", "OK", "math's still not right"],
    postText: ["Can you stop complaining?"]
  },
  40: {
    question: ["80 percent done!"],
    options: ["Finally", "This is endless", "OK", "When will this end"],
    postText: ["Just a bit more, you got this!"]
  }, 
  50: {
    question: ["Incredible! that is all of them!"],
    options: ["Yay...", "can I go now", "OK", "That was fun"],
    postText: ["Wait who is there?"]
  }
};

// --- Dialog storage (queue-based) ---
let dialogQueue = [
  "Hey there! who is there..? ⚡",
  "You call that a name? Definitely not as cool as mine.",
  "Call me Cable, I need you to help me charge all the appliances in this warehouse!",
  "But DO NOT plug the cable to my nose, someone did that earlier and it hurt a lot. "
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
let playerSpeed = 5;
let arrows = [];
let arrowSpeed = 0.5;
let score = 0;

// --- Controls ---
let joyX = 0, joyY = 0;
let joystickSize = 60;


// --- Milestones ---
let scoreMilestones = [
  { score: 1, msgs: ["Oooh look at you~ not bad!"] },
  { score: 5, msgs: ["Nice, that is 10 percent of all the appliances in the warehouse done."] },
  { score: 10, msgs: ["that is 20 percent, watch out, some of those arrows appear to be moving differently now."] },
  { score: 15, msgs: ["that's 30 percent now."] },
  { score: 20, msgs: ["Halfway there!"] },
  { score: 30, msgs: ["Wow, 45 percent already!!"] },
  { score: 40, msgs: ["80 percent done!"] },
  { score: 50, msgs: ["Incredible! that is all of them!"] }
]; 

let milestoneIndex = 0;

function preload() { 
  dialogcharacterImg = loadImage("gifproject.GIF");
  cornerImages.default = dialogcharacterImg; 
  cornerImages.death = loadImage("plugnose.PNG");
  bgImg = loadImage("background2.png"); 
}


function getViewportSize() {
  return {
    w: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    h: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
}

function setup() {
  // get correct visible viewport size on mobile
  textFont('Pixelify Sans');
  const vp = getViewportSize();
  let w = vp.w;
  let h = vp.h;

  // create canvas and make it behave like a full-screen element
  let cnv = createCanvas(w, h);
  cnv.style('display', 'block');   // remove inline gap the browser sometimes adds
  cnv.position(0, 0);             // ensure top-left corner

  // optional: prevent touch scrolling/pinch on canvas for better mobile behavior
  if (cnv.elt) {
    cnv.elt.style.touchAction = 'none';
    cnv.elt.style.userSelect = 'none';
  }

  // Recalculate layout sizes (use these global values later if you reference them)
  // If you rely on dialogH/gameH/controlH as variables outside draw(), you can set them:
  // dialogH = height * 0.22; gameH = height * 0.58; controlH = height * 0.20;
  currentCornerImage = cornerImages.default;
  textAlign(LEFT, TOP);
  textSize(18);
  noStroke();
  startTypingNext(); // begin initial dialog
}

function windowResized() {
  // resize canvas to full viewport
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  image(bgImg, 0, 0, width, height);

  let dialogH = height * 0.25;
  let gameH = height * 0.50;
  let controlH = height * 0.25;
  let sideW = 30; // width of the side frames

  // TOP: dialog box (always visible)
  fill(0, 200);
  noStroke();
  rect(0, 0, width, dialogH);
  fill(255);

  // Draw image on right side without warping
  let textMargin = 20;
  let textW = width - textMargin * 3;

  if (currentCornerImage) {
    let aspect = currentCornerImage.width / currentCornerImage.height;
    let imgH = dialogH * 0.9;
    let imgW = imgH * aspect;

    let imgX = width - imgW - 10;
    let imgY = (dialogH - imgH) / 2;

    image(currentCornerImage, imgX, imgY, imgW, imgH);
    textW -= imgW;
  }

  // Draw text slightly to the left
  textSize(min(18, dialogH / 8));
  let textBoxHeight = dialogH * 0.9;
  let lineH = 22;
  let maxLines = floor(textBoxHeight / lineH);

  let lines = typedText.split("\n");
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    typedText = lines.join("\n");
  }

  text(typedText, textMargin, 20, textW, textBoxHeight);

  // Continue arrow logic
  if (showContinueArrow && dialogState === "waiting") {
    textAlign(RIGHT, BOTTOM);
    text("▼", width - 25, dialogH - 15);
    textAlign(LEFT, TOP);
  }

  // MID: game area surrounded by frames
  fill(0, 200);
  rect(0, dialogH, sideW, gameH);              // left frame
  rect(width - sideW, dialogH, sideW, gameH);  // right frame
  // TOP frame (already your dialog, but could add border if needed)
  // BOTTOM frame (optional, already covered by control area)

  // CENTER game screen
//
  fill(10);
  rect(sideW, dialogH, width - 2 * sideW, gameH);

  // Score tracker top-left inside game box
  fill(255);
  textAlign(LEFT, TOP);
  if (gameState === "game") text("Score: " + score, sideW + 10, dialogH + 10);

  // BOTTOM: controller box (always visible)
  fill(0, 200);
  rect(0, dialogH + gameH, width, controlH);

  // Dialog typing update (non-blocking)
  if (dialogState === "typing") updateTyping();

  // Game runs independently when in "game" or even when dialog shows
  if (gameState === "game") {
    playGame(dialogH, gameH, controlH);
  } else if (gameState === "gameOver") {
    showGameOver(dialogH);
  }

  // If queue has lines and nothing is typing, start next automatically
  if (dialogState === "idle" && dialogQueue.length > 0) {
    startTypingNext();
  }

  // If we finished all dialogs and there is a pending choice, create buttons
  if (dialogState === "waiting" && showChoice && !yesBtn && !noBtn) {
    createChoiceButtons();
  }
}


function setCornerImage(name) {
  if (cornerImages[name]) {
    currentCornerImage = cornerImages[name];
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


if (dialogQueue.length === 0 && !initialChoiceDone && gameState === "dialog") {
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
  let btnH = 36;
  let btnY = height - btnH - 20;  // move buttons to bottom of screen
  let spacing = 10;

  yesBtn = createButton("YES");
  noBtn  = createButton("NO");

  // center buttons horizontally
  let totalW = 100 * 2 + spacing; // two buttons of width 100 + spacing
  let startX = width/2 - totalW/2;

  yesBtn.position(startX, btnY);
  yesBtn.size(100, btnH);
  noBtn.position(startX + 100 + spacing, btnY);
  noBtn.size(100, btnH);

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


function createMilestoneButtons(options) {
  milestoneButtons = [];
  let dialogH = height * 0.25;
  let gameH = height * 0.50;
  let controlH = height * 0.25;

  let btnH = 36;
  let spacingX = 10;
  let spacingY = 10;

  // 2 columns, 2 rows
  let cols = 2;
  let rows = ceil(options.length / cols);

  // button width calculation based on control area width
  let totalSpacingX = (cols + 1) * spacingX;
  let btnW = (width - totalSpacingX) / cols;

  // **anchor buttons to the control area (bottom)**
  let startY = dialogH + gameH + spacingY; // top of control area
  let maxY = dialogH + gameH + controlH - btnH - spacingY; // bottom margin inside control area

  for (let i = 0; i < options.length; i++) {
    let col = i % cols;
    let row = floor(i / cols);

    let btnX = spacingX + col * (btnW + spacingX);
    let btnY = startY + row * (btnH + spacingY);

    // ensure buttons never go below control area
    if (btnY > maxY) btnY = maxY - (row * (btnH + spacingY));

    let btn = createButton(options[i]);
    btn.position(btnX, btnY);
    btn.size(btnW, btnH);
    btn.style("font-size", "14px");
    btn.mousePressed(() => milestoneChoiceSelected(i));
    btn.touchStarted(() => { milestoneChoiceSelected(i); return false; });

    milestoneButtons.push(btn);
  }
}


function milestoneChoiceSelected(index) {
  // Remove buttons
  for (let b of milestoneButtons) b.remove();
  milestoneButtons = [];
  milestoneChoiceActive = false;

  // Show postText dialog for milestone
  let postMsgs = milestoneChoices[currentMilestone].postText;
  pushDialogLines(postMsgs);
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
  player = { x: width/2, y: height * 0.25 + (height * 0.55)/2, size: 15 }; 
  arrows = [];
  score = 0;
  arrowSpeed = 0.5;
  milestoneIndex = 0;
  showChoice  = false;
}

function declineGame() {
  clearChoiceButtons();
  dialogQueue = ["Yeah, I don't think so."]; // reset queue to only this line
  typedText = "";
  charIndex = 0;
  dialogState = "idle"; // force idle so startTypingNext runs
  showContinueArrow = false;
  startTypingNext();     // immediately start typing
}

// ---------------- Game logic ----------------
function playGame(dialogH, gameH, controlH) {
  let sideW = 30; // same as in draw()

  // constrain player to game box
  player.x = constrain(player.x, sideW + player.size/2, width - sideW - player.size/2);
  player.y = constrain(player.y, dialogH + player.size/2, dialogH + gameH - player.size/2);

  // draw player
  push();
  translate(player.x, player.y);
  fill(playerSlowed ? color(128, 0, 255) : color(255));
  noStroke();

  let arcWidth = player.size * 0.7;
  let arcHeight = player.size * 1.0;
  arc(0, 0, arcWidth, arcHeight, 0, PI, CHORD);

  let prongWidth = player.size * 0.2;
  let prongHeight = player.size * 0.25;
  rect(-prongWidth - 2, -prongHeight, prongWidth, prongHeight);
  rect(2, -prongHeight, prongWidth, prongHeight);
  pop();

  // spawn arrows
  if (!milestoneChoiceActive) {
    let spawnInterval = max(10, 40 - floor(score / 2));
    if (frameCount % spawnInterval === 0) spawnArrow(dialogH, gameH);
  }

  // spawn purple lines after milestone 30
  if (!milestoneChoiceActive) {
    if (score >= 30 && purpleLineCooldown <= 0) {
      if (random() < 0.02) { 
        spawnPurpleLine(dialogH, gameH);
        purpleLineCooldown = 120; // 2 seconds at 60 FPS
      }
    } else {
      purpleLineCooldown--;
    }

    // update arrows
    for (let i = arrows.length - 1; i >= 0; i--) {
      let a = arrows[i];

      a.x += a.dx * arrowSpeed;
      a.y += a.dy * arrowSpeed;

      if (a.zigzag) {
        if (abs(a.dx) > abs(a.dy)) {
          a.y += sin(frameCount * a.zigFrequency + a.zigPhase) * a.zigAmplitude * 0.1;
        } else {
          a.x += sin(frameCount * a.zigFrequency + a.zigPhase) * a.zigAmplitude * 0.1;
        }
      }

      let topY = dialogH + padding;
      let bottomY = dialogH + gameH - padding;
      let leftX = sideW + padding;
      let rightX = width - sideW - padding;

      if (a.x < leftX || a.x > rightX || a.y < topY || a.y > bottomY) {
        arrows.splice(i, 1);
        continue;
      }

      fill(a.color);
      push();
      translate(a.x, a.y);
      rotate(atan2(a.dy, a.dx));
      triangle(0, 0, -10, -4, -10, 4);
      pop();

      let d = dist(player.x, player.y, a.x, a.y);
      if (d < player.size/2 + 4) {
        if (a.good) {
          score++;
          arrows.splice(i, 1);
          arrowSpeed = min(arrowSpeed + 0.03, 2);
          checkMilestones();
        } else {
          gameState = "gameOver";
          setCornerImage("death");
          dialogQueue = [];
          typedText = "";
          currentDialogText = "";
          dialogState = "idle";
          let index = min(deathCount, deathDialogs.length - 1);
          pushDialogLines(deathDialogs[index]);
          deathCount++;
        }
      }
    }

    // update purple lines
    for (let i = purpleLines.length - 1; i >= 0; i--) {
      let line = purpleLines[i];
      line.x += line.speed;

      fill(128, 0, 255);
      rect(line.x, line.y, line.w, line.h);

      if (player.x + player.size/2 > line.x && player.x - player.size/2 < line.x + line.w &&
          player.y + player.size/2 > line.y && player.y - player.size/2 < line.y + line.h) {
        playerSlowed = true;
        slowTimer = 180; // 3 seconds
      }

      if (line.speed > 0 && line.x > width) purpleLines.splice(i, 1);
      if (line.speed < 0 && line.x + line.w < 0) purpleLines.splice(i, 1);
    }

    if (playerSlowed) {
      playerSpeed = 5 * 0.8;
      slowTimer--;
      if (slowTimer <= 0) {
        playerSlowed = false;
        playerSpeed = 5;
      }
    } else {
      playerSpeed = 5;
    }
  }

  // joystick draw & input
  if (!milestoneChoiceActive) {
    let cx = width/2;
    let cy = dialogH + gameH + controlH/2;

    fill(80); ellipse(cx, cy, joystickSize*2);
    fill(160); ellipse(cx + joyX * joystickSize, cy + joyY * joystickSize, joystickSize);

    player.x += joyX * playerSpeed;
    player.y += joyY * playerSpeed;
  }
}



function touchStarted() {
  let dialogH = height * 0.25;
  let gameH = height * 0.50;
  let controlH = height * 0.25;
  let y = mouseY || (touches.length ? touches[0].y : 0);

  // --- First, check if touch started in joystick area ---
  let cx = width / 2;
  let cy = dialogH + gameH + controlH / 2;
  let dx = mouseX - cx;
  let dy = mouseY - cy;
  if (sqrt(dx * dx + dy * dy) <= joystickSize * 2) {
    draggingJoystick = true;
    dragId = touches.length ? touches[0].id : 'mouse';
    dragStartX = mouseX;
    dragStartY = mouseY;
    return false; // prevent scrolling
  }

  // --- If not joystick, check other clicks/taps ---
  handleClickOrTouch();

  return false; // prevent scrolling
}

function touchMoved() {
  if (!draggingJoystick) return;

  let dialogH = height * 0.25;
  let gameH = height * 0.50;
  let controlH = height * 0.25;
  let cx = width / 2;
  let cy = dialogH + gameH + controlH / 2;

  // Track the same finger if touch, or mouse
  let tx = touches.length ? touches[0].x : mouseX;
  let ty = touches.length ? touches[0].y : mouseY;

  let dx = tx - cx;
  let dy = ty - cy;

  // Constrain handle visually
  let mag = sqrt(dx*dx + dy*dy);
  if (mag > joystickSize) {
    dx = dx / mag * joystickSize;
    dy = dy / mag * joystickSize;
  }

  // Update normalized joystick values
  let deadzone = 0.1; // small movements ignored
let sensitivity = 0.7; // scale input down

joyX = dx / joystickSize;
joyY = dy / joystickSize;

// clamp between -1 and 1
joyX = constrain(joyX, -1, 1);
joyY = constrain(joyY, -1, 1);

// apply deadzone
if (abs(joyX) < deadzone) joyX = 0;
if (abs(joyY) < deadzone) joyY = 0;

// scale response
joyX *= sensitivity;
joyY *= sensitivity;

  return false; // prevent scroll
}

function touchEnded() {
  // Only reset if this finger/mouse was controlling joystick
  if (!draggingJoystick) return;

  // Check if the current dragId is gone (for multi-touch safety)
  if (dragId === 'mouse' || touches.length === 0) {
    draggingJoystick = false;
    dragId = null;
    joyX = 0;
    joyY = 0;
  }
}
// ---------------- Milestones (non-blocking) ----------------
function checkMilestones() {
  while (milestoneIndex < scoreMilestones.length) {
    let milestone = scoreMilestones[milestoneIndex];
    if (score >= milestone.score) {
      // Check if milestone has choices
      if (milestoneChoices[milestone.score] && !milestoneChoiceActive) {
        milestoneChoiceActive = true;
        currentMilestone = milestone.score;

        // Show cable guy question
        pushDialogLines(milestoneChoices[milestone.score].question);

        // Create buttons for choices
        createMilestoneButtons(milestoneChoices[milestone.score].options);
      } else {
        // If no choices, just show normal milestone msgs
        pushDialogLines(milestone.msgs);
      }

      // Special milestone effects
      if (milestone.score === 10 && !enableZigzagArrows) {
        enableZigzagArrows = true;
        // pushDialogLines(["Uh oh… arrows might start zigzagging now!"]);
      }

      milestoneIndex++;
    } else break;
  }
}

// ---------------- Arrow spawn ----------------
function spawnArrow(dialogH, gameH) {
  let sideW = 30; // same border width as playGame
  let topY = dialogH + padding;
  let bottomY = dialogH + gameH - padding;
  let leftX = sideW + padding;
  let rightX = width - sideW - padding;

  let side = floor(random(8));
  let a = { x: 0, y: 0, dx: 0, dy: 0, speed: arrowSpeed, good: random() < 0.3 };

  if (side === 0) { a.x = leftX;  a.y = random(topY, bottomY); a.dx = 1;    a.dy = 0; } // left
  else if (side === 1) { a.x = rightX; a.y = random(topY, bottomY); a.dx = -1;   a.dy = 0; } // right
  else if (side === 2) { a.x = random(leftX, rightX); a.y = topY;    a.dx = 0;    a.dy = 1; } // top
  else if (side === 3) { a.x = random(leftX, rightX); a.y = bottomY; a.dx = 0;    a.dy = -1; } // bottom
  else if (side === 4) { a.x = leftX;  a.y = topY;    a.dx = 0.7;  a.dy = 0.7; }
  else if (side === 5) { a.x = rightX; a.y = topY;    a.dx = -0.7; a.dy = 0.7; }
  else if (side === 6) { a.x = leftX;  a.y = bottomY; a.dx = 0.7;  a.dy = -0.7; }
  else { a.x = rightX; a.y = bottomY; a.dx = -0.7; a.dy = -0.7; }

  a.color = a.good ? color(0,255,0) : color(255,0,0);

  // Zigzag arrows
  if (enableZigzagArrows && random() < 0.5) { 
    a.zigzag = true;
    a.zigAmplitude = random(10, 25);
    a.zigFrequency = random(0.05, 0.15);
    a.zigPhase = random(TWO_PI);
  }

  arrows.push(a);
}

function spawnPurpleLine(dialogH, gameH) {
  let attachedTop = random() < 0.5;   // top or bottom
  let fromLeft = random() < 0.5;      // direction
  let lineHeight = gameH / 2;
  let y = attachedTop ? dialogH : dialogH + gameH - lineHeight;
  let x = fromLeft ? 0 : width;
  let speed = fromLeft ? 3 : -3;

  purpleLines.push({
    x: x,
    y: y,
    w: 4,
    h: lineHeight,
    speed: speed,
    attachedTop: attachedTop
  });
}


// ---------------- GameOver ----------------
function showGameOver(dialogH) {
  fill(255);
  textAlign(CENTER);
  textAlign(LEFT, TOP);
}

function resetGame() {
  arrows = [];
  arrowSpeed = 0.5;
  score = 0;
  milestoneIndex = 0;
  dialogQueue = ["Ready for another try?"];
  typedText = "";
  currentDialogText = "";
  dialogState = "idle";
  showContinueArrow = false;
  showChoice = false;
  enableZigzagArrows = false;   // <--- reset zigzag arrows
  clearChoiceButtons();
  gameState = "dialog";
  setCornerImage("default");  
  startTypingNext();
}
 
