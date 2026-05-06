

const config = {
  type:            Phaser.AUTO,
  width:           W,
  height:          H,
  parent:          'game-container',
  backgroundColor: '#ffeaf4',
  scene: [
    StartScene,        
    MenuScene,
    InstructionsScene,
    LevelsScene,
    GameScene,
    GameOverScene,
  ],
  input: {
    keyboard: true,
    mouse:    true,
    touch:    true,
  },
};

const game = new Phaser.Game(config);
