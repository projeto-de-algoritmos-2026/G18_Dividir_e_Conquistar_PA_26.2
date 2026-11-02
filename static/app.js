/* ====== Parte A — estado, canvas e pontos ====== */
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const g = canvas.getContext('2d');
const W = canvas.width;    // tamanho INTERNO do desenho (900px)
const H = canvas.height;   // (560px)
const MAX_POINTS = 200;
const MIN_POINTS = 2;

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
  const digitado = parseInt($('inputN').value, 10) || 30;
  if (digitado > MAX_POINTS) {
    alert(`Limite de ${MAX_POINTS} pontos na visualização.`);
  }
  else if (digitado < 2){
    alert(`Limite de ${MIN_POINTS} pontos na visualização.`);
  }
  const n = Math.min(MAX_POINTS, Math.max(2, digitado));
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

/* ====== Parte B — integração com a API ====== */
async function solve() {
  if (points.length < 2) return alert('Adicione pelo menos 2 pontos.');
  pause();
  $('btnSolve').disabled = true;
  try {
    const res = await fetch('/api/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points: points.map((p) => [p.x, p.y]) }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro no servidor');
    events = data.events;
    k = -1;
    showResult(data);
    updateControls();
    updateInfo();

    // Temporário: Desenha o final enquanto não temos animação
    drawFinalOnly(data.dc.pair);
    play();
  } catch (err) {
    alert(err.message);
  } finally {
    $('btnSolve').disabled = false;
  }
}
$('btnSolve').addEventListener('click', solve);

function showResult(d) {
  const fmt = (v, n = 3) => Number(v).toFixed(n);
  $('results').hidden = false;
  $('results').innerHTML = `
    <h3>Resultado</h3>
    <table>
      <tr><th></th><th>Div. e conquista</th><th>Força bruta</th></tr>
      <tr><td>Distância</td><td>${fmt(d.dc.distance)}</td><td>${fmt(d.brute.distance)}</td></tr>
      <tr><td>Comparações</td><td>${d.dc.comparisons}</td><td>${d.brute.comparisons}</td></tr>
      <tr><td>Tempo (ms)</td><td>${fmt(d.dc.time_ms)}</td><td>${fmt(d.brute.time_ms)}</td></tr>
    </table>
    <p class="note">${d.match ? '✅ Os dois algoritmos concordam.' : '❌ Resultados diferentes: há um bug!'}</p>`;
}

// --- TEMPORÁRIO (Apagaremos na issue #9) ---
function play() {}

// PLANO B VISUAL: mostra o par final sem animação
function drawFinalOnly(pair) {
  g.clearRect(0, 0, W, H);
  const [a, b] = pair;
  g.strokeStyle = C.done;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(points[a].x, points[a].y);
  g.lineTo(points[b].x, points[b].y);
  g.stroke();
  points.forEach((p, i) => {
    g.beginPath();
    g.arc(p.x, p.y, 6, 0, Math.PI * 2);
    g.fillStyle = (i === a || i === b) ? C.done : C.point;
    g.fill();
  });
}
