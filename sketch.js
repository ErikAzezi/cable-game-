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
let deathDialogs = [
  ["BRO, that is clearly my nose, be careful."],
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
    postText: ["Arrows are speeding up, be careful of my nose!"]
  },
  20: {
    question: ["We are half way there now."],
    options: ["You mean 40 percent", "Your math is bad", "OK", "I'm bored"],
    postText: ["WATCH OUT FOR THOSE PURPLE ARROWS, they will slow you down"]
  },
  30: {
    question: ["Wow, 45 percent already!"],
    options: ["This is getting tiring", "Can we stop?", "OK", "math's not right"],
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
  "But DO NOT plug my cable to my nose please, The last person did that and I am still dizzy from that."
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
  { score: 15, msgs: ["Wow, you're on fire!"] },
  { score: 20, msgs: ["Halfway there!"] },
  { score: 30, msgs: ["You're a pro at this!"] },
  { score: 40, msgs: ["Incredible reflexes!"] },
  { score: 50, msgs: ["Wow, impressive!"] }
]; 

let milestoneIndex = 0;

function preload() { 
  dialogcharacterImg = loadImage("gifproject.GIF");
  cornerImages.default = dialogcharacterImg; 
  cornerImages.death = loadImage("plugnose.PNG");
}


function getViewportSize() {
  return {
    w: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    h: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  };
}

function setup() {
  // get correct visible viewport size on mobile
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
  const vp = getViewportSize();
  resizeCanvas(vp.w, vp.h);

  // Recalculate layout again after resize/orientation change
  dialogH = height * 0.22;
  gameH   = height * 0.58;
  controlH = height * 0.20;
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


function createMilestoneButtons(options) {
  milestoneButtons = [];
  let dialogH = height * 0.25;
  let btnH = 36;
  let gameH = height * 0.55;
  let controlH = height * 0.20;
  let btnY = dialogH + gameH + controlH/2 - btnH/2;
  let spacing = 10;
  let totalW = options.length * 100 + (options.length - 1) * spacing;
  let startX = width/2 - totalW/2;

  for (let i = 0; i < options.length; i++) {
    let btn = createButton(options[i]);
    btn.position(startX + i*110, btnY);
    btn.size(100, btnH);
    btn.style("font-size", "16px");
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
  player = { x: width/2, y: height * 0.25 + (height * 0.55)/2, size: 30 };
  arrows = [];
  score = 0;
  arrowSpeed = 3;
  milestoneIndex = 0;
  showChoice  = false;
}

function declineGame() {
  clearChoiceButtons();
  pushDialogLines(["Yeah, I dont think so."]);
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
  if (!milestoneChoiceActive) { // Pause arrows when choice is active
  // spawn arrows
  let spawnInterval = max(10, 40 - floor(score / 2));
  if (frameCount % spawnInterval === 0) spawnArrow(dialogH, gameH);
}

  // update arrows
 if (!milestoneChoiceActive) { // Pause arrow movement & collisions during milestone choice
  for (let i = arrows.length - 1; i >= 0; i--) {
    let a = arrows[i];
    fill(a.color);
    push();
    translate(a.x, a.y);
    rotate(atan2(a.dy, a.dx));
    triangle(0, 0, -20, -8, -20, 8);
    pop();

    // Zigzag motion
    if (a.zigzag) {
      if (abs(a.dx) > abs(a.dy)) {
        a.y += sin(frameCount * a.zigFrequency + a.zigPhase) * a.zigAmplitude * 0.1;
      } else {
        a.x += sin(frameCount * a.zigFrequency + a.zigPhase) * a.zigAmplitude * 0.1;
      }
    }

    // regular movement
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

    if (a.x < 0 - padding || a.x > width + padding || a.y < dialogH + padding || a.y > dialogH + gameH - padding) {
      arrows.splice(i, 1);
    }
  }
} // [CHANGE] End milestoneChoiceActive check

  // joystick draw & input
if (!milestoneChoiceActive) { // [CHANGE] Only run joystick & movement if no milestone choice is active

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

} // [CHANGE] End milestoneChoiceActive check
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
        pushDialogLines(["Uh oh… arrows might start zigzagging now!"]);
      }

      milestoneIndex++;
    } else break;
  }
}

// ---------------- Arrow spawn ----------------
function spawnArrow(dialogH, gameH) {
  let side = floor(random(8));
  let a = { x:0, y:0, dx:0, dy:0, speed:arrowSpeed, good: random() < 0.2 };
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

  // --- Zigzag feature ---
  if (enableZigzagArrows && random() < 0.5) { 
    a.zigzag = true;
    a.zigAmplitude = random(10, 25);
    a.zigFrequency = random(0.05, 0.15);
    a.zigPhase = random(TWO_PI);
  }

  arrows.push(a);
}
// ---------------- GameOver ----------------
function showGameOver(dialogH) {
  fill(255);
  textAlign(CENTER);
  textAlign(LEFT, TOP);
}

function resetGame() {
  arrows = [];
  arrowSpeed = 3;
  score = 0;
  milestoneIndex = 0;
  dialogQueue = ["Ready for another try?"];
  typedText = "";
  currentDialogText = "";
  dialogState = "idle";
  showContinueArrow = false;
  showChoice = false;
  clearChoiceButtons();
  gameState = "dialog";
  setCornerImage("default");  
  startTypingNext();
}
 
