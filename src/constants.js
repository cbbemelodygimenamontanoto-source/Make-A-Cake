
const W         = 480;
const H         = 640;
const MAX_LIVES = 4;

const C = {
  bgTop:     0xffeaf4,
  bgBot:     0xf5c8f0,
  pink:      0xff8fb8,
  pinkDark:  0xe0557a,
  pinkLight: 0xffd6e8,
  lilac:     0xc9a8e8,
  lilacDark: 0x9c6cbf,
  mint:      0xa8e8c8,
  mintDark:  0x4db888,
  peach:     0xffcba4,
  peachDark: 0xe89060,
  sky:       0xa8d8f0,
  skyDark:   0x5aabde,
  white:     0xffffff,
  text:      0x6b2d5e,
};

const LEVELS = [
  {
    id:             1,
    name:           "Nivel 1 — La Base",
    ingredient:     "🥛",
    ingredientName: "Crema de leche",
    goal:           12,
    time:           60,
    speed:          160,
    spawnRate:      1400,
    badItems:       ["🍋", "🧅", "🫑", "🧄"],
    accentNum:      0xff8fb8,
    panelNum:       0xffd6e8,
  },
  {
    id:             2,
    name:           "Nivel 2 — El Bizcocho",
    ingredient:     "🍞",
    ingredientName: "Bizcocho",
    goal:           10,
    time:           55,
    speed:          200,
    spawnRate:      1200,
    badItems:       ["🌶️", "🧅", "🫐", "🪨"],
    accentNum:      0xffb347,
    panelNum:       0xffe8c0,
  },
  {
    id:             3,
    name:           "Nivel 3 — La Mermelada",
    ingredient:     "🍓",
    ingredientName: "Mermelada",
    goal:           8,
    time:           50,
    speed:          240,
    spawnRate:      1000,
    badItems:       ["🧅", "🍋", "🌶️", "🧄", "🥦"],
    accentNum:      0xff6b9d,
    panelNum:       0xffcce0,
  },
  {
    id:             4,
    name:           "Nivel 4 — El Chocolate",
    ingredient:     "🍫",
    ingredientName: "Chocolate",
    goal:           10,
    time:           45,
    speed:          280,
    spawnRate:      850,
    badItems:       ["🧅", "🫑", "🪨", "🧄", "🍋", "🌶️"],
    accentNum:      0xc9a8e8,
    panelNum:       0xecdff8,
  },
  {
    id:             5,
    name:           "Nivel 5 — El Toque Final",
    ingredient:     "🍒",
    ingredientName: "Cerezas",
    goal:           8,
    time:           40,
    speed:          320,
    spawnRate:      700,
    badItems:       ["🧅", "🫑", "🪨", "🧄", "🍋", "🌶️", "🥦"],
    accentNum:      0xff8fb8,
    panelNum:       0xffd6e8,
  },
];


/**
 * Dibuja un botón tipo píldora con brillo superior.
 * @param {Phaser.GameObjects.Graphics} g
 * @param {number} w  - ancho total
 * @param {number} h  - alto total
 * @param {number} fill   - color de relleno (hex)
 * @param {number} border - color del borde (hex)
 */
function drawPillBtn(g, w, h, fill, border) {
  const r = h / 2;
  g.fillStyle(fill, 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.lineStyle(2.5, border, 1);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  g.fillStyle(0xffffff, 0.32);
  g.fillRoundedRect(-w / 2 + 5, -h / 2 + 4, w - 10, h * 0.38, (h * 0.38) / 2);
}

/**
 * Dibuja un fondo degradado de arriba a abajo.
 * @param {Phaser.Scene} scene
 * @param {number} topColor - color inicio (hex)
 * @param {number} botColor - color fin (hex)
 */
function drawPastelBg(scene, topColor, botColor) {
  const g  = scene.add.graphics();
  const tr = (topColor >> 16) & 0xff, tg = (topColor >> 8) & 0xff, tb = topColor & 0xff;
  const br = (botColor >> 16) & 0xff, bg_ = (botColor >> 8) & 0xff, bb = botColor & 0xff;
  for (let i = 0; i < H; i++) {
    const t  = i / H;
    const r  = Math.round(tr + (br - tr) * t);
    const gv = Math.round(tg + (bg_ - tg) * t);
    const b  = Math.round(tb + (bb - tb) * t);
    g.fillStyle(Phaser.Display.Color.GetColor(r, gv, b), 1);
    g.fillRect(0, i, W, 1);
  }
  return g;
}

/**
 * Agrega burbujas decorativas animadas al fondo.
 * @param {Phaser.Scene} scene
 * @param {number} count - cantidad de burbujas
 */
function addBubbles(scene, count) {
  const cols = [0xffd6e8, 0xe8d5f5, 0xd5eaf5, 0xfff0c0, 0xd5f5e3];
  for (let i = 0; i < count; i++) {
    const x = Phaser.Math.Between(10, W - 10);
    const y = Phaser.Math.Between(10, H - 10);
    const r = Phaser.Math.Between(8, 26);
    const circle = scene.add.circle(x, y, r, Phaser.Utils.Array.GetRandom(cols), 0.32);
    scene.add.circle(x - r * 0.28, y - r * 0.28, r * 0.22, 0xffffff, 0.65);
    scene.tweens.add({
      targets:  circle,
      y:        y - Phaser.Math.Between(12, 36),
      alpha:    { from: 0.32, to: 0.08 },
      duration: 2000 + Math.random() * 3000,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
      delay:    Math.random() * 3000,
    });
  }
}

/**
 * Dibuja el suelo de cocina tipo tablero de ajedrez.
 * @param {Phaser.Scene} scene
 * @param {number} yStart - coordenada Y donde empieza el suelo
 */
function drawKitchenFloor(scene, yStart) {
  const g = scene.add.graphics();
  for (let col = 0; col < 12; col++) {
    for (let row = 0; row < 3; row++) {
      const even = (col + row) % 2 === 0;
      g.fillStyle(even ? 0xffffff : 0xffd6e8, 0.52);
      g.fillRect(col * 40, yStart + row * 24, 40, 24);
    }
  }
  g.fillStyle(0xffffff, 0.5);
  g.fillRect(0, yStart, W, 8);
  g.lineStyle(2, C.pink, 0.7);
  g.lineBetween(0, yStart, W, yStart);
}
