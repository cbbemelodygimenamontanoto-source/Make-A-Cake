class LevelsScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Levels' });
  }

  preload() {
  }

  create() {
    drawPastelBg(this, C.bgTop, C.bgBot);
    addBubbles(this, 10);

    this._createHeader();
    this._createLevelCards();
    this._createBackButton();
  }

  update() {
  }


  _createHeader() {
    const hg = this.add.graphics();
    hg.fillStyle(C.lilac, 1);
    hg.fillRoundedRect(0, 0, W, 66, 0);
    hg.fillStyle(0xffffff, 0.2);
    hg.fillRect(0, 0, W, 26);

    this.add.text(W / 2, 33, ' NIVELES', {
      fontSize:        '22px',
      fontFamily:      'Georgia',
      color:           '#fff',
      stroke:          '#9c6cbf',
      strokeThickness: 3,
    }).setOrigin(0.5);
  }

  _createLevelCards() {
    LEVELS.forEach((lvl, i) => {
      const y = 90 + i * 104;

      const g = this.add.graphics();
      g.fillStyle(lvl.panelNum, 0.92);
      g.fillRoundedRect(16, y, W - 32, 88, 16);
      g.lineStyle(2.5, lvl.accentNum, 0.9);
      g.strokeRoundedRect(16, y, W - 32, 88, 16);
      g.fillStyle(0xffffff, 0.28);
      g.fillRoundedRect(16, y, W - 32, 30, { tl: 16, tr: 16, bl: 0, br: 0 });

      this.add.text(36,  y + 44, lvl.ingredient, { fontSize: '30px' });
      this.add.text(80,  y + 17, lvl.name, {
        fontSize: '14px', fontFamily: 'Georgia',
        color: '#6b2d5e', fontStyle: 'bold',
      });
      this.add.text(80, y + 38, `Meta: ${lvl.goal} ${lvl.ingredientName}s`, {
        fontSize: '12px', fontFamily: 'Georgia', color: '#8b4070',
      });
      this.add.text(80, y + 56, `⏱ ${lvl.time}s  •  Velocidad ×${(lvl.speed / 160).toFixed(1)}`, {
        fontSize: '11px', fontFamily: 'Georgia', color: '#aa6090',
      });
      this.add.text(80, y + 71, `Evitar: ${lvl.badItems.join(' ')}`, {
        fontSize: '11px', fontFamily: 'Georgia', color: '#cc6080',
      });

      const pb  = this.add.container(W - 44, y + 44);
      const pbg = this.add.graphics();
      const darkAccent = Math.max(0, lvl.accentNum - 0x202020);
      drawPillBtn(pbg, 52, 36, lvl.accentNum, darkAccent);
      const pt = this.add.text(0, 0, '▶', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);

      pb.add([pbg, pt]);
      pb.setSize(52, 36);
      pb.setInteractive();

      pb.on('pointerdown', () => {
        this.scene.start('Game', { level: i, lives: MAX_LIVES, score: 0, collected: {} });
      });
      pb.on('pointerover', () => {
        this.tweens.add({ targets: pb, scaleX: 1.1, scaleY: 1.1, duration: 100 });
      });
      pb.on('pointerout', () => {
        this.tweens.add({ targets: pb, scaleX: 1, scaleY: 1, duration: 100 });
      });
    });
  }

  _createBackButton() {
    const btn = this.add.container(W / 2, H - 30);
    const bg  = this.add.graphics();
    drawPillBtn(bg, 220, 40, C.lilac, C.lilacDark);

    const txt = this.add.text(0, 0, '← Volver al Menú', {
      fontSize:        '15px',
      fontFamily:      'Georgia',
      color:           '#fff',
      stroke:          '#0003',
      strokeThickness: 2,
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setSize(220, 40);
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
