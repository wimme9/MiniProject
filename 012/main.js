/* =========================================================
   main.js — จุดเริ่มต้น: โหลด config, ผูกปุ่ม/คีย์บอร์ด, วนลูป
========================================================= */

(async function boot() {
  await loadConfig();

  document.getElementById('game-title').textContent = CONFIG.game.title;
  document.title = CONFIG.game.title;

  const canvas = document.getElementById('gameCanvas');
  // เพิ่มความละเอียดจริงของ canvas ตาม devicePixelRatio ของจอ (เช่นจอ Retina/มือถือ)
  // เพื่อให้ภาพคมชัดขึ้น โดยขนาดที่แสดงผลบนหน้าจอยังเท่าเดิม (960x540 ตามที่ CSS กำหนด)
  const dpr = window.devicePixelRatio || 1;
  canvas.width = CONFIG.game.width * dpr;
  canvas.height = CONFIG.game.height * dpr;
  canvas.style.width = CONFIG.game.width + 'px';
  canvas.style.height = CONFIG.game.height + 'px';
  const game = new Game(canvas, CONFIG, dpr);

  // ปุ่ม
  document.getElementById('btn-start').addEventListener('click', () => game.start());
  document.getElementById('btn-replay').addEventListener('click', () => game.start());
  document.getElementById('btn-menu').addEventListener('click', () => game.toMenu());

  // คีย์บอร์ด: Space/↑ กระโดด, S/↓ สไลด์, P หยุดชั่วคราว
  window.addEventListener('keydown', (e) => {
    if (game.calib) {
      if (e.code === 'ArrowUp') { e.preventDefault(); game.adjustGroundY(-2); return; }
      if (e.code === 'ArrowDown') { e.preventDefault(); game.adjustGroundY(2); return; }
      if (e.code === 'KeyC') { game.calib = !game.calib; return; }
    }
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!e.repeat) game.press('jump');
    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
      e.preventDefault();
      if (!e.repeat) game.press('slide');
    } else if (e.code === 'KeyP') {
      game.togglePause();
    }
  });

  // ซิงก์ฉาก DOM กับสถานะเกม
  const menuEl = document.getElementById('scene-menu');
  const overEl = document.getElementById('scene-gameover');
  game.onStateChange = (state) => {
    menuEl.classList.toggle('hidden', state !== 'menu');
    overEl.classList.toggle('hidden', state !== 'gameover');
    if (state === 'menu') {
      document.getElementById('menu-highscore').textContent = game.highScore;
    }
    if (state === 'gameover') {
      document.getElementById('final-score').textContent = game.score;
      document.getElementById('final-distance').textContent = game.distance + ' ม.';
      document.getElementById('final-highscore').textContent = game.highScore;
      document.getElementById('new-record').classList.toggle('hidden', !game.isNewRecord);
    }
  };

  game.toMenu();

  // วนลูปหลัก
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    game.update(dt);
    game.draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();