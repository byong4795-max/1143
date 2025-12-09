let walkingSpriteSheet;
let redBirdSpriteSheet;
let bbBirdSpriteSheet;
let bulletSprite;

let playerLoaded = false;
let redBirdLoaded = false;
let bbBirdLoaded = false;
let bulletLoaded = false;

// --- 玩家 sprite 設定 ---
const TOTAL_FRAMES = 12;
const FRAME_WIDTH = 391 / TOTAL_FRAMES;
const FRAME_HEIGHT = 20;

const WALK_FRAMES = 5;
const SPECIAL_START = 5;
const SPECIAL_END = 8;

let currentFrame = 0;
let frameDelay = 6;
let frameCounter = 0;

let posX, posY;
let isWalking = false;
let dirX = 0, dirY = 0;
let isMirrored = false;

let specialAnim = false;
let bulletFired = false;

// ------------------ 子彈設定 ------------------
let bullet = null;
const BULLET_SPEED = 5;

// --- 飛鳥 sprite 設定 ---
const BIRD_FRAME_COUNT = 6;
const BIRD_W = 15;
const BIRD_H = 8;
const BIRD_SCALE = 6;

let redBirdX = 0, redBirdY = 120, redBirdSpeed = 6;
let redBirdFrame = 0, redBirdFrameCounter = 0;
let redBirdMoving = true;

let bbBirdX = 100, bbBirdY = 150, bbBirdSpeed = 5;
let bbBirdFrame = 0, bbBirdFrameCounter = 0;
let bbBirdMoving = true;

// ------------------ 安全載入圖片 ------------------
function safeImage(path, fallbackColor, w, h, callback) {
  loadImage(
    path,
    (img) => callback(img),
    () => {
      let gfx = createGraphics(w, h);
      gfx.noStroke();
      gfx.fill(fallbackColor);
      gfx.rect(0, 0, w, h);
      callback(gfx);
    }
  );
}

// ------------------ setup ------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();

  posX = width / 2;
  posY = height / 2;

  safeImage("assets/pinky.png", "#4ba3ff", FRAME_WIDTH * TOTAL_FRAMES, FRAME_HEIGHT, img => {
    walkingSpriteSheet = img;
    playerLoaded = true;
  });

  safeImage("assets/redb.png", "#ffcc66", BIRD_W * BIRD_FRAME_COUNT, BIRD_H, img => {
    redBirdSpriteSheet = img;
    redBirdLoaded = true;
  });

  safeImage("assets/bb.png", "#cc66ff", BIRD_W * BIRD_FRAME_COUNT, BIRD_H, img => {
    bbBirdSpriteSheet = img;
    bbBirdLoaded = true;
  });

  safeImage("assets/11.png", "#ff0000", 20, 20, img => {
    bulletSprite = img;
    bulletLoaded = true;
  });
}

// ------------------ draw ------------------
function draw() {
  background("#CEFFCE");

  if (playerLoaded) {
    updatePlayer();
    drawPlayer();
  }

  if (redBirdLoaded) {
    updateRedBird();
    drawRedBird();
  }

  if (bbBirdLoaded) {
    updateBbBird();
    drawBbBird();
  }

  if (bullet) updateBullet();
}

// ------------------ 玩家邏輯 ------------------
function updatePlayer() {
  frameCounter++;

  if (specialAnim) {
    if (frameCounter >= frameDelay) {
      frameCounter = 0;
      currentFrame++;
      if (currentFrame > SPECIAL_END) {
        specialAnim = false;

        // 攻擊動畫完成後生成一顆子彈（只生成一次）
        if (!bulletFired) {
          let bx = posX + (isMirrored ? -10 : FRAME_WIDTH * 6 + 10);
          let by = posY + FRAME_HEIGHT * 3;
          bullet = {
            x: bx,
            y: by,
            dx: isMirrored ? -BULLET_SPEED : BULLET_SPEED,
            dy: -BULLET_SPEED
          };
          bulletFired = true;
        }

        currentFrame = SPECIAL_END; // 攻擊動畫結束後人物停在最後一幀
      }
    }
  } else if (isWalking) {
    if (frameCounter >= frameDelay) {
      frameCounter = 0;
      currentFrame = (currentFrame + 1) % WALK_FRAMES;

      posX += dirX * 6;
      posY += dirY * 6;

      if (dirX === 0) posX += random([-1, 0, 1]);

      posX = constrain(posX, 0, width - FRAME_WIDTH * 6);
      posY = constrain(posY, 0, height - FRAME_HEIGHT * 6);
    }
  }
}

function drawPlayer() {
  const sx = currentFrame * FRAME_WIDTH;
  const sw = FRAME_WIDTH;
  const sh = FRAME_HEIGHT;
  const dw = sw * 6;
  const dh = sh * 6;

  push();
  if (isMirrored) {
    translate(posX + dw, posY);
    scale(-1, 1);
    image(walkingSpriteSheet, 0, 0, dw, dh, sx, 0, sw, sh);
  } else {
    image(walkingSpriteSheet, posX, posY, dw, dh, sx, 0, sw, sh);
  }
  pop();
}

// ------------------ 子彈邏輯 ------------------
function updateBullet() {
  if (!bullet) return;

  bullet.x += bullet.dx;
  bullet.y += bullet.dy;

  image(bulletSprite, bullet.x, bullet.y, 20, 20);

  // 超出畫面後刪除
  if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
    bullet = null;
    bulletFired = false;
    currentFrame = 0;
  }
}

// ------------------ 紅鳥邏輯 ------------------
function updateRedBird() {
  if (!redBirdMoving) return;

  redBirdFrameCounter++;
  if (redBirdFrameCounter >= frameDelay) {
    redBirdFrameCounter = 0;
    redBirdFrame = (redBirdFrame + 1) % BIRD_FRAME_COUNT;
  }

  redBirdX += redBirdSpeed;

  if (redBirdX > width + 200) {
    redBirdX = -BIRD_W * BIRD_SCALE;
    redBirdY = random(50, height - 200);
    redBirdMoving = true;
  }

  if (bullet) {
    if (bullet.x + 20 > redBirdX &&
        bullet.x < redBirdX + BIRD_W * BIRD_SCALE &&
        bullet.y + 20 > redBirdY &&
        bullet.y < redBirdY + BIRD_H * BIRD_SCALE) {
      redBirdMoving = false;
    }
  }
}

function drawRedBird() {
  const sx = redBirdFrame * BIRD_W;
  const dw = BIRD_W * BIRD_SCALE;
  const dh = BIRD_H * BIRD_SCALE;

  image(redBirdSpriteSheet, redBirdX, redBirdY, dw, dh, sx, 0, BIRD_W, BIRD_H);
}

// ------------------ bb鳥邏輯 ------------------
function updateBbBird() {
  if (!bbBirdMoving) return;

  bbBirdFrameCounter++;
  if (bbBirdFrameCounter >= frameDelay) {
    bbBirdFrameCounter = 0;
    bbBirdFrame = (bbBirdFrame + 1) % BIRD_FRAME_COUNT;
  }

  bbBirdX += bbBirdSpeed;

  if (bbBirdX > width + 200) {
    bbBirdX = -BIRD_W * BIRD_SCALE;
    bbBirdY = random(50, height - 200);
    bbBirdMoving = true;
  }

  if (bullet) {
    if (bullet.x + 20 > bbBirdX &&
        bullet.x < bbBirdX + BIRD_W * BIRD_SCALE &&
        bullet.y + 20 > bbBirdY &&
        bullet.y < bbBirdY + BIRD_H * BIRD_SCALE) {
      bbBirdMoving = false;
    }
  }
}

function drawBbBird() {
  const sx = bbBirdFrame * BIRD_W;
  const dw = BIRD_W * BIRD_SCALE;
  const dh = BIRD_H * BIRD_SCALE;

  image(bbBirdSpriteSheet, bbBirdX, bbBirdY, dw, dh, sx, 0, BIRD_W, BIRD_H);
}

// ------------------ 控制 ------------------
function mousePressed() {
  if (mouseButton === LEFT && !specialAnim && !bulletFired) {
    specialAnim = true;
    currentFrame = SPECIAL_START;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) { dirX = -1; dirY = 0; isMirrored = true; isWalking = true; }
  else if (keyCode === RIGHT_ARROW) { dirX = 1; dirY = 0; isMirrored = false; isWalking = true; }
  else if (keyCode === UP_ARROW) { dirY = -1; isWalking = true; }
  else if (keyCode === DOWN_ARROW) { dirY = 1; isWalking = true; }
}

function keyReleased() {
  dirX = 0;
  dirY = 0;
  if (!specialAnim && !bulletFired) isWalking = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
