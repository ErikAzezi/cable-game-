let gameState = "dialog"; 
let dialogState = "idle"; 
let dialogcharacterImg;
let initialChoiceDone = false;
let cornerImages = {};
let currentCornerImage;
let deathCount = 0;
let milestoneChoiceActive = false;
let currentMilestone = 0;
let milestoneButtons = [];
let bgImg;
let playerImg;
let zapImgs = [];
let plugImg;
let slowEffectImg;
let batImgs = [];
let milestoneCharImg; 
let milestonePostResponseActive = false;
let milestoneResponsePending = false;
let milestoneContinueBtn = null;
let friendlyChoiceCount = 0;   // choices 1 & 2
let unfriendlyChoiceCount = 0; // choices 3 & 4
let gameFinished = false;   
let triggeredMilestones = new Set();

let deathDialogs = [
  ["OWw, that is clearly my own cord. *facepalm*, please be more careful."],
  ["Okay okay… what part of DO NOT PLUG INTO MY NOSE* you dont understand?"],
  ["You know, this can damage me right?"],
  ["Look man, if it looks like my cord, AVOID IT."],
  ["Again?? ARE YOU DOING THIS ON PURPOSE."],
  ["My warranty does NOT cover emotional damage."],
  ["I swear you’re trying to send me to cable heaven."],
  ["Stop. Plugging. Me. Into. Pain."],
  ["Ahhhhhhhhh."],
  ["This is fine. I’m fine. Everything is fine. HAHAHA.... wait, hello?"],
  ["I cant see, I cant feel, what are you doing to me."],
  ["......"],
];


let enableZigzagArrows = false;
let draggingJoystick = false;
let dragId = null; 
let dragStartX = 0;
let dragStartY = 0;
let purpleLines = [];
let purpleLineCooldown = 0;
let playerSlowed = false;
let slowTimer = 0;

let milestoneChoices = {
  5: {
    question: ["Nice, 10 percent, we still have a long way to go though."],
    options: ["Only 10 percent?", "OK", "I don't like your attitude", "cable is a horribe name"],
    postResponses: [
    "I mean, there is a lot of appliances here.",
    "Whew, keep it up then.",
    "Well, I don't like yours too then.",
    "Excuse me? I'm going to ignore you said that."
    ]
  },
  10: {
    question: ["AHHH, there is some current spikes, I can't stop shaking... my cord is moving all over the place. "],
    options: ["what does that even mean?", "OK", "come on, suck it up", "ew"],
    postResponses: [
    "It means, my cords are now zigzagging around, can't you see?",
    "great vocabulary usage there.",
    "why don't you try getting zapped then?",
    "why are you saying ew."
     ]
  },
  15: {
    question: ["that's 30 percent now."],
    options: ["thats halfway there", "we can do this", "OK", "Do you really need me for this?"],
    postResponses: [
    "mmmm, more like 3rd of the way there, but ok",
    "that's what I like to hear",
    "do you know any other word than OK?",
    "come on, Focus, we need to get this done before my boss comes back."
  ]
  },
  20: {
    question: ["you are doing great, lets keep that up!"],
    options: ["thanks man, you too", "we got this", "OK", "screw you"],
    postResponses: [
    "you are starting to make me blush..",
    "yeah we do.",
    "....",
    "srew you too then"
     ]
    },
  30: {
    question: ["Electricity is leaking! those purple lines will slow you down if you touch them."],
    options: ["why is it purple", "can we take a break", "OK", "you're designed poorly"],
    postResponses: [
    "I dont know, maybe its just purple electricity?",
    "No",
    "so you understand what I am saying right?",
    "you look poorly designed too."
     ]
  },
  40: {
    question: ["80 percent done!"],
    options: ["so close", "lets power through", "OK", "stop talking to me"],
    postResponses: [
    "hurray!",
    "just focus, don't lose it now.",
    "OK",
    "FINE!"
     ]
  }, 
  50: {
    question: ["Incredible! that is all of them!"],
    options: ["Yay", "Great job", "Bye", "Where is my money"],
    postResponses: [
    "you were amazing!",
    "Great job to you too, my boss will be pleased.",
    "Bye!",
    "umm, payment is not really part of my job description.."
     ]
  }
};

// --- Dialog storage (queue-based) ---
let dialogQueue = [
  "Hey YOU, what's your name? ⚡",
  "ok, nice to meet you, I happened to be in a bit of a bind here.",
  "All the other outlets got damaged except for that one in the corner.",
  "I need you to help me figure out how to plug all the appliances here through me..",
  "..so we can get to work!",
  "You can call me Cable btw..",
  "Oh, make sure you don't mistake my own cord for an appliances' though..",
  "someone plugged it into my nose earlier and I am still recovering..",
  "Dont want to get hurt now..haha..",
  "So, what do you say? Want to help me and my mates out?"
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
  { score: 5, msgs: ["Keep it up!"] },
  { score: 7, msgs: ["Nice!"] },
  { score: 10, msgs: ["n."] },
  { score: 15, msgs: ["You're doing great!"] },
  { score: 17, msgs: ["That was slick."] },
  { score: 20, msgs: ["Halfway there!"] },
  { score: 22, msgs: ["almost halfway, come on now."] },
  { score: 30, msgs: ["Wow, 45 percent already!!"] },
  { score: 40, msgs: ["Youre on fire!"] },
  { score: 45, msgs: ["you just need to charge 5 more now!"] },
  { score: 50, msgs: ["Incredible! that is all of them!"] }
]; 

let milestoneIndex = 0;

function preload() { 
  dialogcharacterImg = loadImage("gifproject.GIF");
  cornerImages.default = dialogcharacterImg; 
  cornerImages.death = loadImage("plugnose.PNG");
  bgImg = loadImage("background5.png"); 
  playerImg = loadImage("playmodel.PNG");
  zapImgs[0] = loadImage("zap1.PNG");
  zapImgs[1] = loadImage("zap2.PNG");
  plugImg = loadImage("plug2.PNG");
  slowEffectImg = loadImage("purplesloweffect.PNG");
  batImgs[0] = loadImage("bat1.PNG");   // 0–20%
  batImgs[3] = loadImage("bat15.PNG");  // 20–40%
  batImgs[1] = loadImage("bat2.PNG");   // 40–60%
  batImgs[4] = loadImage("bat25.PNG");  // 60–94%
  batImgs[2] = loadImage("bat3.PNG");   // 94–100%
  milestoneCharImg = loadImage("mile1.PNG");
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

  // --- Ending screen overlay ---
  if (gameFinished) { 
    push();
    fill(0);
    rect(0, 0, width, height);

    fill(255);
    textFont("Pixelify Sans");
    textSize(min(24, width / 20)); // scale for phone screens
    textAlign(CENTER, CENTER);

    let wrapWidth = width * 0.8; // wrap at 80% of screen width

    // split text into lines that fit wrapWidth
    let words = typedText.split(" ");
    let lines = [];
    let currentLine = "";
    for (let word of words) {
      let testLine = currentLine ? currentLine + " " + word : word;
      if (textWidth(testLine) > wrapWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    // calculate total height and start Y to center vertically
    let lineH = textAscent() + textDescent() + 6;
    let totalH = lines.length * lineH;
    let startY = height / 2 - totalH / 2;

    // draw each line
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], width / 2, startY + i * lineH);
    }

    pop();
    return; 
  }

  image(bgImg, 0, 0, width, height);

  let dialogH = height * 0.25;
  let gameH = height * 0.50;
  let controlH = height * 0.25;
  let sideW = 30; // width of the side frames

  // TOP: dialog box (always visible)
  fill(0, 120);
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
  fill(0, 120);
  rect(0, dialogH, sideW, gameH);              // left frame
  rect(width - sideW, dialogH, sideW, gameH);  // right frame

  // CENTER game screen
  fill(10);
  rect(sideW, dialogH, width - 2 * sideW, gameH);

  // Score tracker top-left inside game box
  fill(255);
  textAlign(LEFT, TOP);
  if (gameState === "game") {
    let percent = score * 2; // 1 → 2%, 2 → 4%, etc.
    let batteryImg = null;

    if (percent <= 20) batteryImg = batImgs[0];       // bat1.PNG
    else if (percent <= 40) batteryImg = batImgs[3];  // bat15.PNG
    else if (percent <= 60) batteryImg = batImgs[1];  // bat2.PNG
    else if (percent <= 94) batteryImg = batImgs[4];  // bat25.PNG
    else batteryImg = batImgs[2];                     // bat3.PNG

    if (batteryImg) {
      let batW = 80;
      let batH = 30;
      let batX = sideW + 10;
      let batY = dialogH + 10;

      image(batteryImg, batX, batY, batW, batH);

      // percentage overlay
      push();
      fill(255);
      textSize(16);
      textAlign(CENTER, CENTER);
      text(percent + "%", batX + batW / 2, batY + batH / 2);
      pop();
    }
  }

  // BOTTOM: controller box (always visible)
  fill(0, 120);
  rect(0, dialogH + gameH, width, controlH);

  // Dialog typing update (non-blocking)
  if (dialogState === "typing") updateTyping();

  // Game runs independently when in "game" or even when dialog shows
  if (gameState === "game") {
    playGame(dialogH, gameH, controlH);
  } else if (gameState === "gameOver") {
    showGameOver(dialogH);
  }

  // --- Milestone overlay ---
  if (milestoneChoiceActive) {
    showMilestoneOverlay();
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
  let y = mouseY || (touches.length ? touches[0].y : 0);

  // --- Block clicks only if overlay is active but waiting for response ---
  if (milestoneChoiceActive && milestoneResponsePending) {
    // Let continue button handle it
    return;
  }

  // --- Tap during gameOver ---
  if (gameState === "gameOver") {
    resetGame();
    return;
  }

  // --- Tap inside dialog box ---
  if (y <= dialogH) {
    if (dialogState === "typing") {
      typedText = currentDialogText;
      charIndex = currentDialogText.length;
      dialogState = "waiting";
      showContinueArrow = true;
      return;
    } else if (dialogState === "waiting") {
      if (showChoice) return;
      showContinueArrow = false;
      dialogState = "idle";
      startTypingNext();
      return;
    } else {
      startTypingNext();
      return;
    }
  }

  // --- Tap outside dialog box ---
  if (dialogState === "waiting" && !showChoice) {
    typedText = "";
    dialogState = "idle";
    startTypingNext();
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

  yesBtn.style("font-family", "Pixelify Sans");
  yesBtn.style("font-size","16px");
  yesBtn.style("background-color", "black");
  yesBtn.style("color", "white");

  noBtn.style("font-family", "Pixelify Sans");
  noBtn.style("font-size","16px");
  noBtn.style("background-color", "black");
  noBtn.style("color", "white");


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
  // Remove old buttons
  for (let b of milestoneButtons) b.remove();
  milestoneButtons = [];

  const cols = 2;
  const spacingX = 20;
  const spacingY = 15;

  const fontFamily = "Pixelify Sans, sans-serif";
  const fontSizePx = 14;
  const btnPaddingH = 12;
  const btnPaddingV = 8;
  const lineHeightPx = 18;

  const gridMaxWidth = width * 0.7;
  const maxBtnWidth = (gridMaxWidth - (cols - 1) * spacingX) / cols;

  // Hidden div to measure text height
  let measureDiv = document.getElementById("milestone-measure-div");
  if (!measureDiv) {
    measureDiv = document.createElement("div");
    measureDiv.id = "milestone-measure-div";
    document.body.appendChild(measureDiv);
    Object.assign(measureDiv.style, {
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
      visibility: "hidden",
      whiteSpace: "normal",
      overflowWrap: "break-word",
      wordWrap: "break-word",
      boxSizing: "border-box",
      padding: `${btnPaddingV}px ${btnPaddingH}px`,
      fontFamily: fontFamily,
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeightPx}px`,
      width: `${maxBtnWidth}px`
    });
  } else {
    Object.assign(measureDiv.style, {
      padding: `${btnPaddingV}px ${btnPaddingH}px`,
      fontFamily: fontFamily,
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeightPx}px`,
      width: `${maxBtnWidth}px`
    });
  }

  // Precompute button heights
  let btnHeights = [];
  for (let i = 0; i < options.length; i++) {
    measureDiv.innerText = options[i];
    const measuredHeight = Math.max(measureDiv.scrollHeight, lineHeightPx + btnPaddingV * 2);
    btnHeights.push(Math.round(measuredHeight));
  }

  // Find the tallest button
  const uniformHeight = Math.max(...btnHeights);

  const startX = width / 2 - (maxBtnWidth * cols + (cols - 1) * spacingX) / 2;
  let currentY = height * 0.59;

  for (let r = 0; r < Math.ceil(options.length / cols); r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (i >= options.length) break;

      const x = startX + c * (maxBtnWidth + spacingX);
      const y = currentY;

      const btn = createButton(options[i]);
      btn.position(x, y);
      btn.size(maxBtnWidth, uniformHeight);

      btn.style("font-family", fontFamily);
      btn.style("font-size", `${fontSizePx}px`);
      btn.style("color", "#fff");
      btn.style("background-color", "#000");
      btn.elt.style.whiteSpace = "normal";
      btn.elt.style.overflowWrap = "break-word";
      btn.elt.style.wordWrap = "break-word";
      btn.elt.style.lineHeight = `${lineHeightPx}px`;
      btn.elt.style.padding = `${btnPaddingV}px ${btnPaddingH}px`;
      btn.elt.style.boxSizing = "border-box";
      btn.elt.style.textAlign = "center";

      btn.mousePressed(() => milestoneChoiceSelected(i));
      btn.touchStarted(() => { milestoneChoiceSelected(i); return false; });

      milestoneButtons.push(btn);
    }
    currentY += uniformHeight + spacingY; // move to next row
  }

  measureDiv.innerText = "";
}




function milestoneChoiceSelected(index) {
  let milestone = milestoneChoices[currentMilestone];
  if (!milestone) return;

  if (index === 0 || index === 1) friendlyChoiceCount++;
  else if (index === 2 || index === 3) unfriendlyChoiceCount++;
 
  for (let b of milestoneButtons) b.remove();
  milestoneButtons = [];
  typedText = milestone.postResponses?.[index] ?? milestone.postResponses[0];
  charIndex = 0;
  dialogState = "waiting";


  milestoneResponsePending = true;   
  milestoneChoiceActive = true;

  createMilestoneContinueButton();
}


function createMilestoneContinueButton() {
  if (milestoneContinueBtn) return;

  let btnW = 150;
  let btnH = 40;
  let x = width / 2 - btnW / 2;
  let y = height * 0.75;

  milestoneContinueBtn = createButton("Continue");
  milestoneContinueBtn.position(x, y);
  milestoneContinueBtn.size(btnW, btnH);
  milestoneContinueBtn.style("font-family", "Pixelify Sans");
  milestoneContinueBtn.style("font-size", "16px");
  milestoneContinueBtn.style("color", "white");
  milestoneContinueBtn.style("background-color", "black");

  // Close overlay on click/tap
  milestoneContinueBtn.mousePressed(closeMilestoneOverlay);
  milestoneContinueBtn.touchStarted(() => { closeMilestoneOverlay(); return false; });
}


function closeMilestoneOverlay() {
  milestoneChoiceActive = false;
  milestoneResponsePending = false;
  typedText = "";
  dialogState = "idle";

  // Remove the continue button
  if (milestoneContinueBtn) {
    milestoneContinueBtn.remove();
    milestoneContinueBtn = null;
  }

  
  if (gameState === "game") {
  }

  if (currentMilestone === 50) {
  showEndingScreen();
  }
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
  dialogQueue = ["I'm going to take that as a yes."]; // reset queue to only this line
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
  imageMode(CENTER); // center the image at player.x, player.y

  if (playerSlowed) {
  image(slowEffectImg, 0, 0, player.size, player.size);
  } else {
  image(playerImg, 0, 0, player.size, player.size);
  }

  pop();


  // spawn arrows
  if (!milestoneChoiceActive) {
   let baseInterval = 40 - floor(score / 2);          // original spawn interval
   let reducedInterval = max(10, floor(baseInterval * 1.43)); // 30% fewer spawns
  if (frameCount % reducedInterval === 0) spawnArrow(dialogH, gameH);
  }

    while (arrows.length < 10) {
    spawnArrow(dialogH, gameH);
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

      push();
      translate(a.x, a.y);
      rotate(atan2(a.dy, a.dx));
      imageMode(CENTER);

      if (a.good) { 
      let img = random(zapImgs);
      image(img, 0, 0, 15, 15);
      } else { 
      image(plugImg, 0, 0, 15, 15);
      }
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
 if (!milestoneResponsePending) {   // block joystick while response waiting
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
      
      // Skip if this milestone overlay has already triggered
      if (triggeredMilestones.has(milestone.score)) {
        milestoneIndex++;
        continue;
      }

      // Mark as triggered immediately
      triggeredMilestones.add(milestone.score);

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
  // Full black overlay
  push();
  noStroke();
  fill(0);
  rect(0, 0, width, height);
  pop();

  // Center death image
  let deathImg = cornerImages.death;
  if (deathImg) {
    let maxImgW = width * 0.55;
    let maxImgH = height * 0.45;

    let aspect = deathImg.width / deathImg.height;
    let imgW = maxImgW;
    let imgH = imgW / aspect;

    if (imgH > maxImgH) {
      imgH = maxImgH;
      imgW = imgH * aspect;
    }

    let imgX = width / 2 - imgW / 2;
    let imgY = height * 0.22;

    image(deathImg, imgX, imgY, imgW, imgH);

    // Text box under the image (slightly overlapping)
    let boxW = width * 0.85;
    let boxH = height * 0.20;
    let boxX = width / 2 - boxW / 2;
    let boxY = imgY + imgH - boxH * 0.2;

    push();
    rectMode(CORNER);
    stroke(200);
    strokeWeight(2);
    fill(20);
    rect(boxX, boxY, boxW, boxH, 6);
    pop();

    // Text inside the box
    push();
    fill(255);
    textAlign(LEFT, TOP);
    textFont("Pixelify Sans");
    textSize(18);

    let pad = 12;
    text(
      typedText,
      boxX + pad,
      boxY + pad,
      boxW - pad * 2,
      boxH - pad * 2
    );
    pop();

    

    // ---- MOVE EXISTING YES/NO BUTTONS HERE ----
    if (yesBtn && noBtn) {
      let btnW = 120;
      let btnH = 40;

      let centerY = boxY + boxH + 20;

      yesBtn.position(width / 2 - btnW - 15, centerY);
      yesBtn.size(btnW, btnH);
      yesBtn.style("background-color", "black");
      yesBtn.style("color", "white");
      yesBtn.style("font-family", "Pixelify Sans");

      noBtn.position(width / 2 + 15, centerY);
      noBtn.size(btnW, btnH);
      noBtn.style("background-color", "black");
      noBtn.style("color", "white");
      noBtn.style("font-family", "Pixelify Sans");

      yesBtn.show();
      noBtn.show();
    }
  }
}

function showMilestoneOverlay() {
  if (!milestoneChoices[currentMilestone]) return;

  // --- Overlay background ---
  push();
  noStroke();
  fill(0);
  rect(0, 0, width, height);
  pop();

  // --- Character image ---
  let charImg = milestoneCharImg;
  let maxImgW = width * 0.5;
  let maxImgH = height * 0.35;
  let aspect = charImg.width / charImg.height;
  let imgW = maxImgW;
  let imgH = imgW / aspect;
  if (imgH > maxImgH) { imgH = maxImgH; imgW = imgH * aspect; }

  let imgYOffset = -30; // move PNG up
  let imgX = width / 2 - imgW / 2;
  let imgY = height * 0.1 + imgYOffset;
  image(charImg, imgX, imgY, imgW, imgH);

  // --- Dynamic text box ---
  let boxW = width * 0.85;
  let pad = 12;
  textFont("Pixelify Sans");
  textSize(18);
  textAlign(LEFT, TOP);

  let words = typedText.split(" ");
  let lines = [];
  let currentLine = "";
  for (let word of words) {
    let testLine = currentLine ? currentLine + " " + word : word;
    if (textWidth(testLine) > boxW - pad * 2) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  let lineH = textAscent() + textDescent() + 4;
  let boxH = lines.length * lineH + pad * 2;

  let boxYOffset = -14; 
  let boxX = width / 2 - boxW / 2;
  let boxY = imgY + imgH - boxH * 0.25 + boxYOffset;

  push();
  rectMode(CORNER);
  stroke(200);
  strokeWeight(2);
  fill(20);
  rect(boxX, boxY, boxW, boxH, 6);
  pop();

  push();
  fill(255);
  textFont("Pixelify Sans");
  textSize(18);
  textAlign(LEFT, TOP);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], boxX + pad, boxY + pad + i * lineH);
  }
  pop();

  // --- Buttons ---
  if (!milestoneResponsePending && milestoneButtons.length === 0 && milestoneChoices[currentMilestone]?.options) {
    createMilestoneButtons(
      milestoneChoices[currentMilestone].options,
      boxY + boxH + 10 
    );
  }
}






function resetGame() {
  arrows = [];
  arrowSpeed = 0.5;
  score = 0;
  milestoneIndex = 0;
  dialogQueue = ["Eveything short circuited! Start over immediately."]; 
  typedText = "";
  currentDialogText = "";
  dialogState = "idle";
  showContinueArrow = false;
  showChoice = false;
  enableZigzagArrows = false;   
  clearChoiceButtons();
  gameState = "dialog";
  setCornerImage("default");  
  startTypingNext();
}
 
function showEndingScreen() {
  gameFinished = true;  
  arrows = [];          
  arrowSpeed = 0;
  player = null;


  if (friendlyChoiceCount >= unfriendlyChoiceCount) {
    typedText = "Cable thinks he made a great friend today, he seems to be full of energy.";
  } else {
    typedText = "Cable thinks you are a horrible person, he seems to be crying in a corner...";
  }

  currentCornerImage = null;
}