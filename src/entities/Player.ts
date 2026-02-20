import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { AssetFactory } from "../core/AssetFactory";
import { InputManager } from "../core/InputManager";

export class Player {
  readonly mesh: TransformNode;
  private readonly moveSpeed = 10;
  private readonly input: InputManager;
  private targetRotation = 0;

  constructor(scene: Scene, input: InputManager, color: Color3, x: number, z: number) {
    this.input = input;
    this.mesh = AssetFactory.createCharacter(scene, color);
    this.mesh.position = new Vector3(x, 0, z);
  }

  update(dt: number): void {
    const drag = this.input.drag;
    if (drag.active && drag.magnitude > 0.05) {
      const vx = drag.dirX * drag.magnitude * this.moveSpeed * dt;
      const vz = -drag.dirY * drag.magnitude * this.moveSpeed * dt;

      this.mesh.position.x += vx;
      this.mesh.position.z += vz;

      this.targetRotation = Math.atan2(vx, vz);
    }

    // Smooth rotation
    const current = this.mesh.rotation.y;
    let diff = this.targetRotation - current;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.mesh.rotation.y += diff * Math.min(1, dt * 10);
  }

  getPosition(): Vector3 {
    return this.mesh.position;
  }
}
