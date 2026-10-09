const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
const $ = (id) => document.getElementById(id);

const dialogueBox = $("dialogue");
const speaker = $("speaker");
const dialogueText = $("dialogueText");
const dialogueHint = $("dialogueHint");
const nextButton = $("nextButton");
const chapter = $("chapter");
const objectiveText = $("objectiveText");
const endingActions = $("endingActions");
const toast = $("toast");

const W = 480;
const H = 270;

let viewScale = 1;
let offsetX = 0;
let offsetY = 0;
let lastTime = 0;
let time = 0;
let elapsed = 0;
let toastTimer = 0;

let fireworks = [];
let fireworksActive = false;
let fireworkTimer = 0;

const game = {
  mode: "story",
  line: 0,
  playerX: 150,
  girlX: 265,
  carrying: false,
  stumble: 0,
  fall: 0,
  fallDirection: 1,
  kittyX: 0,
  kittyY: 0,
  endingKind: "",
  shake: 0
};

// ------------------------------------------------------
// HISTÓRIA
// ------------------------------------------------------

const story = [
  {
    name: "ELA",
    text: "Eu ainda tô brava com você. Você sabia que eu já não tava num dia fácil e mesmo assim foi idiota comigo.",
    hint: "A GENTE PRECISA CONVERSAR",
    chapter: "CAPÍTULO 01 · PRECISAMOS CONVERSAR",
    objective: "Ouvir o que ela tem a dizer"
  },
  {
    name: "VOCÊ",
    text: "Eu sei, amor. Eu fui um idiota mesmo. Não vou ficar tentando inventar desculpa pro que eu fiz.",
    hint: "ASSUMIR A RESPONSABILIDADE"
  },
  {
    name: "VOCÊ",
    text: "Eu sabia que você tava passando por um momento difícil e, em vez de ter carinho e paciência, acabei te magoando. A culpa foi minha.",
    hint: "SEM DESCULPAS, SEM TRANSFERIR A CULPA"
  },
  {
    name: "ELA",
    text: "É justamente isso que me deixa chateada. Eu queria que você tivesse um pouco mais de cuidado comigo.",
    hint: "ELA QUER SER COMPREENDIDA"
  },
  {
    name: "VOCÊ",
    text: "Você tem toda a razão. Você não merecia isso de mim. Desculpa por ter sido insensível quando eu devia ter te tratado com carinho.",
    hint: "UM PEDIDO DE DESCULPAS SINCERO"
  },
  {
    name: "VOCÊ",
    text: "Eu não espero que você pare de ficar brava só porque eu pedi desculpas. Eu só queria tentar fazer alguma coisa pra ver você sorrir de novo...",
    hint: "TENHO UMA SURPRESA PRA VOCÊ",
    action: "departure"
  },
  {
    name: "VOCÊ",
    text: "Amor... eu sei que uma pelúcia não apaga o que aconteceu. Eu trouxe isso porque lembrei de você e queria te dar algo especial.",
    hint: "A SURPRESA CHEGOU",
    action: "showKitty"
  },
  {
    name: "ELA",
    text: "Você foi buscar ESSA COISA GIGANTE? KKKKK... espera, cuidado, você mal tá conseguindo enxergar!",
    hint: "ELA TENTOU AVISAR"
  },
  {
    name: "VOCÊ",
    text: "Tá tudo sob controle, amor. Eu consigo... eu consigo... só preciso dar mais um passinho...",
    hint: "EQUILÍBRIO: QUESTIONÁVEL",
    action: "stumble"
  },
  {
    name: "VOCÊ",
    text: "OPA, OPA, OPA— A HELLO KITTY NÃO! SEGURA— AAAAAA!",
    hint: "O PLANO NÃO SAIU COMO ESPERADO",
    action: "fall"
  },
  {
    name: "VOCÊ",
    text: "Ai... tá tudo bem. Eu acho. A Hello Kitty tá inteira? KKKKK. Amor, falando sério agora: me desculpa mesmo.",
    hint: "TOMBO CONCLUÍDO"
  },
  {
    name: "VOCÊ",
    text: "Eu sei que preciso demonstrar com atitudes, não só com palavras. Vou me esforçar pra te ouvir mais e tratar você melhor. Você é muito importante pra mim.",
    hint: "EU QUERO FAZER MELHOR"
  },
  {
    name: "ELA",
    text: "Eu ainda tô chateada, tá? Mas... obrigada por reconhecer que errou e por tentar consertar as coisas.",
    hint: "A DECISÃO É DELA"
  },
  {
    name: "VOCÊ",
    text: "Eu entendo, meu amor. Não vou te apressar. Só queria te entregar a Hello Kitty... e, se você deixar, te dar um abraço. ❤️",
    hint: "O QUE VAI ACONTECER AGORA?"
  }
];

// ------------------------------------------------------
// TELA E ESCALA
// ------------------------------------------------------

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);

  viewScale = Math.max(innerWidth / W, innerHeight / H);
  offsetX = (innerWidth - W * viewScale) / 2;
  offsetY = (innerHeight - H * viewScale) / 2;

  ctx.imageSmoothingEnabled = false;
}

window.addEventListener("resize", resize);
resize();

// ------------------------------------------------------
// FERRAMENTAS PIXEL ART
// ------------------------------------------------------

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function box(x, y, w, h, fill, outline = "#49364e", border = 2) {
  px(x - border, y - border, w + border * 2, h + border * 2, outline);
  px(x, y, w, h, fill);
}

function label(text, x, y, size = 7, color = "#49364e") {
  ctx.font = `bold ${size}px monospace`;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function heart(x, y, color = "#ff83ae", s = 1) {
  px(x, y, 4 * s, 3 * s, color);
  px(x + 5 * s, y, 4 * s, 3 * s, color);
  px(x - 2 * s, y + 2 * s, 13 * s, 3 * s, color);
  px(x, y + 5 * s, 9 * s, 3 * s, color);
  px(x + 2 * s, y + 8 * s, 5 * s, 2 * s, color);
}

function cloud(x, y, s = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(s, s);

  px(5, 0, 13, 5, "#fff5e9");
  px(0, 5, 25, 7, "#fff5e9");
  px(5, 12, 16, 3, "#fff5e9");

  ctx.restore();
}

// ------------------------------------------------------
// PARQUE DE DIVERSÕES
// ------------------------------------------------------

function drawFerrisWheel(x, y) {
  const radius = 25;
  const cx = x + radius;
  const cy = y + radius;

  px(cx - 3, cy + 13, 6, 27, "#ae7292");
  px(cx - 24, cy + 38, 48, 3, "#49364e");

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.16);

  ctx.strokeStyle = "#fff1d9";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;

    ctx.strokeStyle = "#b46b90";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
    ctx.stroke();

    const gx = Math.cos(a) * radius;
    const gy = Math.sin(a) * radius;

    const colors = ["#ff94ba", "#f6cd77", "#b7a2e8", "#a7d8b5"];

    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(Math.round(gx - 4), Math.round(gy - 3), 8, 7);

    ctx.strokeStyle = "#49364e";
    ctx.strokeRect(Math.round(gx - 4), Math.round(gy - 3), 8, 7);
  }

  ctx.restore();

  px(cx - 4, cy - 4, 8, 8, "#f6cd77");
  px(cx - 2, cy - 2, 4, 4, "#fff5e9");
}

function drawRollerCoaster() {
  ctx.strokeStyle = "#c35e91";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(135, 91);
  ctx.lineTo(153, 56);
  ctx.lineTo(174, 76);
  ctx.lineTo(191, 48);
  ctx.lineTo(213, 87);
  ctx.stroke();

  ctx.strokeStyle = "#fff1d9";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(135, 91);
  ctx.lineTo(153, 56);
  ctx.lineTo(174, 76);
  ctx.lineTo(191, 48);
  ctx.lineTo(213, 87);
  ctx.stroke();

  for (const [x, y] of [[153, 56], [174, 76], [191, 48], [213, 87]]) {
    px(x, y, 3, 40, "#a66b88");
  }

  const progress = (time * 25) % 100;
  const cartX = 135 + progress;
  const cartY = 91 - Math.sin(progress / 100 * Math.PI * 3) * 17;

  box(cartX, cartY, 12, 5, "#f6cd77", "#49364e", 1);
  px(cartX + 2, cartY + 5, 3, 2, "#49364e");
  px(cartX + 8, cartY + 5, 3, 2, "#49364e");
}

function drawCarousel(x, y) {
  box(x, y + 28, 57, 8, "#e7b4ca", "#49364e", 1);

  for (let i = 0; i < 4; i++) {
    px(x + 8 + i * 13, y + 2, 3, 27, "#fff1d9");
  }

  px(x - 3, y, 63, 4, "#49364e");
  px(x + 2, y - 4, 53, 4, "#ff91b8");
  px(x + 9, y - 8, 39, 4, "#ff91b8");
  px(x + 19, y - 12, 19, 4, "#f6cd77");

  for (let i = 0; i < 3; i++) {
    const horseX = x + 7 + i * 19;
    const bob = Math.sin(time * 3 + i * 2) * 2;

    px(
      horseX,
      y + 13 + bob,
      8,
      9,
      ["#b7a2e8", "#a7d8b5", "#ff91b8"][i]
    );

    px(horseX + 1, y + 10 + bob, 6, 4, "#fff1d9");
    px(horseX + 3, y + 11 + bob, 2, 2, "#49364e");
  }
}

function drawBooth(x, y, awning = "#ff91b8") {
  box(x, y, 35, 27, "#f9dfc7", "#49364e", 1);

  px(x - 3, y - 4, 41, 5, "#49364e");
  px(x, y - 3, 35, 5, awning);

  for (let i = 0; i < 5; i++) {
    px(x + i * 7, y - 3, 3, 5, i % 2 ? awning : "#fff1d9");
  }

  px(x + 4, y + 6, 12, 12, "#8bc8bd");
  px(x + 19, y + 6, 11, 12, "#b7a2e8");
  px(x + 17, y + 6, 2, 21, "#49364e");
}

function drawTree(x, y) {
  px(x + 9, y + 19, 7, 21, "#a66b53");
  px(x + 2, y + 8, 20, 17, "#4e927d");
  px(x + 5, y + 2, 16, 16, "#72b59a");
  px(x, y + 13, 12, 10, "#72b59a");
  px(x + 15, y + 12, 12, 11, "#4e927d");
  px(x + 8, y + 7, 4, 4, "#b2d8a1");
  px(x + 16, y + 15, 4, 4, "#b2d8a1");
}

function drawFlags() {
  px(0, 49, W, 2, "#9a6789");

  for (let i = 0; i < 20; i++) {
    const x = i * 26 + 2;
    const wave = Math.round(Math.sin(time * 2 + i * 0.8) * 1.5);
    const color = ["#ff91b8", "#f6cd77", "#b7a2e8", "#fff1d9"][i % 4];

    px(x, 51, 7, 9 + wave, color);
    px(x + 2, 53, 3, 3, "#fff1d9");
  }
}

function drawLights() {
  ctx.strokeStyle = "#72556e";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 66);
  ctx.quadraticCurveTo(240, 104, 480, 65);
  ctx.stroke();

  for (let i = 0; i < 17; i++) {
    const x = i * 30;
    const y = 67 + Math.sin((x / W) * Math.PI) * 18;
    const colors = ["#ffe58b", "#ff9fc1", "#fff1d9", "#b8e5ca"];

    px(x, y, 3, 5, colors[(i + Math.floor(time * 2)) % colors.length]);
    px(x + 1, y + 5, 1, 2, "#72556e");
  }
}

function drawFence(x, y, count) {
  px(x, y, count * 8, 2, "#c28ba5");

  for (let i = 0; i < count; i++) {
    px(x + i * 8, y - 4, 3, 12, "#f8e5d5");
    px(x + i * 8 - 1, y - 5, 5, 3, "#c28ba5");
  }
}

function drawVisitor(x, y, variant) {
  const colors = ["#b7a2e8", "#ff91b8", "#f6cd77", "#f8e5d5"];
  const shirt = colors[variant % colors.length];

  px(x, y, 5, 5, "#f1c4ad");
  px(x - 1, y - 1, 7, 3, "#49364e");
  px(x - 2, y + 5, 9, 7, shirt);
  px(x, y + 12, 2, 4, "#49364e");
  px(x + 4, y + 12, 2, 4, "#49364e");
}

function drawPark() {
  px(0, 0, W, H, "#8bc8bd");

  // Sol
  px(386, 38, 25, 25, "#f9d783");
  px(391, 33, 15, 5, "#f9d783");
  px(391, 63, 15, 5, "#f9d783");
  px(381, 43, 5, 15, "#f9d783");
  px(411, 43, 5, 15, "#f9d783");

  // Nuvens
  cloud(((time * 5 + 22) % 560) - 40, 20, 1.1);
  cloud(((time * 3 + 290) % 560) - 40, 35, 0.8);
  cloud(((time * 4 + 450) % 560) - 40, 13, 0.65);

  // Colinas
  px(0, 78, W, 18, "#a7d6ac");
  px(0, 86, W, 13, "#b5dcae");
  px(0, 94, W, 10, "#94caa0");

  // Brinquedos
  drawFerrisWheel(26, 62);
  drawRollerCoaster();
  drawCarousel(275, 93);
  drawBooth(224, 97, "#ff91b8");
  drawBooth(391, 100, "#b7a2e8");

  // Bandeiras, lâmpadas, árvores e cercas
  drawFlags();
  drawLights();
  drawTree(0, 100);
  drawTree(446, 98);
  drawTree(75, 107);
  drawFence(0, 128, 12);
  drawFence(384, 128, 12);

  // Gramado
  px(0, 136, W, H - 136, "#63c94f");
  px(0, 136, W, 3, "#a5ed79");
  px(0, 139, W, 4, "#80db5e");

  // Caminho
  px(0, 159, W, 111, "#e7c7a8");
  px(0, 159, W, 3, "#f7dfbd");
  px(0, 264, W, 6, "#c8a487");

  for (let i = 0; i < 15; i++) {
    const x = i * 35 + (i % 2) * 10;

    px(x, 171, 18, 2, "#d3b393");
    px(x + 9, 192, 19, 2, "#d3b393");
    px(x + 3, 224, 23, 2, "#d3b393");
    px(x + 12, 246, 15, 2, "#d3b393");
  }

  // Flores nas bordas
  for (let i = 0; i < 35; i++) {
    const x = (i * 41 + 13) % W;

    if (x < 50 || x > 430 || i % 3 === 0) {
      const y = 141 + (i * 7) % 17;

      px(x, y, 3, 3, i % 2 ? "#ff91b8" : "#fff1d9");
      px(x + 3, y + 2, 3, 3, "#f6cd77");
      px(x + 1, y + 5, 2, 4, "#4e927d");
    }
  }

  // Visitantes no parque
  for (let i = 0; i < 7; i++) {
    const x = ((i * 71 + time * (i % 2 ? 5 : -3) + 510) % 500) - 10;
    drawVisitor(x, 131 + (i % 2) * 4, i);
  }

  box(201, 108, 79, 15, "#fff1d9", "#49364e", 2);
  label("FUN PARK", 213, 118, 8, "#c75083");
}

// ------------------------------------------------------
// PERSONAGENS
// ------------------------------------------------------

function drawBoy(x, y, options = {}) {
  const walking = options.walking || false;
  const phase = options.phase || 0;
  const step = walking ? Math.sin(phase) : 0;
  const bounce = walking ? Math.abs(Math.sin(phase)) * 1.2 : 0;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y + bounce));

  // Pernas
  px(4 + step * 2, 23, 5, 8, "#344d59");
  px(15 - step * 2, 23, 5, 8, "#344d59");
  px(2 + step * 2, 29, 8, 3, "#49364e");
  px(14 - step * 2, 29, 8, 3, "#49364e");

  // Calça
  px(4, 20, 17, 6, "#405d67");

  // Tronco
  px(5, 11, 16, 12, "#344d59");

  // Cabelo atrás da cabeça
  px(2, 1, 21, 12, "#49364e");
  px(0, 5, 4, 9, "#49364e");
  px(20, 4, 5, 8, "#49364e");

  // Rosto
  px(4, 5, 17, 10, "#f1c4ad");
  px(2, 7, 3, 5, "#f1c4ad");

  // Franja
  px(3, 3, 7, 4, "#49364e");
  px(9, 2, 7, 4, "#49364e");
  px(15, 3, 6, 3, "#49364e");

  // Olhos
  px(7, 9, 3, 3, "#49364e");
  px(16, 9, 3, 3, "#49364e");

  // Bochechas e boca
  px(5, 12, 3, 2, "#e89b9c");
  px(18, 12, 3, 2, "#e89b9c");
  px(12, 13, 3, 1, "#a64f67");

  // Braços livres
  if (!game.carrying && game.mode !== "falling" && game.mode !== "fallen") {
    px(1, 12 + step * 1.5, 4, 7, "#f1c4ad");
    px(21, 12 - step * 1.5, 4, 7, "#f1c4ad");
  }

  px(12, 17, 3, 3, "#f6cd77");

  ctx.restore();
}

function drawGirl(x, y) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));

  // Pernas e sapatos
  px(5, 23, 5, 8, "#72556e");
  px(15, 23, 5, 8, "#72556e");
  px(3, 29, 8, 3, "#49364e");
  px(14, 29, 8, 3, "#49364e");

  // Vestido
  px(6, 12, 14, 8, "#b79b68");
  px(3, 18, 20, 6, "#b79b68");
  px(10, 15, 5, 4, "#ff91b8");

  // Braços
  px(1, 13, 4, 8, "#f1c4ad");
  px(21, 13, 4, 8, "#f1c4ad");

  // Cabelo
  px(2, 2, 21, 13, "#49364e");
  px(0, 6, 4, 10, "#49364e");
  px(21, 7, 4, 9, "#49364e");

  // Rosto
  px(4, 5, 17, 10, "#f1c4ad");
  px(3, 3, 7, 5, "#49364e");
  px(9, 2, 7, 4, "#49364e");
  px(15, 3, 7, 4, "#49364e");

  // Olhos e expressão
  px(7, 9, 3, 3, "#49364e");
  px(16, 9, 3, 3, "#49364e");
  px(5, 12, 3, 2, "#e89b9c");
  px(18, 12, 3, 2, "#e89b9c");
  px(12, 13, 3, 1, "#a64f67");

  // Presilha
  px(19, 3, 4, 4, "#ff83ae");
  px(20, 4, 2, 2, "#fff1d9");

  ctx.restore();
}

// ------------------------------------------------------
// HELLO KITTY
// ------------------------------------------------------

function drawKitty(x, y, scale = 1) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(scale, scale);

  // Orelhas
  box(4, 1, 12, 13, "#fff9ef");
  box(29, 1, 12, 13, "#fff9ef");

  // Cabeça
  box(2, 7, 40, 30, "#fff9ef");
  px(1, 15, 3, 12, "#fff9ef");
  px(40, 15, 3, 12, "#fff9ef");

  // Olhos e nariz
  px(12, 21, 3, 4, "#49364e");
  px(29, 21, 3, 4, "#49364e");
  px(21, 24, 5, 3, "#f6cd77");

  // Bigodes
  px(5, 24, 6, 1, "#49364e");
  px(6, 27, 5, 1, "#49364e");
  px(33, 24, 6, 1, "#49364e");
  px(33, 27, 5, 1, "#49364e");

  // Laço
  px(28, 7, 8, 4, "#ff75a8");
  px(25, 4, 6, 6, "#ff75a8");
  px(34, 4, 6, 6, "#ff75a8");
  px(32, 7, 3, 3, "#d85d91");

  // Corpo e patinhas
  box(9, 36, 26, 12, "#fff9ef");
  px(3, 37, 9, 7, "#fff9ef");
  px(34, 37, 9, 7, "#fff9ef");
  px(5, 43, 8, 4, "#fff9ef");
  px(33, 43, 8, 4, "#fff9ef");

  // Coração na barriga
  px(20, 40, 3, 3, "#ff75a8");
  px(23, 40, 3, 3, "#ff75a8");
  px(21, 43, 4, 2, "#ff75a8");

  ctx.restore();
}

// ------------------------------------------------------
// CARREGAR A PELÚCIA DE VERDADE
// ------------------------------------------------------

function drawCarryingPose() {
  const x = game.playerX;
  const y = 166;

  // Pernas
  px(x + 4, y + 23, 5, 8, "#344d59");
  px(x + 15, y + 23, 5, 8, "#344d59");
  px(x + 2, y + 29, 8, 3, "#49364e");
  px(x + 14, y + 29, 8, 3, "#49364e");

  // Tronco
  px(x + 5, y + 11, 16, 12, "#344d59");

  // Cabeça do personagem
  px(x + 2, y + 1, 21, 12, "#49364e");
  px(x + 4, y + 5, 17, 10, "#f1c4ad");
  px(x + 2, y + 7, 3, 5, "#f1c4ad");
  px(x + 3, y + 3, 7, 4, "#49364e");
  px(x + 9, y + 2, 7, 4, "#49364e");
  px(x + 15, y + 3, 6, 3, "#49364e");
  px(x + 7, y + 9, 3, 3, "#49364e");
  px(x + 16, y + 9, 3, 3, "#49364e");
  px(x + 5, y + 12, 3, 2, "#e89b9c");
  px(x + 18, y + 12, 3, 2, "#e89b9c");
  px(x + 12, y + 13, 3, 1, "#a64f67");

  // A pelúcia fica encostada no peito
  const kittyX = x + 18;
  const kittyY = y - 36 + game.kittyY;

  drawKitty(kittyX, kittyY, 1.12);

  // Braço esquerdo segurando a pelúcia
  px(x + 15, y + 13, 5, 5, "#344d59");
  px(x + 17, y + 15, 5, 5, "#f1c4ad");
  px(x + 20, y + 15, 5, 5, "#f1c4ad");
  px(x + 22, y + 13, 4, 5, "#f1c4ad");

  // Braço direito
  px(x + 20, y + 17, 5, 5, "#344d59");
  px(x + 24, y + 17, 5, 5, "#f1c4ad");
  px(x + 27, y + 15, 5, 5, "#f1c4ad");
  px(x + 29, y + 13, 4, 5, "#f1c4ad");

  // Detalhes das mãos
  px(x + 23, y + 16, 3, 2, "#e6a996");
  px(x + 28, y + 15, 3, 2, "#e6a996");
}

// ------------------------------------------------------
// QUEDA: PESO, DESEQUILÍBRIO E CONTATO COM O CHÃO
// ------------------------------------------------------

function drawFallenCharacter() {
  const x = game.playerX;
  const progress = Math.max(0, Math.min(1, game.fall));

  // A queda é lateral e curta
  const bodyX = x + progress * 10;
  const bodyY = 187 - Math.sin(progress * Math.PI) * 3;
  const angle = progress * 1.35;

  // Pelúcia desliza um pouco para a direita
  const kittyX = x + 18 + progress * 14;
  const kittyY = 151 + progress * 3;

  ctx.save();
  ctx.translate(bodyX + 12, bodyY);
  ctx.rotate(angle);

  // Pernas
  px(-9, -5, 6, 10, "#344d59");
  px(0, -5, 6, 10, "#344d59");
  px(-11, 3, 8, 3, "#49364e");
  px(-1, 3, 8, 3, "#49364e");

  // Corpo
  px(-9, -15, 18, 12, "#344d59");

  // Cabeça
  px(-8, -27, 20, 13, "#49364e");
  px(-6, -24, 16, 10, "#f1c4ad");
  px(-7, -27, 16, 5, "#49364e");

  // Olhos arregalados e boca de susto
  px(-3, -21, 3, 3, "#49364e");
  px(5, -21, 3, 3, "#49364e");
  px(1, -16, 4, 3, "#a64f67");

  ctx.restore();

  // Pelúcia no chão
  drawKitty(kittyX, kittyY, 1.12);

  // Poeira aparece no contato
  if (progress > 0.8) {
    px(bodyX - 4, 196, 5, 2, "#fff1d9");
    px(bodyX + 9, 200, 4, 2, "#fff1d9");
    px(kittyX - 2, 198, 4, 2, "#fff1d9");
  }
}

// ------------------------------------------------------
// PERSONAGENS NA CENA
// ------------------------------------------------------

function drawCharacters() {
  const girlY = 166;

  if (game.mode === "departure") {
    drawGirl(game.girlX, girlY);

    drawBoy(game.playerX, girlY, {
      walking: true,
      phase: time * 8
    });

    return;
  }

  if (game.mode === "return" || game.mode === "stumble") {
    drawGirl(game.girlX, girlY);

    // A pelúcia balança levemente
    if (game.mode === "stumble") {
      const wobble = Math.sin(game.stumble * 10) * 1.5;
      game.kittyY = wobble;
    } else {
      game.kittyY = Math.sin(time * 7) * 0.8;
    }

    drawCarryingPose();
    return;
  }

  if (game.mode === "falling" || game.mode === "fallen") {
    drawGirl(game.girlX, girlY);
    drawFallenCharacter();
    return;
  }

  if (game.mode === "ending") {
    drawGirl(222, girlY);

    // No final, você fica de pé ao lado da pelúcia
    drawBoy(178, girlY);
    drawKitty(199, 151, 0.85);

    for (let i = 0; i < 6; i++) {
      heart(
        167 + i * 24,
        119 + Math.sin(time * 2 + i) * 4,
        i % 2 ? "#ff75a8" : "#f6cd77"
      );
    }

    return;
  }

  drawGirl(game.girlX, girlY);
  drawBoy(game.playerX, girlY);
  heart(198, 145 + Math.sin(time * 3) * 2, "#ff83ae");
}

// ------------------------------------------------------
// INTERFACE E NARRATIVA
// ------------------------------------------------------

function setChapter(title, objective) {
  chapter.textContent = title;
  objectiveText.textContent = objective;
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  toastTimer = 2;
}

// ------------------------------------------------------
// FOGOS DE ARTIFÍCIO
// ------------------------------------------------------

function launchFirework() {
  const x = 35 + Math.random() * (W - 70);
  const y = 28 + Math.random() * 85;

  const colors = [
    "#ff75a8",
    "#f6cd77",
    "#fff1d9",
    "#b79bff",
    "#8be8df",
    "#ff91b8"
  ];

  const color = colors[Math.floor(Math.random() * colors.length)];
  const count = 16 + Math.floor(Math.random() * 9);

  for (let i = 0; i < count; i++) {
    const angle =
      (Math.PI * 2 * i) / count +
      (Math.random() - 0.5) * 0.18;

    const speed = 18 + Math.random() * 42;

    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.8 + Math.random() * 0.7,
      maxLife: 0.8 + Math.random() * 0.7,
      color,
      size: Math.random() < 0.35 ? 3 : 2
    });
  }
}

function updateFireworks(dt) {
  if (
    !fireworksActive ||
    game.mode !== "ending" ||
    game.endingKind !== "forgive"
  ) {
    return;
  }

  fireworkTimer -= dt;

  if (fireworkTimer <= 0) {
    launchFirework();
    fireworkTimer = 0.32 + Math.random() * 0.38;
  }

  for (const particle of fireworks) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 20 * dt;
    particle.vx *= 0.99;
    particle.life -= dt;
  }

  fireworks = fireworks.filter(particle => particle.life > 0);
}

function drawFireworks() {
  if (
    !fireworksActive ||
    game.mode !== "ending" ||
    game.endingKind !== "forgive"
  ) {
    return;
  }

  for (const particle of fireworks) {
    ctx.globalAlpha = Math.max(
      0,
      Math.min(1, particle.life / particle.maxLife)
    );

    px(
      particle.x,
      particle.y,
      particle.size,
      particle.size,
      particle.color
    );
  }

  ctx.globalAlpha = 1;

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 15px monospace";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#49364e";

  ctx.strokeText("EU TE AMOOOOOOO", W / 2, 34);

  ctx.fillStyle = "#ff91b8";
  ctx.fillText("EU TE AMOOOOOOO", W / 2, 34);

  ctx.restore();
}

// ------------------------------------------------------
// DIÁLOGOS
// ------------------------------------------------------

function showLine() {
  const item = story[game.line];

  if (!item) return;

  speaker.textContent = item.name;
  dialogueText.textContent = item.text;
  dialogueHint.textContent = item.hint || "LOVE QUEST";

  nextButton.disabled = false;
  nextButton.classList.remove("hidden");
  nextButton.textContent = "Continuar ▶";

  if (item.chapter || item.objective) {
    setChapter(
      item.chapter || chapter.textContent,
      item.objective || objectiveText.textContent
    );
  }

  if (item.action) {
    performAction(item.action);
  }
}

// ------------------------------------------------------
// AÇÕES ESPECIAIS DA HISTÓRIA
// ------------------------------------------------------

function performAction(action) {
  if (action === "departure") {
    game.mode = "departure";
    game.playerX = 150;
    game.carrying = false;
    elapsed = 0;

    setChapter(
      "CAPÍTULO 02 · A SURPRESA",
      "Buscar o presente especial"
    );

    nextButton.disabled = true;
    showToast("MISSÃO: BUSCAR A HELLO KITTY");
  }

  if (action === "showKitty") {
    game.mode = "return";
    game.carrying = true;

    // Volta da esquerda já carregando a pelúcia
    game.playerX = -38;
    game.kittyY = 0;
    elapsed = 0;

    setChapter(
      "CAPÍTULO 03 · O PRESENTE",
      "Entregar a surpresa com cuidado"
    );
  }

  if (action === "stumble") {
    game.mode = "stumble";
    game.stumble = 0;
    game.playerX = 194;
    elapsed = 0;

    setChapter(
      "EVENTO ESPECIAL · EQUILÍBRIO",
      "Tentar segurar a pelúcia"
    );

    nextButton.disabled = true;
    showToast("PESADA DEMAIS! 😭");
  }

  if (action === "fall") {
    game.mode = "falling";
    game.fall = 0;
    game.shake = 0;
    elapsed = 0;

    setChapter(
      "EVENTO ESPECIAL · TOMBO",
      "Proteger a Hello Kitty!"
    );

    nextButton.disabled = true;
    showToast("OPA, OPA, OPA!");
  }
}

// ------------------------------------------------------
// AVANÇO DA HISTÓRIA — CORRIGIDO
// ------------------------------------------------------

function advanceStory() {
  // Durante uma animação, o botão não avança a história.
  const animating = [
    "departure",
    "return",
    "stumble",
    "falling"
  ];

  if (animating.includes(game.mode)) {
    return;
  }

  // Quando uma animação termina, Continuar abre a próxima fala.
  const pauseTargets = {
    departurePause: 6,
    returnPause: 7,
    stumblePause: 9,
    fallPause: 10
  };

  if (
    Object.prototype.hasOwnProperty.call(
      pauseTargets,
      game.mode
    )
  ) {
    const targetLine = pauseTargets[game.mode];

    game.line = targetLine;

    // A queda termina na linha 10.
    // O modo "fallen" será tratado separadamente no próximo clique.
    game.mode = targetLine === 10 ? "fallen" : "story";

    showLine();
    return;
  }

  // CORREÇÃO PRINCIPAL:
  // Ao clicar depois da fala da queda, saímos do modo "fallen"
  // e avançamos para a próxima fala em vez de repetir a linha 10.
  if (game.mode === "fallen") {
    game.mode = "story";

    if (game.line < story.length - 1) {
      game.line++;
      showLine();
    } else {
      finishStory();
    }

    return;
  }

  if (game.line >= story.length - 1) {
    finishStory();
    return;
  }

  game.mode = "story";
  game.line++;

  showLine();
}

// ------------------------------------------------------
// FINAIS
// ------------------------------------------------------

function finishStory() {
  game.mode = "ending";

  dialogueBox.classList.add("hidden");
  endingActions.classList.remove("hidden");

  setChapter(
    "FINAL · SUA ESCOLHA",
    "Dar espaço ou aceitar o abraço"
  );
}

function chooseEnding(kind) {
  game.mode = "ending";
  game.endingKind = kind;

  fireworksActive = kind === "forgive";
  fireworks = [];
  fireworkTimer = 0;

  endingActions.classList.add("hidden");
  dialogueBox.classList.remove("hidden");

  speaker.textContent = kind === "forgive" ? "ELA 💗" : "ELA 🤨";

  dialogueText.textContent = kind === "forgive"
    ? "Tá bom, seu bobinho... eu te perdoo. Ainda fiquei chateada, mas gostei de você reconhecer que errou. Agora vem cá me dar aquele abraço. ❤️"
    : "Eu ainda preciso de um tempinho, tá? Mas obrigada por me ouvir e por não tentar colocar a culpa em mim. A gente conversa com calma. 💗";

  dialogueHint.textContent = kind === "forgive"
    ? "FINAL · UM ABRAÇO MERECIDO"
    : "FINAL · RESPEITANDO O TEMPO DELA";

  nextButton.disabled = false;

nextButton.textContent = kind === "forgive"
  ? "Tenho uma surpresa pra você ❤️"
  : "Jogar novamente ↻";

  setChapter(
    kind === "forgive"
      ? "FINAL · RECONCILIAÇÃO"
      : "FINAL · COM CALMA",
    kind === "forgive"
      ? "Um passo de cada vez"
      : "O respeito também é amor"
  );
}

$("forgiveButton").addEventListener("click", () => {
  chooseEnding("forgive");
});

$("thinkButton").addEventListener("click", () => {
  chooseEnding("think");
});

// ------------------------------------------------------
// REINICIAR O JOGO
// ------------------------------------------------------

function restartGame() {
  game.mode = "story";
  game.line = 0;
  game.playerX = 150;
  game.girlX = 265;
  game.carrying = false;
  game.stumble = 0;
  game.fall = 0;
  game.kittyY = 0;
  game.endingKind = "";
  game.shake = 0;

  fireworksActive = false;
  fireworks = [];
  fireworkTimer = 0;
  elapsed = 0;

  endingActions.classList.add("hidden");
  dialogueBox.classList.remove("hidden");

  nextButton.disabled = false;

  showLine();
}

// ------------------------------------------------------
// EVENTO DO BOTÃO CONTINUAR
// ------------------------------------------------------


nextButton.addEventListener("click", () => {
  if (game.mode === "ending") {
    if (game.endingKind === "forgive") {
      window.location.href = "./final.html";
      return;
    }

    if (nextButton.textContent.includes("novamente")) {
      restartGame();
    }

    return;
  }

  advanceStory();
});


// ------------------------------------------------------
// ATUALIZAÇÃO DAS ANIMAÇÕES
// ------------------------------------------------------

function update(dt) {
  time += dt;

  updateFireworks(dt);

  if (toastTimer > 0) {
    toastTimer -= dt;

    if (toastTimer <= 0) {
      toast.classList.remove("show");
    }
  }

  // Você sai da tela para buscar a pelúcia
  if (game.mode === "departure") {
    game.playerX -= 92 * dt;

    if (game.playerX < -38) {
      game.playerX = -38;
      game.mode = "departurePause";
      elapsed = 0;
      nextButton.disabled = false;
    }
  }

  if (game.mode === "departurePause") {
    nextButton.disabled = false;
  }

  // Você volta carregando a Hello Kitty gigante
  if (game.mode === "return") {
    game.playerX = Math.min(
      game.playerX + 55 * dt,
      194
    );

    if (game.playerX >= 194) {
      game.mode = "returnPause";
      elapsed = 0;
      nextButton.disabled = false;
    }
  }

  if (game.mode === "returnPause") {
    nextButton.disabled = false;
  }

  // Animação de desequilíbrio
  if (game.mode === "stumble") {
    game.stumble += dt;
    game.playerX = 194 + Math.sin(game.stumble * 10) * 1.5;

    if (game.stumble >= 1.1) {
      game.mode = "stumblePause";
      elapsed = 0;
      nextButton.disabled = false;
    }
  }

  if (game.mode === "stumblePause") {
    nextButton.disabled = false;
  }

  // Animação da queda
  if (game.mode === "falling") {
    game.fall = Math.min(
      1,
      game.fall + dt * 1.8
    );

    game.shake = game.fall > 0.7
      ? (game.fall - 0.7) * 4
      : 0;

    if (game.fall >= 1) {
      game.mode = "fallPause";
      elapsed = 0;
      game.shake = 0;
      nextButton.disabled = false;

      showToast("TOMBO CONFIRMADO!");
    }
  }

  if (game.mode === "fallPause") {
    nextButton.disabled = false;
  }
}

// ------------------------------------------------------
// RENDERIZAÇÃO
// ------------------------------------------------------

function render() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.clearRect(
    0,
    0,
    canvas.width / dpr,
    canvas.height / dpr
  );

  ctx.setTransform(
    dpr * viewScale,
    0,
    0,
    dpr * viewScale,
    dpr * offsetX,
    dpr * offsetY
  );

  ctx.imageSmoothingEnabled = false;

  if (game.shake > 0) {
    ctx.translate(
      Math.sin(time * 80) * game.shake,
      Math.cos(time * 72) * game.shake
    );
  }

  drawPark();
  drawFireworks();
  drawCharacters();

  // Poeira discreta durante a corrida
  if (
    game.mode === "departure" ||
    game.mode === "return"
  ) {
    const x = game.playerX + 12;
    const y = 201;

    if (Math.sin(time * 10) > 0.4) {
      px(x - 5, y, 3, 2, "#fff1d9");
      px(x - 8, y - 3, 2, 2, "#fff1d9");
    }
  }

  // Brilhos na pelúcia
  if (
    game.mode === "return" ||
    game.mode === "stumble"
  ) {
    const sx = game.playerX + 42;
    const sy = 133 + Math.sin(time * 5) * 2;

    px(sx, sy, 3, 3, "#fff1d9");
    px(sx + 15, sy - 8, 3, 3, "#f6cd77");
  }
}

// ------------------------------------------------------
// LOOP PRINCIPAL
// ------------------------------------------------------

function frame(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }

  const dt = Math.min(
    (timestamp - lastTime) / 1000,
    0.04
  );

  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(frame);
}

showLine();
requestAnimationFrame(frame);
