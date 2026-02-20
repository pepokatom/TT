import { Engine } from "../core/Engine";
import { InputManager } from "../core/InputManager";
import { Player } from "../entities/Player";
import { OpenWorld } from "../world/OpenWorld";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export class OpenWorldScene {
  private engine: Engine;
  private input: InputManager;
  private player!: Player;

  constructor(engine: Engine, input: InputManager) {
    this.engine = engine;
    this.input = input;
  }

  init(): void {
    const scene = this.engine.scene;

    // Build the open world
    new OpenWorld(scene, this.engine.shadowGenerator);

    // Player spawns at center
    this.player = new Player(
      scene,
      this.input,
      new Color3(0.2, 0.6, 0.85),
      0, 8
    );

    // Add player to shadow casters
    this.player.mesh.getChildMeshes().forEach((m) => {
      this.engine.shadowGenerator.addShadowCaster(m);
    });

    // Game loop
    this.engine.onUpdate((dt) => this.update(dt));
  }

  private update(dt: number): void {
    this.player.update(dt);

    // Camera follows player
    const pos = this.player.getPosition();
    this.engine.camera.target.set(pos.x, 1, pos.z);
  }
}
