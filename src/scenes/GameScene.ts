import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private logo!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    const { width, height } = this.scale;

    // 背景のグラデーション風パーティクル
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, 0xffffff, 0.5);
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.8 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
      });
    }

    // ロゴ（グラフィックスで描画）
    this.logo = this.add.graphics();
    this.logo.fillStyle(0xe94560, 1);
    this.logo.fillRoundedRect(width / 2 - 40, height / 3 - 40, 80, 80, 16);
    this.logo.fillStyle(0x0f3460, 1);
    this.logo.fillTriangle(
      width / 2 - 15, height / 3 - 20,
      width / 2 - 15, height / 3 + 20,
      width / 2 + 20, height / 3
    );

    // タイトル
    this.titleText = this.add.text(width / 2, height / 2 + 20, "TT GAME", {
      fontFamily: "monospace",
      fontSize: "36px",
      color: "#e94560",
      fontStyle: "bold",
    });
    this.titleText.setOrigin(0.5);

    // サブタイトル
    const subText = this.add.text(width / 2, height / 2 + 60, "Tap to Start", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#ffffff",
    });
    subText.setOrigin(0.5);
    this.tweens.add({
      targets: subText,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // テック情報
    this.add
      .text(width / 2, height - 40, "Phaser 3 + TypeScript + Capacitor", {
        fontFamily: "monospace",
        fontSize: "10px",
        color: "#666666",
      })
      .setOrigin(0.5);

    // タップイベント
    this.input.on("pointerdown", () => {
      this.titleText.setText("Ready!");
      this.time.delayedCall(500, () => {
        this.titleText.setText("TT GAME");
      });
    });
  }
}
