class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'Game' });
  }

  init(data) {
    this.currentLevel       = data.level     || 0;
    this.lives              = data.lives     !== undefined ? data.lives : MAX_LIVES;
    this.totalScore         = data.score     || 0;
    this.collectedPerLevel  = data.collected || {};

    this.levelScore         = 0;
    this.timeLeft           = LEVELS[this.currentLevel].time;
    this.gameOver           = false;
    this.paused             = false;
    this.fallingObjects     = [];

    this.levelData = LEVELS[this.currentLevel];
  }

  preload() {
  }

  create() {
    this._createBackground();
    this._createPlayer();
    this._createHUD();
    this._createSpawnTimer();
    this._createCountdownTimer();
    this._setupInput();
    this._showLevelIntro();
  }

  update(time, delta) {
    if (this.gameOver || this.paused) return;

    const dt = delta / 1000; 

    if (this.cursors.left.isDown) {
      this.playerX = Math.max(this.playerW / 2, this.playerX - 320 * dt);
    }
    if (this.cursors.right.isDown) {
      this.playerX = Math.min(W - this.playerW / 2, this.playerX + 320 * dt);
    }

    this._drawPlayer();

    const toRemove = [];

    this.fallingObjects.forEach(obj => {
      obj.y           += obj.speedY * dt;
      if (obj.bubble) obj.bubble.y = obj.y;

      const inVerticalRange   = obj.y >= this.playerY - 22 && obj.y <= this.playerY + 22;
      const inHorizontalRange = Math.abs(obj.x - this.playerX) < this.playerW / 2 + 12;

      if (inVerticalRange && inHorizontalRange) {
        obj.isIngredient ? this._catchGood(obj) : this._catchBad(obj);
        toRemove.push(obj);
        return;
      }

      if (obj.y > H + 50) toRemove.push(obj);
    });

    toRemove.forEach(obj => this._destroyFallingObj(obj));
  }


  _createBackground() {
    drawPastelBg(this, 0xffeaf4, 0xf0d8f8);
    addBubbles(this, 10);

    const g = this.add.graphics();

    for (let col = 0; col < 12; col++) {
      for (let row = 0; row < 2; row++) {
        g.fillStyle((col + row) % 2 === 0 ? 0xffffff : 0xffe0f0, 0.48);
        g.fillRect(col * 40, 62 + row * 20, 40, 20);
      }
    }

    drawKitchenFloor(this, H - 72);

    for (let i = 0; i < 18; i++) {
      this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(105, H - 80),
        Phaser.Math.Between(3, 8),
        Phaser.Utils.Array.GetRandom([0xffd6e8, 0xe8d5f5, 0xd5eaf5]),
        0.36
      );
    }
  }

  _createPlayer() {
    this.playerG = this.add.graphics();
    this.playerX = W / 2;
    this.playerY = H - 46;
    this.playerW = 76;
    this._drawPlayer();
  }

  _drawPlayer(flash) {
    this.playerG.clear();

    const bodyColor = flash === 'good' ? C.mint   : flash === 'bad' ? 0xff8888 : C.sky;
    const rimColor  = flash === 'good' ? C.mintDark : flash === 'bad' ? 0xe04040 : C.skyDark;

    this.playerG.fillStyle(0x000000, 0.09);
    this.playerG.fillEllipse(this.playerX + 4, this.playerY + 14, this.playerW, 16);

    this.playerG.fillStyle(bodyColor, 1);
    this.playerG.fillEllipse(this.playerX, this.playerY + 4, this.playerW, 38);

    this.playerG.fillStyle(0xffffff, 0.28);
    this.playerG.fillEllipse(
      this.playerX - this.playerW * 0.12,
      this.playerY - 4,
      this.playerW * 0.54, 13
    );

    this.playerG.lineStyle(3.5, rimColor, 1);
    this.playerG.strokeEllipse(this.playerX, this.playerY + 4, this.playerW, 38);

    this.playerG.fillStyle(rimColor, 1);
    this.playerG.fillRoundedRect(this.playerX - this.playerW / 2 - 10, this.playerY,      10, 18, 4);
    this.playerG.fillRoundedRect(this.playerX + this.playerW / 2,       this.playerY,      10, 18, 4);

    [-22, 0, 22].forEach(dx => {
      this.playerG.fillStyle(0xffffff, 0.55);
      this.playerG.fillCircle(this.playerX + dx, this.playerY + 4, 2.8);
    });
  }

  _createHUD() {
    const hg = this.add.graphics();
    hg.fillStyle(0xffffff, 0.72);
    hg.fillRoundedRect(0, 0, W, 62, 0);
    hg.lineStyle(2, C.pink, 0.6);
    hg.lineBetween(0, 62, W, 62);

    this.hudLives = this.add.text(12, 8,  '', { fontSize: '19px' }).setDepth(10);
    this.hudGoal  = this.add.text(W / 2, 8,  '', {
      fontSize: '13px', fontFamily: 'Georgia',
      color: '#7a3060', align: 'center',
    }).setOrigin(0.5, 0).setDepth(10);
    this.hudTime  = this.add.text(W - 12, 8,  '', {
      fontSize: '15px', fontFamily: 'Georgia',
      color: '#c0407a', align: 'right',
    }).setOrigin(1, 0).setDepth(10);
    this.hudScore = this.add.text(W - 12, 30, '', {
      fontSize: '12px', fontFamily: 'Georgia',
      color: '#9060b0', align: 'right',
    }).setOrigin(1, 0).setDepth(10);

    this._updateHUD();
  }

  _updateHUD() {
    const lv = this.levelData;

    let hearts = '';
    for (let i = 0; i < MAX_LIVES; i++) hearts += i < this.lives ? '❤️' : '🤍';
    this.hudLives.setText(hearts);

    this.hudGoal.setText(`${lv.ingredient} ${this.levelScore} / ${lv.goal}  ${lv.ingredientName}`);

    const t = Math.ceil(this.timeLeft);
    this.hudTime.setText(`⏱ ${t}s`);
    if (t <= 10) this.hudTime.setColor('#e03060');

    this.hudScore.setText(` ${this.totalScore + this.levelScore} pts`);
  }

  _createSpawnTimer() {
    this.spawnTimer = this.time.addEvent({
      delay:         this.levelData.spawnRate,
      callback:      this._spawnObject,
      callbackScope: this,
      loop:          true,
    });
  }

  _createCountdownTimer() {
    this.countdownEvent = this.time.addEvent({
      delay: 250,  
      callback: () => {
        if (this.paused || this.gameOver) return;
        this.timeLeft -= 0.25;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this._updateHUD();
          this._endLevel(false);       
        } else {
          this._updateHUD();
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  _setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointermove', p => {
      if (p.isDown && !this.gameOver && !this.paused) {
        this.playerX = Phaser.Math.Clamp(p.x, this.playerW / 2, W - this.playerW / 2);
      }
    });

    this.input.on('pointerdown', p => {
      if (!this.gameOver && !this.paused) {
        this.playerX = Phaser.Math.Clamp(p.x, this.playerW / 2, W - this.playerW / 2);
      }
    });
  }


  _spawnObject() {
    if (this.gameOver || this.paused) return;

    const lv          = this.levelData;
    const isIngredient = Math.random() < 0.45;
    const x           = Phaser.Math.Between(30, W - 30);
    const emoji       = isIngredient
      ? lv.ingredient
      : Phaser.Utils.Array.GetRandom(lv.badItems);

    const bubble = this.add.circle(x, -30, 22, isIngredient ? C.mint : 0xffaaaa, 0.32);

    const obj = this.add.text(x, -30, emoji, {
      fontSize:        `${isIngredient ? 28 : 24}px`,
      stroke:          '#fff8',
      strokeThickness: 1,
      shadow:          { offsetX: 1, offsetY: 1, color: '#ff80b0', blur: 3, fill: true },
    }).setOrigin(0.5);

    obj.isIngredient = isIngredient;
    obj.speedY       = lv.speed + Phaser.Math.Between(-30, 30);
    obj.bubble       = bubble;

    const dir = Math.random() < 0.5 ? 1 : -1;
    this.tweens.add({
      targets:  [obj, bubble],
      x:        x + dir * 18,
      duration: 520 + Math.random() * 380,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    this.fallingObjects.push(obj);
  }

  _catchGood(obj) {
    this.levelScore++;
    this.totalScore += 2;
    this._showFloat(obj.x, obj.y, '+1 🎉', '#ff8fb8');
    this._drawPlayer('good');
    this.time.delayedCall(160, () => this._drawPlayer());
    this.cameras.main.flash(70, 255, 180, 200);
    this._updateHUD();

    if (this.levelScore >= this.levelData.goal) {
      this._endLevel(true);
    }
  }

  _catchBad(obj) {
    this.lives--;
    this._showFloat(obj.x, obj.y, '-1 💔', '#ff4466');
    this._drawPlayer('bad');
    this.cameras.main.shake(220, 0.009);
    this.time.delayedCall(320, () => this._drawPlayer());
    this._updateHUD();

    if (this.lives <= 0) {
      this.lives = 0;
      this._updateHUD();
      this._endLevel(false, true);
    }
  }

  _showFloat(x, y, msg, color) {
    const t = this.add.text(x, y, msg, {
      fontSize:        '16px',
      fontFamily:      'Georgia',
      color,
      stroke:          '#fff',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets:    t,
      y:          y - 64,
      alpha:      0,
      duration:   950,
      ease:       'Power2',
      onComplete: () => t.destroy(),
    });
  }

  _destroyFallingObj(obj) {
    const idx = this.fallingObjects.indexOf(obj);
    if (idx > -1) this.fallingObjects.splice(idx, 1);
    this.tweens.killTweensOf(obj);
    if (obj.bubble) {
      this.tweens.killTweensOf(obj.bubble);
      obj.bubble.destroy();
    }
    obj.destroy();
  }

  _endLevel(success, noLives = false) {
    if (this.gameOver) return;
    this.gameOver = true;

    this.spawnTimer.remove();
    this.countdownEvent.remove();

    this.fallingObjects.forEach(o => this._destroyFallingObj(o));
    this.fallingObjects = [];

    this.collectedPerLevel[this.currentLevel] = {
      got:     this.levelScore,
      goal:    this.levelData.goal,
      success,
    };

    this.time.delayedCall(400, () => {
      if (noLives) {
        this.scene.start('GameOver', {
          collected: this.collectedPerLevel,
          score:     this.totalScore,
          reason:    'lives',
        });
      } else if (success) {
        if (this.currentLevel >= LEVELS.length - 1) {
          this.scene.start('GameOver', {
            collected: this.collectedPerLevel,
            score:     this.totalScore,
            reason:    'win',
          });
        } else {
          this._showLevelComplete();
        }
      } else {
        this.scene.start('GameOver', {
          collected: this.collectedPerLevel,
          score:     this.totalScore,
          reason:    'time',
        });
      }
    });
  }


  _showLevelIntro() {
    this.paused = true;
    const lv = this.levelData;

    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.4);
    ov.fillRect(0, 0, W, H);

    const panel = this.add.graphics();
    panel.fillStyle(lv.panelNum, 0.97);
    panel.fillRoundedRect(30, 155, W - 60, 330, 24);
    panel.lineStyle(3, lv.accentNum, 1);
    panel.strokeRoundedRect(30, 155, W - 60, 330, 24);
    panel.fillStyle(0xffffff, 0.24);
    panel.fillRoundedRect(30, 155, W - 60, 50, { tl: 24, tr: 24, bl: 0, br: 0 });

    const elems = [
      this.add.text(W/2, 180, lv.name, {
        fontSize:'17px', fontFamily:'Georgia', color:'#6b2d5e', stroke:'#fff', strokeThickness:2,
      }).setOrigin(0.5),
      this.add.text(W/2, 252, lv.ingredient, { fontSize:'58px' }).setOrigin(0.5),
      this.add.text(W/2, 318, ` Meta: ${lv.goal} ${lv.ingredientName}s`, {
        fontSize:'16px', fontFamily:'Georgia', color:'#8b4070',
      }).setOrigin(0.5),
      this.add.text(W/2, 350, `⏱ Tiempo: ${lv.time} segundos`, {
        fontSize:'14px', fontFamily:'Georgia', color:'#aa6090',
      }).setOrigin(0.5),
      this.add.text(W/2, 378, `🚫 Evita: ${lv.badItems.join(' ')}`, {
        fontSize:'14px', fontFamily:'Georgia', color:'#cc5078',
      }).setOrigin(0.5),
    ];

    const startBtn = this.add.container(W / 2, 440);
    const sbg = this.add.graphics();
    const darkAccent = Math.max(0, lv.accentNum - 0x202020);
    drawPillBtn(sbg, 204, 48, lv.accentNum, darkAccent);
    const stxt = this.add.text(0, 0, '¡A hornear!', {
      fontSize: '18px', fontFamily: 'Georgia', color: '#fff', stroke: '#0003', strokeThickness: 2,
    }).setOrigin(0.5);
    startBtn.add([sbg, stxt]);
    startBtn.setSize(204, 48);
    startBtn.setInteractive();

    startBtn.on('pointerdown', () => {
      [ov, panel, startBtn, ...elems].forEach(e => e.destroy());
      this.paused = false;
    });
    startBtn.on('pointerover', () => {
      this.tweens.add({ targets: startBtn, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    startBtn.on('pointerout', () => {
      this.tweens.add({ targets: startBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }

  _showLevelComplete() {
    const ov = this.add.graphics();
    ov.fillStyle(0x000000, 0.5);
    ov.fillRect(0, 0, W, H);

    const panel = this.add.graphics();
    panel.fillStyle(C.pinkLight, 0.97);
    panel.fillRoundedRect(40, 170, W - 80, 300, 22);
    panel.lineStyle(3, C.pink, 1);
    panel.strokeRoundedRect(40, 170, W - 80, 300, 22);
    panel.fillStyle(0xffffff, 0.25);
    panel.fillRoundedRect(40, 170, W - 80, 46, { tl: 22, tr: 22, bl: 0, br: 0 });

    this.add.text(W/2, 192, ' ¡NIVEL COMPLETADO!', {
      fontSize:'20px', fontFamily:'Georgia', color:'#e0557a', stroke:'#fff', strokeThickness:2,
    }).setOrigin(0.5);
    this.add.text(W/2, 256, this.levelData.ingredient, { fontSize:'52px' }).setOrigin(0.5);
    this.add.text(W/2, 316, `${this.levelScore}/${this.levelData.goal} ${this.levelData.ingredientName}s`, {
      fontSize:'17px', fontFamily:'Georgia', color:'#7a3060',
    }).setOrigin(0.5);
    this.add.text(W/2, 346, ` ${this.totalScore} puntos totales`, {
      fontSize:'14px', fontFamily:'Georgia', color:'#aa60a0',
    }).setOrigin(0.5);

    const nb  = this.add.container(W / 2, 418);
    const nbg = this.add.graphics();
    drawPillBtn(nbg, 220, 50, C.pink, C.pinkDark);
    const nt = this.add.text(0, 0, 'Siguiente Nivel →', {
      fontSize:'18px', fontFamily:'Georgia', color:'#fff', stroke:'#c04070', strokeThickness:2,
    }).setOrigin(0.5);
    nb.add([nbg, nt]);
    nb.setSize(220, 50);
    nb.setInteractive();

    nb.on('pointerdown', () => {
      this.scene.start('Game', {
        level:     this.currentLevel + 1,
        lives:     this.lives,
        score:     this.totalScore,
        collected: this.collectedPerLevel,
      });
    });
    nb.on('pointerover', () => {
      this.tweens.add({ targets: nb, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    nb.on('pointerout', () => {
      this.tweens.add({ targets: nb, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }
}
