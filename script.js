/* 🎵 Lagay dito ang link ng kanta (e.g. "audio.mp3"). Kapag walang laman, built-in Happy Birthday melody ang mag-lo-loop. */
var SONG_SRC = "audio.mp3";

/* 💌 I-edit ang greetings dito. {N} = pangalan ng birthday celebrant. */
var GREETINGS = [
  ['h', 'Today is your <span class="grad">day.</span>'],
  ['p', 'I hope your day is filled with good food, big laughs, and people who make you happy. 🎂'],
  ['c', '<b>Wishing you:</b><br>• More happiness<br>• More good memories<br>• More blessings and opportunities 💜'],
  ['p', 'Thank you for being you, {N}.<br>The world is better with you in it.'],
];

var $ = function(s) { return document.querySelector(s) }, inn = $('#in'), nick = 'Bro', fxOn = false, ac;
var cols = ['#8b5cf6', '#ec4899', '#c084fc', '#f472b6', '#a78bfa', '#ffffff'];

function A() {
  if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}

function esc(s) {
  return s.replace(/[&<>"]/g, function(c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  });
}

function sub(s) {
  return s.replace(/\{N\}/g, '<b class="hw grad">' + esc(nick) + '</b>');
}

/* hover zoom + glow */
var HZ = '.card,.btn:not(.dis),.inp,#mus';
document.addEventListener('pointerover', function(e) {
  var t = e.target.closest && e.target.closest(HZ);
  if (!t || t._h) return;
  t._h = 1;
  gsap.to(t, { scale: t.classList.contains('btn') ? 1.08 : 1.05, boxShadow: '0 0 42px 6px rgba(236,72,153,.55)', duration: .3, overwrite: 'auto' });
});

document.addEventListener('pointerout', function(e) {
  var t = e.target.closest && e.target.closest(HZ);
  if (!t || (e.relatedTarget && t.contains(e.relatedTarget))) return;
  t._h = 0;
  gsap.to(t, {
    scale: 1, duration: .35, overwrite: 'auto', onComplete: function() {
      if (!t._h) gsap.set(t, { clearProps: 'scale,boxShadow' });
    }
  });
});

/* word-by-word glow on headings */
function hw(el) {
  var w = document.createTreeWalker(el, 4), ns = [], n;
  while (n = w.nextNode()) if (n.nodeValue.trim() && n.parentNode.closest('h1,h2,b,.grad') && !n.parentNode.closest('.hw,button')) ns.push(n);
  ns.forEach(function(n) {
    var f = document.createDocumentFragment(), g = !!n.parentNode.closest('.grad');
    n.nodeValue.split(/(\s+)/).forEach(function(t) {
      if (!t) return;
      if (/^\s+$/.test(t)) f.appendChild(document.createTextNode(t));
      else { var s = document.createElement('span'); s.className = 'hw' + (g ? ' grad' : ''); s.textContent = t; f.appendChild(s); }
    });
    n.parentNode.replaceChild(f, n);
  });
}

/* typewriter for plain text */
function tw(el, cb) {
  var w = document.createTreeWalker(el, 4), ns = [], n, tot = 0;
  while (n = w.nextNode()) if (n.nodeValue.length && !n.parentNode.closest('.hw,h1,h2,b,.grad,button')) ns.push([n, n.nodeValue]);
  ns.forEach(function(a) { tot += a[1].length; a[0].nodeValue = ''; });
  if (!tot) { cb(); return; }
  var d = tot > 80 ? 14 : 24, k = 0, c = 0, pg = inn.parentNode;
  (function t() {
    if (k >= ns.length) { cb(); return; }
    var a = ns[k];
    a[0].nodeValue = a[1].slice(0, ++c);
    if (c >= a[1].length) { k++; c = 0; }
    if (c % 10 == 0) pg.scrollTop = pg.scrollHeight;
    setTimeout(t, d);
  })();
}

/* ===== canvas: ambient particles (always) + confetti (page 2 only) ===== */
var cv = $('#fx'), cx = cv.getContext('2d'), W, H, mouse = { x: -999, y: -999 }, parts = [], conf = [];
function rs() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
rs();
addEventListener('resize', rs);

for (var i = 0; i < 70; i++) parts.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .5, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, c: cols[i % 5] });

function burst(x, y, n, c) {
  for (var i = 0; i < n; i++) {
    var a = Math.random() * 6.28, sp = Math.random() * 11 + 3;
    conf.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, w: Math.random() * 8 + 5, h: Math.random() * 5 + 3, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: c || cols[Math.floor(Math.random() * 6)], life: 1 });
  }
}

(function loop() {
  cx.clearRect(0, 0, W, H);
  parts.forEach(function(p) {
    var dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < 140) { p.x += dx / d * 1.6; p.y += dy / d * 1.6; }
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    cx.globalAlpha = .7; cx.fillStyle = p.c; cx.shadowColor = p.c; cx.shadowBlur = 10; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.3); cx.fill();
  });
  cx.shadowBlur = 0;
  conf = conf.filter(function(f) { return f.life > 0 && f.y < H + 30; });
  conf.forEach(function(f) {
    f.vy += .28; f.vx *= .99; f.x += f.vx; f.y += f.vy; f.rot += f.vr; f.life -= .004;
    cx.save(); cx.globalAlpha = Math.max(f.life, 0); cx.translate(f.x, f.y); cx.rotate(f.rot); cx.fillStyle = f.c; cx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); cx.restore();
  });
  requestAnimationFrame(loop);
})();

var gx = gsap.quickTo('#glow', 'x', { duration: .6, ease: 'power3' }), gy = gsap.quickTo('#glow', 'y', { duration: .6, ease: 'power3' });
function mv(e) { var t = e.touches ? e.touches[0] : e; mouse.x = t.clientX; mouse.y = t.clientY; gx(t.clientX); gy(t.clientY); }
addEventListener('pointermove', mv);
addEventListener('touchmove', mv, { passive: true });

/* ===== balloons (page 2 only) ===== */
function popSound() {
  var c = A(), n = Math.floor(c.sampleRate * .14), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
  for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 5);
  var s = c.createBufferSource(); s.buffer = b; var f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 600; s.connect(f); f.connect(c.destination); s.start();
}

function bal(delay) {
  var b = document.createElement('div'), col = cols[Math.floor(Math.random() * 5)];
  b.className = 'bl'; b.col = col;
  b.style.background = 'radial-gradient(circle at 35% 30%,#fff8,' + col + ')'; b.style.left = Math.random() * 92 + '%';
  $('#balloons').appendChild(b);
  gsap.set(b, { scale: .8 + Math.random() * .7 });
  b.tw = gsap.to(b, { y: -(innerHeight + 260), x: 'random(-70,70)', duration: 'random(11,20)', ease: 'none', delay: delay || 0, onComplete: function() { b.remove(); } });
}

function startBalloons() {
  for (var i = 0; i < 8; i++) bal(i * .9 + Math.random());
  setInterval(function() { if (document.querySelectorAll('.bl').length < 12) bal(Math.random()); }, 1500);
}

addEventListener('pointerdown', function(e) {
  A(); var t = e.target;
  if (!fxOn) return;
  if (!(t.closest && t.closest('button,input,.card,#mus'))) {
    var bs = [].slice.call(document.querySelectorAll('.bl')).reverse();
    for (var i = 0; i < bs.length; i++) {
      var r = bs[i].getBoundingClientRect();
      if (e.clientX > r.left - 4 && e.clientX < r.right + 4 && e.clientY > r.top - 4 && e.clientY < r.bottom + 4) {
        var b = bs[i]; b.tw.kill(); popSound(); burst(r.left + r.width / 2, r.top + r.height / 2, 40, b.col); b.remove(); return;
      }
    }
  }
  burst(e.clientX, e.clientY, 34);
});

/* ===== music (loops) ===== */
var playing = false, audio = SONG_SRC ? new Audio(SONG_SRC) : null, mt, mi = 0, beat = .42;
if (audio) audio.loop = true;

var mel = [[392, .75], [392, .25], [440, 1], [392, 1], [523, 1], [494, 2], [392, .75], [392, .25], [440, 1], [392, 1], [587, 1], [523, 2], [392, .75], [392, .25], [784, 1], [659, 1], [523, 1], [494, 1], [440, 1], [698, .75], [698, .25], [659, 1], [523, 1], [587, 1], [523, 2], [0, 1]];

function step() {
  if (!playing) return;
  var n = mel[mi++ % mel.length], c = A();
  if (n[0]) {
    var o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = n[0];
    g.gain.setValueAtTime(.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(.09, c.currentTime + .03); g.gain.exponentialRampToValueAtTime(.0001, c.currentTime + n[1] * beat * 1.1);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + n[1] * beat * 1.15);
  }
  mt = setTimeout(step, n[1] * beat * 1000);
}

function setMusic(on) {
  playing = on;
  $('#mus').textContent = on ? '🔊 PAUSE MUSIC' : '🎵 PLAY MUSIC';
  clearTimeout(mt);
  if (audio) {
    on ? audio.play().catch(function() { playing = false; $('#mus').textContent = '🎵 PLAY MUSIC'; }) : audio.pause();
    return;
  }
  if (on) step();
}

$('#mus').onclick = function(e) { e.stopPropagation(); setMusic(!playing); };

/* ===== block engine ===== */
function mk(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = sub(html);
  return e;
}

function add(el, cb) {
  inn.appendChild(el); hw(el); inn.parentNode.scrollTo({ top: inn.parentNode.scrollHeight, behavior: 'smooth' });
  gsap.fromTo(el, { opacity: 0, y: 24, scale: .88 }, { opacity: 1, y: 0, scale: 1, duration: .6, ease: 'back.out(1.7)', clearProps: 'transform' });
  if (cb) { if (el.tagName == 'P' || el.classList.contains('card')) tw(el, cb); else cb(); }
  return el;
}

function run(B, i) {
  if (i >= B.length) return;
  var b = B[i], t = b[0], c = b[1];
  function nx(d) { setTimeout(function() { run(B, i + 1); }, d == null ? 850 : d); }
  if (t == 'x') { c(function() { nx(300); }); return; }
  add(t == 'h' ? mk('h2', '', c) : t == 'H' ? mk('h1', '', c) : t == 'c' ? mk('div', 'card', c) : t == 'r' ? mk('div', '', c) : mk('p', '', c), function() { nx(); });
}

/* ===== PAGE 1: enter name ===== */
var nxb = $('#nx'), inp;

function page1() {
  run([['H', 'Hi, <span class="grad">there</span> 👋'], ['p', 'Before we start, we need to know what to call you.'], ['x', ask]], 0);
}

function ask(done) {
  var d = mk('div', '', ''); d.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%';
  d.innerHTML = '<input class="inp" maxlength="18" placeholder="Enter you name" autocomplete="off"><p class="wr"></p>';
  add(d); inp = d.firstChild; var w = d.lastChild;
  inp.oninput = function() { var v = inp.value.trim(); nxb.classList.toggle('dis', !v); if (v) w.textContent = ''; };
  inp.onkeydown = function(e) { if (e.key == 'Enter') nxb.click(); };
  nxb.onclick = function() {
    var v = inp.value.trim();
    if (!v) { w.innerHTML = '⚠️ Please enter your name first.'; gsap.fromTo(w, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(3,.2)' }); return; }
    nick = v; nxb.onclick = null; page2();
  };
  gsap.fromTo(nxb, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6 });
}

/* ===== PAGE 2: birthday greetings ===== */
var CAKE = '<svg class="cake" viewBox="0 0 200 190"><defs><linearGradient id="g1" x1="0" x2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs><ellipse cx="100" cy="176" rx="88" ry="9" fill="rgba(139,92,246,.25)"/><rect x="20" y="118" width="160" height="54" rx="12" fill="url(#g1)"/><rect x="42" y="78" width="116" height="44" rx="11" fill="#c084fc"/><path d="M42 90q10 14 20 0t20 0 20 0 20 0 18 0v-6a11 11 0 0 0-11-6H53a11 11 0 0 0-11 11z" fill="#fff" opacity=".9"/><path d="M20 130q13 14 26 0t26 0 26 0 26 0 26 0 26 0v-8H20z" fill="#fff" opacity=".9"/>'
  + [62, 100, 138].map(function(x) { return '<rect x="' + (x - 3) + '" y="50" width="6" height="30" rx="2" fill="#fff"/><ellipse class="fl" cx="' + x + '" cy="42" rx="5" ry="10" fill="#fbbf24" style="filter:drop-shadow(0 0 8px #f59e0b)"/>'; }).join('') + '</svg>';

function page2() {
  A();
  gsap.to(nxb, { opacity: 0, y: 20, duration: .3, onComplete: function() { nxb.style.display = 'none'; } });
  gsap.to(inn, {
    opacity: 0, y: -40, filter: 'blur(8px)', duration: .45, ease: 'power2.in', onComplete: function() {
      inn.innerHTML = ''; inn.parentNode.scrollTop = 0; gsap.set(inn, { clearProps: 'all' });
      gsap.from(inn, { opacity: 0, y: 40, duration: .5, clearProps: 'all' });
      fxOn = true; startBalloons();
      burst(innerWidth / 2, innerHeight * .45, 300); burst(0, innerHeight * .7, 140); burst(innerWidth, innerHeight * .7, 140);
      setInterval(function() { burst(Math.random() * innerWidth, Math.random() * innerHeight * .5, 40); }, 2200);
      gsap.set('#mus', { x: 200, opacity: 0 });
      gsap.to('#mus', { x: 0, opacity: 1, duration: .8, delay: .6, ease: 'back.out(1.6)', onStart: function() { $('#mus').style.pointerEvents = 'auto'; } });
      setMusic(true);
      var seq = [['r', CAKE], ['H', '🎉 <span class="grad">HAPPY BIRTHDAY</span> {N}! 🎉']].concat(GREETINGS);
      run(seq, 0);
      gsap.to('.fl', { scaleY: 1.2, scaleX: .85, duration: .18, repeat: -1, yoyo: true, stagger: .07, ease: 'sine.inOut' });
      new MutationObserver(function() {
        if (document.querySelector('.fl:not(.on)')) {
          gsap.to('.fl', { scaleY: 1.2, scaleX: .85, duration: .18, repeat: -1, yoyo: true, stagger: .07, ease: 'sine.inOut', overwrite: true });
          document.querySelectorAll('.fl').forEach(function(f) { f.classList.add('on'); });
        }
      }).observe(inn, { childList: true, subtree: true });
    }
  });
}

page1();