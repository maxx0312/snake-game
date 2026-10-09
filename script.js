(() => {
  "use strict";

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("high-score");
  const levelEl = document.getElementById("level");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayHint = document.getElementById("overlay-hint");

  const GRID = 20;            // 网格：20 x 20
  const CELL = canvas.width / GRID;
  const BASE_INTERVAL = 160;  // 初始每步耗时(ms)
  const MIN_INTERVAL = 70;    // 最快速度
  const SPEEDUP = 8;          // 每吃多少个食物加速一次

  let snake, dir, nextDir, food, score, level, interval;
  let alive = true, started = false, paused = false;
  let timer = null;

  const HIGH_SCORE_KEY = "snake_high_score";
  let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
  highScoreEl.textContent = highScore;

  // ---------- 基础函数 ----------

  function randomCell() {
    return {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  }

  function spawnFood() {
    // 避免食物生成在蛇身上
    let pos;
    do {
      pos = randomCell();
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function reset() {
    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dir = { x: 1, y: 0 };
    nextDir = dir;
    score = 0;
    level = 1;
    interval = BASE_INTERVAL;
    alive = true;
    started = false;
    paused = false;
    spawnFood();
    updateHud();
  }

  function updateHud() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    }
  }

  function showOverlay(title, hint, gameover) {
    overlayTitle.textContent = title;
    overlayHint.textContent = hint;
    overlay.classList.toggle("gameover", !!gameover);
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  // ---------- 游戏循环 ----------

  function step() {
    dir = nextDir;

    const head = snake[0];
    const nx = head.x + dir.x;
    const ny = head.y + dir.y;

    // 撞墙
    if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) {
      return gameOver();
    }

    // 撞自己（新头部与除尾巴外身体重合）
    const hitSelf = snake.some(
      (seg, i) => i < snake.length - 1 && seg.x === nx && seg.y === ny
    );
    if (hitSelf) {
      return gameOver();
    }

    snake.unshift({ x: nx, y: ny });

    // 吃到食物
    if (nx === food.x && ny === food.y) {
      score += 10;
      // 加速
      const newLevel = 1 + Math.floor(score / (SPEEDUP * 10));
      if (newLevel !== level) {
        level = newLevel;
        interval = Math.max(MIN_INTERVAL, BASE_INTERVAL - (level - 1) * 12);
        restartTimer();
      }
      spawnFood();
    } else {
      snake.pop();
    }

    updateHud();
    draw();
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(step, interval);
  }

  function start() {
    if (timer) clearInterval(timer);
    started = true;
    paused = false;
    hideOverlay();
    timer = setInterval(step, interval);
    draw();
  }

  function pause() {
    if (!started || !alive || paused) return;
    paused = true;
    clearInterval(timer);
    timer = null;
    showOverlay("已暂停", "按 空格 或 回车 继续");
  }

  function gameOver() {
    alive = false;
    clearInterval(timer);
    timer = null;
    showOverlay("游戏结束", `本轮得分 ${score} · ${score >= highScore ? "新纪录！" : "按回车重新开始"}`, true);
    draw();
  }

  // ---------- 绘制 ----------

  function draw() {
    ctx.fillStyle = "#0b1120";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 网格线
    ctx.strokeStyle = "rgba(148, 163, 184, 0.07)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    // 食物
    ctx.fillStyle = "#f43f5e";
    ctx.shadowColor = "#f43f5e";
    ctx.shadowBlur = 12;
    roundRect(food.x * CELL + CELL * 0.15, food.y * CELL + CELL * 0.15,
      CELL * 0.7, CELL * 0.7, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 蛇身
    snake.forEach((seg, i) => {
      if (i === 0) {
        ctx.fillStyle = "#22d3ee";
        ctx.shadowColor = "#22d3ee";
      } else {
        // 从头部到尾部渐变
        const t = i / Math.max(snake.length - 1, 1);
        ctx.fillStyle = `rgba(34, 211, 238, ${1 - t * 0.55})`;
        ctx.shadowColor = "#22d3ee";
      }
      ctx.shadowBlur = 8;
      const pad = i === 0 ? 1 : 2;
      roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 蛇眼
    const head = snake[0];
    const ex = head.x * CELL;
    const ey = head.y * CELL;
    ctx.fillStyle = "#0b1120";
    const eyeSize = 3.5;
    const centerOffset = 5;
    if (dir.x !== 0) {
      ctx.beginPath();
      ctx.arc(ex + CELL / 2 + dir.x * centerOffset, ey + CELL / 2 - 4, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + CELL / 2 + dir.x * centerOffset, ey + CELL / 2 + 4, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(ex + CELL / 2 - 4, ey + CELL / 2 + dir.y * centerOffset, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + CELL / 2 + 4, ey + CELL / 2 + dir.y * centerOffset, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------- 输入 ----------

  function setDir(dx, dy) {
    if (!alive) return;
    if (!started) start();
    // 禁止直接反向
    if (dir.x === -dx && dir.y === -dy) return;
    if (dir.x === dx && dir.y === dy) return;
    nextDir = { x: dx, y: dy };
  }

  document.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1], W: [0, -1],
      s: [0, 1], S: [0, 1],
      a: [-1, 0], A: [-1, 0],
      d: [1, 0], D: [1, 0],
    };

    if (e.key in map) {
      e.preventDefault();
      if (!alive) start();
      else setDir(...map[e.key]);
    } else if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!alive) {
        reset();
        start();
      } else if (paused) {
        paused = false;
        hideOverlay();
        timer = setInterval(step, interval);
      } else if (started) {
        pause();
      } else {
        start();
      }
    }
  });

  document.querySelectorAll(".btn[data-dir]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const d = btn.dataset.dir;
      const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      setDir(...map[d]);
    });
  });

  // ---------- 初始化 ----------

  reset();
  showOverlay("贪吃蛇", "方向键 / WASD 移动 · 空格暂停 · 回车开始");
  draw();
})();
