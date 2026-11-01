/* ====== Parte A — estado, canvas e pontos ====== */
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const g = canvas.getContext('2d');
const W = canvas.width;    // tamanho INTERNO do desenho (900px)
const H = canvas.height;   // (560px)
const MAX_POINTS = 200;

let points = [];   // Lista de pontos [{x, y}] em coordenadas do canvas
let events = [];   // Lista de eventos que será devolvida pelo backend
let k = -1;        // Índice do evento exibido no momento (-1 = nenhum)
let timer = null;

const C = {
  point: '#4f46e5', dim: '#b8bdd1', left: '#2563eb', right: '#ea580c',
  base: '#7c3aed', strip: '#0891b2', compare: '#f59e0b', best: '#dc2626',
  done: '#16a34a', band: 'rgba(8, 145, 178, 0.12)', line: '#334155',
};

function canvasPos(ev) {
  // O CSS escala o canvas (width:100%). Aqui convertemos pixels da tela -> pixels do desenho
  const r = canvas.getBoundingClientRect();
  return { 
      x: (ev.clientX - r.left) * (W / r.width), 
      y: (ev.clientY - r.top) * (H / r.height) 
  };
}

canvas.addEventListener('click', (ev) => {
  if (points.length >= MAX_POINTS) {
      return alert(`Limite de ${MAX_POINTS} pontos na visualização.`);
  }
  resetRun();
  points.push(canvasPos(ev));
  draw();
});

$('btnClear').addEventListener('click', () => { 
    resetRun(); 
    points = []; 
    draw(); 
});


  $('btnRandom').addEventListener('click', () => {
  const n = Math.min(MAX_POINTS, Math.max(2, parseInt($('inputN').value, 10) || 30));
  // Atualize o valor visual do input com o `n` validado:
  $('inputN').value = n;
  resetRun();

  points = Array.from({ length: n }, () => ({
    x: 20 + Math.random() * (W - 40),
    y: 20 + Math.random() * (H - 40),
  }));
  draw();
});

function resetRun() {
  pause();
  events = [];
  k = -1;
  $('results').hidden = true;
  updateControls();
  updateInfo();
}

function updateControls() {
  const has = events.length > 0;
  ['btnPlay', 'btnPrev', 'btnNext'].forEach((id) => { $(id).disabled = !has; });
}

// --- STUBS TEMPORÁRIOS: Substitutos de funções que serão feitas nas issues #9 e #10 ---
// Apague esta parte quando chegar nessas issues.
function pause() {}
function updateInfo() {}
function draw() {
  g.clearRect(0, 0, W, H);
  points.forEach((p) => {
    g.beginPath();
    g.arc(p.x, p.y, 6, 0, Math.PI * 2);
    g.fillStyle = C.point;
    g.fill();
  });
}
draw();
