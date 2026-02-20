import { Engine as BabylonEngine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";

// Side-effect imports for Babylon.js features
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/core/Collisions/collisionCoordinator";

export class Engine {
  readonly engine: BabylonEngine;
  readonly scene: Scene;
  readonly camera: ArcRotateCamera;
  readonly canvas: HTMLCanvasElement;
  readonly shadowGenerator: ShadowGenerator;

  private updateCallbacks: ((dt: number) => void)[] = [];

  constructor(container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.display = "block";
    this.canvas.id = "renderCanvas";
    container.appendChild(this.canvas);

    this.engine = new BabylonEngine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.53, 0.81, 0.92, 1);
    this.scene.ambientColor = new Color3(0.3, 0.3, 0.3);
    this.scene.fogMode = Scene.FOGMODE_LINEAR;
    this.scene.fogColor = new Color3(0.53, 0.81, 0.92);
    this.scene.fogStart = 60;
    this.scene.fogEnd = 150;
    this.scene.collisionsEnabled = true;

    // Third-person follow camera
    this.camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3.5,
      18,
      Vector3.Zero(),
      this.scene
    );
    this.camera.lowerBetaLimit = 0.3;
    this.camera.upperBetaLimit = Math.PI / 2.5;
    this.camera.lowerRadiusLimit = 8;
    this.camera.upperRadiusLimit = 35;
    this.camera.attachControl(this.canvas, false);
    this.camera.inputs.removeByType("ArcRotateCameraPointersInput");

    // Lighting
    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.6;
    hemi.groundColor = new Color3(0.3, 0.35, 0.4);

    const sun = new DirectionalLight("sun", new Vector3(-1, -3, -1).normalize(), this.scene);
    sun.intensity = 0.8;
    sun.position = new Vector3(30, 50, 30);

    this.shadowGenerator = new ShadowGenerator(2048, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 32;

    window.addEventListener("resize", () => this.engine.resize());
  }

  onUpdate(cb: (dt: number) => void): void {
    this.updateCallbacks.push(cb);
  }

  start(): void {
    this.engine.runRenderLoop(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      const cappedDt = Math.min(dt, 1 / 30);

      for (const cb of this.updateCallbacks) {
        cb(cappedDt);
      }

      this.scene.render();
    });
  }

  dispose(): void {
    this.engine.stopRenderLoop();
    this.scene.dispose();
    this.engine.dispose();
    this.canvas.remove();
  }
}
