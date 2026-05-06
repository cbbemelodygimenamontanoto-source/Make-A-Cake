

class MenuScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Menu' });
  }

  preload() {

    this.load.audio('musicaFondo', 'assets/Game.mp3');

  }

  create() {

      this.musica = this.sound.add('musicaFondo', {
        loop: true,
        volume: 0.5
      });

    this.musica.play();

    drawPastelBg(this, C.bgTop, C.bgBot);
    addBubbles(this, 18);
    this._drawFloor();
    this._drawDots();

    this._createTitle();
    this._createButtons();
    this._createBottomDeco();


  }

  update() {

  }


  _drawFloor() {
    const g = this.add.graphics();
    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < 3; row++) {
        g.fillStyle((col + row) % 2 === 0 ? 0xffffff : 0xffe0f0, 0.45);
        g.fillRect(col * 40, H - 60 + row * 20, 40, 20);
      }
    }
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(0, H - 66, W, 8);
    g.lineStyle(2, C.pink, 0.7);
    g.lineBetween(0, H - 66, W, H - 66);
  }

  _drawDots() {
    const dotColors = [0xffd6e8, 0xe8d5f5, 0xd5eaf5];
    for (let i = 0; i < 22; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(100, H - 80),
        Phaser.Math.Between(3, 9),
        Phaser.Utils.Array.GetRandom(dotColors),
        0.38
      );
    }
  }

  _createTitle() {
    const ring = this.add.circle(W / 2, 110, 66, C.pink, 0.16);
    this.tweens.add({
      targets:  ring,
      scaleX:   1.35,
      scaleY:   1.35,
      alpha:    0,
      duration: 1700,
      repeat:   -1,
      ease:     'Power2.easeOut',
    });

    this.add.text(W / 2, 110, '🎂', { fontSize: '68px' }).setOrigin(0.5);

    const banner = this.add.graphics();
    banner.fillStyle(C.pink, 1);
    banner.fillRoundedRect(40, 188, W - 80, 76, 18);
    banner.fillStyle(0xffffff, 0.22);
    banner.fillRoundedRect(40, 188, W - 80, 28, { tl: 18, tr: 18, bl: 0, br: 0 });
    banner.lineStyle(3, C.pinkDark, 1);
    banner.strokeRoundedRect(40, 188, W - 80, 76, 18);
    banner.fillStyle(C.pink, 1);
    banner.fillTriangle(40, 192, 40, 262, 16, 230);
    banner.fillTriangle(W - 40, 192, W - 40, 262, W - 16, 230);

    const title = this.add.text(W / 2, 226, '¡Atrapa los Ingredientes!', {
      fontSize:        '22px',
      fontFamily:      'Georgia, serif',
      color:           '#ffffff',
      stroke:          '#e0557a',
      strokeThickness: 3,
      shadow:          { offsetX: 1, offsetY: 2, color: '#b03060', blur: 2, fill: true },
    }).setOrigin(0.5);

    this.tweens.add({
      targets:  title,
      y:        223,
      duration: 1800,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

  }

  _createButtons() {
    const btns = [
      { y: 330, label: '▶  JUGAR',          fill: C.pink,  border: C.pinkDark,  hover: 0xffaece, target: 'play'   },
      { y: 408, label: '  NIVELES',        fill: C.lilac, border: C.lilacDark, hover: 0xddc2f5, target: 'levels' },
      { y: 486, label: '  INSTRUCCIONES',  fill: C.sky,   border: C.skyDark,   hover: 0xc8eaff, target: 'inst'   },
    ];

    btns.forEach(b => {
      const btn = this.add.container(W / 2, b.y);
      const bg  = this.add.graphics();
      drawPillBtn(bg, 240, 52, b.fill, b.border);

      const txt = this.add.text(0, 0, b.label, {
        fontSize:        '19px',
        fontFamily:      'Georgia, serif',
        color:           '#ffffff',
        stroke:          '#0004',
        strokeThickness: 2,
      }).setOrigin(0.5);

      btn.add([bg, txt]);
      btn.setSize(240, 52);
      btn.setInteractive();

      btn.on('pointerover', () => {
        bg.clear();
        drawPillBtn(bg, 240, 52, b.hover, b.border);
        this.tweens.add({ targets: btn, scaleX: 1.07, scaleY: 1.07, duration: 100 });
      });
      btn.on('pointerout', () => {
        bg.clear();
        drawPillBtn(bg, 240, 52, b.fill, b.border);
        this.tweens.add({ targets: btn, scaleX: 1, scaleY: 1, duration: 100 });
      });
      btn.on('pointerdown', () => {
        this.cameras.main.flash(180, 255, 200, 210);
        const delay = 180;
        if (b.target === 'play')   this.time.delayedCall(delay, () => this.scene.start('Game', { level: 0, lives: MAX_LIVES, score: 0, collected: {} }));
        if (b.target === 'levels') this.time.delayedCall(delay, () => this.scene.start('Levels'));
        if (b.target === 'inst')   this.time.delayedCall(delay, () => this.scene.start('Instructions'));
      });
    });
  }

  _createBottomDeco() {

  }


}
