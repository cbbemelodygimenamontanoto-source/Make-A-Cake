class GameOverScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data) {
    this.collected = data.collected || {};
    this.score     = data.score     || 0;
    this.reason    = data.reason    || 'time';
  }

  preload() {
  }

  create() {
    drawPastelBg(this, C.bgTop, C.bgBot);
    addBubbles(this, 16);

    this._computeResult();
    this._buildHeader();
    this._buildCakeDisplay();
    this._buildBreakdownPanel();
    this._buildScorePanel();
    this._buildButtons();

    if (this.result.stars >= 4 || this.reason === 'win') {
      this._confettiTimer = this.time.addEvent({
        delay:         110,
        callback:      this._spawnConfetti,
        callbackScope: this,
        loop:          true,
      });
    }
  }

  update() {
  }


  _computeResult() {
    let totalGoal = 0, totalGot = 0;

    for (let i = 0; i < LEVELS.length; i++) {
      totalGoal += LEVELS[i].goal;
      const c    = this.collected[i];
      if (c) totalGot += c.got;
    }

    const pct = totalGoal > 0 ? totalGot / totalGoal : 0;

    if (this.reason === 'win' || pct >= 0.95) {
      this.result = {
        emoji:  '✨🎂✨',
        rating: '¡EXCELENTE!',
        desc:   '¡El pastel más hermoso del universo!',
        color:  '#ff8fb8',
        stars:  5,
      };
    } else if (pct >= 0.75) {
      this.result = {
        emoji:  '🎂',
        rating: 'MUY BUENO',
        desc:   '¡Quedó delicioso! Casi perfecto.',
        color:  '#c9a8e8',
        stars:  4,
      };
    } else if (pct >= 0.55) {
      this.result = {
        emoji:  '🍰',
        rating: 'BUENO',
        desc:   'No está mal, ¡se puede comer!',
        color:  '#a8d8f0',
        stars:  3,
      };
    } else if (pct >= 0.30) {
      this.result = {
        emoji:  '😐🍰',
        rating: 'REGULAR',
        desc:   'Le faltaron bastantes ingredientes…',
        color:  '#ffcba4',
        stars:  2,
      };
    } else {
      this.result = {
        emoji:  '💀🎂',
        rating: 'MALO',
        desc:   '¡Nadie se lo comería! Inténtalo de nuevo.',
        color:  '#ff8888',
        stars:  1,
      };
    }
  }

  _buildHeader() {
    const hg = this.add.graphics();
    hg.fillStyle(C.pink, 1);
    hg.fillRoundedRect(0, 0, W, 64, 0);
    hg.fillStyle(0xffffff, 0.2);
    hg.fillRect(0, 0, W, 26);

    const reasonText = {
      lives: '💔 ¡Sin vidas!',
      win:   ' ¡Juego Completado!',
      time:  '⏱ ¡Tiempo Agotado!',
    }[this.reason] || '⏱ ¡Tiempo Agotado!';

    this.add.text(W / 2, 32, reasonText, {
      fontSize:        '19px',
      fontFamily:      'Georgia',
      color:           '#fff',
      stroke:          '#e0557a',
      strokeThickness: 2,
    }).setOrigin(0.5);
  }

  _buildCakeDisplay() {
    const r = this.result;

    const cake = this.add.text(W / 2, 118, r.emoji, { fontSize: '58px' })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.3);

    this.tweens.add({
      targets:  cake,
      alpha:    1,
      scaleX:   1,
      scaleY:   1,
      duration: 600,
      ease:     'Back.easeOut',
    });

    const ratingText = this.add.text(W / 2, 188, r.rating, {
      fontSize:        '30px',
      fontFamily:      'Georgia',
      color:           r.color,
      stroke:          '#fff',
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets:  ratingText,
      alpha:    1,
      y:        183,
      duration: 500,
      delay:    360,
    });

    const starsStr = '⭐'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
    const starsText = this.add.text(W / 2, 220, starsStr, { fontSize: '24px' })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: starsText, alpha: 1, duration: 400, delay: 550 });

    this.add.text(W / 2, 254, r.desc, {
      fontSize:   '13px',
      fontFamily: 'Georgia',
      color:      '#7a3060',
      align:      'center',
      wordWrap:   { width: W - 60 },
    }).setOrigin(0.5);
  }

  _buildBreakdownPanel() {
    const bp = this.add.graphics();
    bp.fillStyle(0xffffff, 0.62);
    bp.fillRoundedRect(18, 272, W - 36, 178, 16);
    bp.lineStyle(2, C.pink, 0.45);
    bp.strokeRoundedRect(18, 272, W - 36, 178, 16);

    this.add.text(W / 2, 286, '🧁 Ingredientes recolectados', {
      fontSize:   '13px',
      fontFamily: 'Georgia',
      color:      '#8b4070',
    }).setOrigin(0.5);

    const barW = 148;

    LEVELS.forEach((lv, i) => {
      const c      = this.collected[i];
      const got    = c ? c.got : 0;
      const goal   = lv.goal;
      const y      = 305 + i * 27;
      const filled = Math.min(barW * (got / goal), barW);
      const ok     = got >= goal;

      const bgBar = this.add.graphics();
      bgBar.fillStyle(0xf0d8f0, 1);
      bgBar.fillRoundedRect(W / 2 - barW / 2, y + 2, barW, 13, 4);

      const fgBar = this.add.graphics();
      fgBar.fillStyle(ok ? C.mint : C.peach, 1);
      fgBar.fillRoundedRect(W / 2 - barW / 2, y + 2, filled, 13, 4);
      fgBar.lineStyle(1, ok ? C.mintDark : C.peachDark, 0.5);
      fgBar.strokeRoundedRect(W / 2 - barW / 2, y + 2, barW, 13, 4);

      this.add.text(W / 2 - barW / 2 - 8, y + 9, lv.ingredient, { fontSize: '14px' }).setOrigin(1, 0.5);

      this.add.text(W / 2 + barW / 2 + 8, y + 9, `${got}/${goal}`, {
        fontSize:   '11px',
        fontFamily: 'Georgia',
        color:      ok ? '#3d9e6e' : '#cc8040',
      }).setOrigin(0, 0.5);
    });
  }

  _buildScorePanel() {
    const sp = this.add.graphics();
    sp.fillStyle(C.pinkLight, 0.9);
    sp.fillRoundedRect(60, 458, W - 120, 44, 14);
    sp.lineStyle(2, C.pink, 0.8);
    sp.strokeRoundedRect(60, 458, W - 120, 44, 14);

    this.add.text(W / 2, 480, `✨ Puntuación Final: ${this.score} pts`, {
      fontSize:   '15px',
      fontFamily: 'Georgia',
      color:      '#8b3070',
    }).setOrigin(0.5);
  }

  _buildButtons() {
    const br  = this.add.container(W / 2 - 74, 534);
    const brg = this.add.graphics();
    drawPillBtn(brg, 132, 44, C.pink, C.pinkDark);
    const brt = this.add.text(0, 0, '🔄 Reintentar', {
      fontSize: '13px', fontFamily: 'Georgia', color: '#fff',
      stroke: '#c04070', strokeThickness: 2,
    }).setOrigin(0.5);
    br.add([brg, brt]);
    br.setSize(132, 44);
    br.setInteractive();
    br.on('pointerdown', () => {
      this.scene.start('Game', { level: 0, lives: MAX_LIVES, score: 0, collected: {} });
    });
    br.on('pointerover', () => { this.tweens.add({ targets: br, scaleX: 1.07, scaleY: 1.07, duration: 100 }); });
    br.on('pointerout',  () => { this.tweens.add({ targets: br, scaleX: 1,    scaleY: 1,    duration: 100 }); });

    const bm  = this.add.container(W / 2 + 74, 534);
    const bmg = this.add.graphics();
    drawPillBtn(bmg, 132, 44, C.lilac, C.lilacDark);
    const bmt = this.add.text(0, 0, ' Menú', {
      fontSize: '13px', fontFamily: 'Georgia', color: '#fff',
      stroke: '#7a4aaf', strokeThickness: 2,
    }).setOrigin(0.5);
    bm.add([bmg, bmt]);
    bm.setSize(132, 44);
    bm.setInteractive();
    bm.on('pointerdown', () => this.scene.start('Menu'));
    bm.on('pointerover', () => { this.tweens.add({ targets: bm, scaleX: 1.07, scaleY: 1.07, duration: 100 }); });
    bm.on('pointerout',  () => { this.tweens.add({ targets: bm, scaleX: 1,    scaleY: 1,    duration: 100 }); });

    const cakeRow = ['🎂', '🎂', '🍰', '😐🍰', '💀🎂'];
    this.add.text(W / 2, 594, cakeRow[5 - this.result.stars], { fontSize: '24px' }).setOrigin(0.5);
  }


}
