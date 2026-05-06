class InstructionsScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Instructions' });
  }

  preload() {
  }

  create() {
    drawPastelBg(this, C.bgTop, C.bgBot);
    addBubbles(this, 10);

    this._createHeader();
    this._createInstructions();
    this._createBackButton();
  }

  update() {
  }

  _createHeader() {
    const hg = this.add.graphics();
    hg.fillStyle(C.pink, 1);
    hg.fillRoundedRect(0, 0, W, 66, 0);
    hg.fillStyle(0xffffff, 0.2);
    hg.fillRect(0, 0, W, 26);

    this.add.text(W / 2, 33, ' CÓMO JUGAR', {
      fontSize:        '22px',
      fontFamily:      'Georgia',
      color:           '#fff',
      stroke:          '#e0557a',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  _createInstructions() {
    const lines = [
      ['Mueve la canasta con ← → o tocando la pantalla'],
      ['Atrapa los ingredientes correctos del nivel'],
      ['Evita los objetos que NO son ingredientes'],
      ['Tienes 4 vidas — atrapar algo malo quita 1'],
      ['Cada nivel tiene un límite de tiempo'],
      ['Llena la meta del nivel para avanzar'],
      ['Cada nivel sube la velocidad y dificultad'],
      [' Al final ¡verás cómo quedó tu pastel!'],
    ];

    const panelColors = [
      C.pinkLight, 0xffe8c0, 0xffd6e8, 0xd5f5e3,
      0xd5eaf5,    0xffeaf4, 0xecdff8, C.pinkLight,
    ];

    lines.forEach(([icon, text], i) => {
      const y = 90 + i * 61;

      const g = this.add.graphics();
      g.fillStyle(panelColors[i % panelColors.length], 0.88);
      g.fillRoundedRect(16, y - 15, W - 32, 50, 14);
      g.lineStyle(1.5, C.pink, 0.45);
      g.strokeRoundedRect(16, y - 15, W - 32, 50, 14);

      this.add.text(34, y + 10, icon, { fontSize: '22px' }).setOrigin(0, 0.5);
      this.add.text(68, y + 10, text, {
        fontSize:   '13px',
        fontFamily: 'Georgia',
        color:      '#7a3060',
        wordWrap:   { width: W - 105 },
      }).setOrigin(0, 0.5);
    });
  }

  _createBackButton() {
    const btn = this.add.container(W / 2, H - 42);
    const bg  = this.add.graphics();
    drawPillBtn(bg, 220, 46, C.pink, C.pinkDark);

    const txt = this.add.text(0, 0, '← Volver al Menú', {
      fontSize:        '16px',
      fontFamily:      'Georgia',
      color:           '#fff',
      stroke:          '#0003',
      strokeThickness: 2,
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(220, 46);
    btn.setInteractive();

    btn.on('pointerdown', () => this.scene.start('Menu'));
    btn.on('pointerover', () => {
      this.tweens.add({ targets: btn, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    btn.on('pointerout', () => {
      this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }
}
