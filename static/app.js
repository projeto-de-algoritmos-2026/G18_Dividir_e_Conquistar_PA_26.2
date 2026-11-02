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

// function pause() {}

// function updateInfo() {}

/*
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
*/

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
    // drawFinalOnly(data.dc.pair);
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
// function play() {}

// PLANO B VISUAL: mostra o par final sem animação
/*
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
*/

/* ====== Parte C — player e desenho por evento ====== */
function lastIndexOf(type, from) {
  for (let i = from; i >= 0; i--) if (events[i].type === type) return i;
  return -1;
}

function draw() {
  g.clearRect(0, 0, W, H);
  const e = k >= 0 ? events[k] : null;
  const col = new Map();   // id do ponto -> cor
  let lineX = null, band = null, order = null, seg = null, segColor = null;

  if (e) {
    switch (e.type) {
      case 'divide':
        lineX = e.line_x;
        e.left.forEach((id) => col.set(id, C.left));
        e.right.forEach((id) => col.set(id, C.right));
        break;
      case 'base_case':
        e.ids.forEach((id) => col.set(id, C.base));
        break;
      case 'combine':
        lineX = e.line_x;
        band = { x: e.line_x, delta: e.delta };
        seg = [e.best[0], e.best[1]];
        segColor = C.best;
        col.set(e.best[0], C.best);
        col.set(e.best[1], C.best);
        break;
      case 'strip':
        lineX = e.line_x;
        band = { x: e.line_x, delta: e.delta };
        order = e.ids;
        e.ids.forEach((id) => col.set(id, C.strip));
        break;
      case 'compare':
      case 'update_best': {
        if (e.phase === 'strip') {
          const s = events[lastIndexOf('strip', k)];
          lineX = s.line_x;
          band = { x: s.line_x, delta: s.delta };
          order = s.ids;
          s.ids.forEach((id) => col.set(id, C.strip));
        } else {
          events[lastIndexOf('base_case', k)].ids.forEach((id) => col.set(id, C.base));
        }
        segColor = e.type === 'update_best' ? C.best : C.compare;
        seg = [e.a, e.b];
        col.set(e.a, segColor);
        col.set(e.b, segColor);
        break;
      }
      case 'done':
        seg = [e.a, e.b];
        segColor = C.done;
        col.set(e.a, C.done);
        col.set(e.b, C.done);
        break;
    }
  }

  if (band) {
    g.fillStyle = C.band;
    g.fillRect(band.x - band.delta, 0, band.delta * 2, H);
  }
  if (lineX !== null) {
    g.strokeStyle = C.line; g.lineWidth = 1.5; g.setLineDash([6, 4]);
    g.beginPath(); g.moveTo(lineX, 0); g.lineTo(lineX, H); g.stroke();
    g.setLineDash([]);
  }
  if (seg) {
    const p = points[seg[0]], q = points[seg[1]];
    g.strokeStyle = segColor; g.lineWidth = 3;
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke();
  }
  points.forEach((p, i) => {
    g.beginPath();
    g.arc(p.x, p.y, 6, 0, Math.PI * 2);
    g.fillStyle = col.get(i) ?? (e ? C.dim : C.point);
    g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
  });
  if (order) {
    g.fillStyle = '#0f172a'; g.font = '11px system-ui';
    order.forEach((id, n) => g.fillText(String(n + 1), points[id].x + 9, points[id].y - 8));
  }
}

function delay() { return 1100 - Number($('speed').value) * 100; }  // 1..10 -> 1000..100 ms

function goTo(i) {
  k = Math.max(-1, Math.min(events.length - 1, i));
  draw();
  updateInfo();
}

function tick() {
  goTo(k + 1);
  if (k >= events.length - 1) { pause(); return; }
  timer = setTimeout(tick, delay());
}

function play() {
  if (!events.length) return;
  if (k >= events.length - 1) k = -1;   // terminou? recomeça
  $('btnPlay').textContent = '⏸ Pausar';
  tick();
}

function pause() {
  clearTimeout(timer);
  timer = null;
  $('btnPlay').textContent = '▶ Play';
}

$('btnPlay').addEventListener('click', () => (timer ? pause() : play()));
$('btnNext').addEventListener('click', () => { pause(); goTo(k + 1); });$('btnPrev').addEventListener('click', () => { pause(); goTo(k - 1); });


/* ====== Parte D — painel didático ====== */
const f1 = (v) => (v === null || v === undefined ? '∞' : v.toFixed(1));

function describe(e) {
  switch (e.type) {
    case 'start':
      return `Início: ${e.n} pontos ordenados por x (desempate por y). A recursão vai dividir o conjunto ao meio.`;
    case 'divide':
      return `DIVIDIR (nível ${e.depth}): a linha L (x ≈ ${f1(e.line_x)}) separa ${e.left.length} pontos à esquerda (azul) e ${e.right.length} à direita (laranja).`;
    case 'base_case':
      return `CASO BASE (nível ${e.depth}): só ${e.ids.length} pontos, então compara todos os pares por força bruta.`;
    case 'combine':
      return `COMBINAR (nível ${e.depth}): δ₁ = ${f1(e.delta_left)} e δ₂ = ${f1(e.delta_right)}, logo δ = ${f1(e.delta)}. Falta checar os pares que cruzam L.`;
    case 'strip':
      return `FAIXA: ${e.ids.length} ponto(s) a menos de δ = ${f1(e.delta)} de L, numerados pela ordem de y. Só vizinhos com Δy < δ serão comparados.`;
    case 'compare':
      return `Compara os dois pontos destacados: distância ${f1(e.d)} ${e.delta === null || e.d < e.delta ? '→ melhora o melhor par!' : '≥ δ → descarta.'}`;
    case 'update_best':
      return `Novo melhor par deste subproblema: distância ${f1(e.d)}.`;
    case 'done':
      return `FIM: o par mais próximo está destacado em verde, distância ${f1(e.d)}.`;
    default:
      return '';
  }
}

function currentDelta(e) {
  if (['combine', 'strip', 'compare'].includes(e.type)) return e.delta;
  if (e.type === 'update_best' || e.type === 'done') return e.d;
  return null;
}

function updateInfo() {
  const e = events[k];
  $('stepInfo').textContent = e ? describe(e) : 'Adicione pontos e clique em “Calcular”.';
  $('statStep').textContent = events.length ? `${k + 1} / ${events.length}` : '0 / 0';
  $('statComps').textContent = e ? e.comps : 0;
  $('statDepth').textContent = e && e.depth !== undefined ? e.depth : '–';
  const d = e ? currentDelta(e) : null;
  $('statDelta').textContent = d === null || d === undefined ? '–' : d.toFixed(1);
}

/* ====== Inicialização final da interface ====== */
draw();
updateControls();
