class StartScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Start' });
  }

  preload() {
    this._buildLoadingScreen();
    this.load.on('progress', this._onProgress,  this);
    this.load.on('complete', this._onComplete,  this);
  }

  create() {
    this.time.delayedCall(800, () => {
      this.scene.start('Menu');
    });
  }

  update() {
    if (this._cakeIcon) {
      this._cakeIcon.angle += 0.4;
    }
  }


  _buildLoadingScreen() {
    drawPastelBg(this, C.bgTop, C.bgBot);

    this._cakeIcon = this.add.text(W / 2, H / 2 - 90, '🎂', {
      fontSize: '72px',
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 10, '¡Atrapa los Ingredientes!', {
      fontSize:        '20px',
      fontFamily:      'Georgia, serif',
      color:           '#e0557a',
      stroke:          '#fff',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const barX = 80, barY = H / 2 + 55, barW = W - 160, barH = 18;

    const barBg = this.add.graphics();
    barBg.fillStyle(0xffffff, 0.5);
    barBg.fillRoundedRect(barX, barY, barW, barH, 9);
    barBg.lineStyle(2, C.pink, 0.8);
    barBg.strokeRoundedRect(barX, barY, barW, barH, 9);

    this._progressBar = this.add.graphics();
    this._barX = barX; this._barY = barY;
    this._barW = barW; this._barH = barH;

    this._pctText = this.add.text(W / 2, barY + barH + 14, 'Cargando… 0%', {
      fontSize:   '13px',
      fontFamily: 'Georgia',
      color:      '#8b4070',
    }).setOrigin(0.5);

    addBubbles(this, 12);
  }

  _onProgress(value) {
    const pct = Math.floor(value * 100);
    this._pctText.setText(`Cargando… ${pct}%`);

    this._progressBar.clear();
    this._progressBar.fillStyle(C.pink, 1);
    this._progressBar.fillRoundedRect(
      this._barX, this._barY,
      this._barW * value, this._barH,
      9
    );
  }

  _onComplete() {
    this._pctText.setText('¡Listo!');
  }
}
