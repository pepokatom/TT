import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Engine, ViewMode } from "../core/Engine";
import { InputManager } from "../core/InputManager";
import { Player } from "../entities/Player";
import { OpenWorld } from "../world/OpenWorld";

const CAMERA_SENSITIVITY = 0.005;
const FPS_YAW_SENSITIVITY = 0.004;
const FPS_PITCH_SENSITIVITY = 0.003;
const TRANSITION_DURATION = 0.5;

export class OpenWorldScene {
  private engine: Engine;
  private input: InputManager;
  private player!: Player;

  // First-person camera state
  private fpsYaw = 0;
  private fpsPitch = 0;

  // Camera transition state
  private transitionCam!: UniversalCamera;
  private isTransitioning = false;
  private transitionT = 0;
  private transStartPos = Vector3.Zero();
  private transStartTarget = Vector3.Zero();
  private transStartFov = 0.8;
  private transTargetMode: ViewMode = "third";

  // UI
  private viewToggleBtn!: HTMLButtonElement;

  constructor(engine: Engine, input: InputManager) {
    this.engine = engine;
    this.input = input;
  }

  init(): void {
    const scene = this.engine.scene;

    new OpenWorld(scene, this.engine.shadowGenerator);

    this.player = new Player(
      scene,
      this.input,
      new Color3(0.2, 0.6, 0.85),
      0, 8
    );

    this.player.mesh.getChildMeshes().forEach((m) => {
      this.engine.shadowGenerator.addShadowCaster(m);
    });

    // Transition camera (used during view switch animation)
    this.transitionCam = new UniversalCamera("transCam", Vector3.Zero(), this.engine.scene);
    this.transitionCam.minZ = 0.1;
    this.transitionCam.inputs.clear();

    this.createUI();

    this.engine.onUpdate((dt) => this.update(dt));
  }

  private createUI(): void {
    // View toggle button (bottom-right)
    this.viewToggleBtn = document.createElement("button");
    this.viewToggleBtn.textContent = "1P";
    this.viewToggleBtn.style.cssText =
      "position:fixed;right:24px;bottom:24px;width:56px;height:56px;" +
      "border-radius:50%;border:2px solid rgba(255,255,255,0.25);" +
      "background:rgba(0,0,0,0.4);color:#fff;font-size:16px;font-weight:bold;" +
      "cursor:pointer;z-index:25;-webkit-tap-highlight-color:transparent;" +
      "display:flex;align-items:center;justify-content:center;" +
      "backdrop-filter:blur(4px);transition:background 0.15s;";
    this.viewToggleBtn.addEventListener("click", () => this.toggleView());
    // Prevent touch events on button from propagating to canvas
    this.viewToggleBtn.addEventListener("touchstart", (e) => e.stopPropagation());
    document.body.appendChild(this.viewToggleBtn);
  }

  private toggleView(): void {
    if (this.isTransitioning) return;

    const next: ViewMode = this.engine.viewMode === "third" ? "first" : "third";

    // Capture start position / target from current camera
    if (this.engine.viewMode === "third") {
      const cam = this.engine.thirdPersonCam;
      this.transStartPos.copyFrom(cam.position);
      this.transStartTarget.copyFrom(cam.target);
      this.transStartFov = cam.fov;
    } else {
      const cam = this.engine.firstPersonCam;
      this.transStartPos.copyFrom(cam.position);
      this.transStartTarget.copyFrom(cam.getTarget());
      this.transStartFov = cam.fov;
    }

    // Prepare target mode parameters
    if (next === "first") {
      this.fpsYaw = this.player.mesh.rotation.y;
      this.fpsPitch = 0;
    } else {
      this.player.mesh.setEnabled(true);
      this.engine.thirdPersonCam.alpha = -this.fpsYaw - Math.PI / 2;
    }

    // Activate transition camera at current position
    this.transitionCam.position.copyFrom(this.transStartPos);
    this.transitionCam.setTarget(this.transStartTarget);
    this.transitionCam.fov = this.transStartFov;
    this.engine.scene.activeCamera = this.transitionCam;

    // Start transition
    this.isTransitioning = true;
    this.transitionT = 0;
    this.transTargetMode = next;

    this.viewToggleBtn.textContent = next === "first" ? "3P" : "1P";
  }

  private update(dt: number): void {
    // During transition, keep using old viewMode for player controls
    this.player.update(dt, this.engine.viewMode, this.fpsYaw);

    const camDelta = this.input.consumeCameraDelta();
    const pos = this.player.getPosition();

    if (this.isTransitioning) {
      this.updateTransition(dt, pos);
      return;
    }

    if (this.engine.viewMode === "third") {
      this.updateThirdPerson(camDelta, pos);
    } else {
      this.updateFirstPerson(camDelta, pos);
    }
  }

  /* ---- Camera transition ---- */

  private updateTransition(dt: number, pos: Vector3): void {
    this.transitionT += dt / TRANSITION_DURATION;

    if (this.transitionT >= 1) {
      this.finishTransition();
      return;
    }

    // Smoothstep easing
    const t = this.transitionT;
    const ease = t * t * (3 - 2 * t);

    // Compute destination that tracks the player's current position
    const { endPos, endTarget, endFov } = this.computeTransitionEnd(pos);

    // Interpolate position, target, FOV
    const cam = this.transitionCam;
    Vector3.LerpToRef(this.transStartPos, endPos, ease, cam.position);
    const lerpTarget = Vector3.Lerp(this.transStartTarget, endTarget, ease);
    cam.setTarget(lerpTarget);
    cam.fov = this.transStartFov + (endFov - this.transStartFov) * ease;

    // Hide player mesh near end when going to first-person
    if (this.transTargetMode === "first" && ease > 0.75) {
      this.player.mesh.setEnabled(false);
    }
  }

  private computeTransitionEnd(pos: Vector3): { endPos: Vector3; endTarget: Vector3; endFov: number } {
    if (this.transTargetMode === "first") {
      const headPos = new Vector3(pos.x, 1.4, pos.z);
      const lookX = Math.sin(this.fpsYaw) * Math.cos(this.fpsPitch);
      const lookY = Math.sin(this.fpsPitch);
      const lookZ = Math.cos(this.fpsYaw) * Math.cos(this.fpsPitch);
      return {
        endPos: headPos,
        endTarget: new Vector3(pos.x + lookX, 1.4 + lookY, pos.z + lookZ),
        endFov: this.engine.firstPersonCam.fov,
      };
    } else {
      const cam = this.engine.thirdPersonCam;
      const target = new Vector3(pos.x, 1, pos.z);
      cam.target.copyFrom(target);
      const endPos = new Vector3(
        target.x + cam.radius * Math.cos(cam.alpha) * Math.sin(cam.beta),
        target.y + cam.radius * Math.cos(cam.beta),
        target.z + cam.radius * Math.sin(cam.alpha) * Math.sin(cam.beta),
      );
      return { endPos, endTarget: target, endFov: cam.fov };
    }
  }

  private finishTransition(): void {
    this.isTransitioning = false;
    this.engine.setViewMode(this.transTargetMode);

    if (this.transTargetMode === "first") {
      this.player.mesh.setEnabled(false);
    }
  }

  private updateThirdPerson(camDelta: { dx: number; dy: number }, pos: Vector3): void {
    const cam = this.engine.thirdPersonCam;

    // Camera rotation from drag
    if (camDelta.dx !== 0 || camDelta.dy !== 0) {
      cam.alpha -= camDelta.dx * CAMERA_SENSITIVITY;
      cam.beta -= camDelta.dy * CAMERA_SENSITIVITY;
      // Clamp beta
      cam.beta = Math.max(cam.lowerBetaLimit ?? 0.3, Math.min(cam.upperBetaLimit ?? Math.PI / 2.5, cam.beta));
    }

    cam.target.set(pos.x, 1, pos.z);
  }

  private updateFirstPerson(camDelta: { dx: number; dy: number }, pos: Vector3): void {
    const cam = this.engine.firstPersonCam;

    // Rotate camera from drag
    if (camDelta.dx !== 0 || camDelta.dy !== 0) {
      this.fpsYaw -= camDelta.dx * FPS_YAW_SENSITIVITY;
      this.fpsPitch -= camDelta.dy * FPS_PITCH_SENSITIVITY;
      // Clamp pitch
      this.fpsPitch = Math.max(-1.2, Math.min(1.2, this.fpsPitch));
    }

    // Position camera at player head
    cam.position.set(pos.x, 1.4, pos.z);

    // Look direction from yaw + pitch
    const lookX = Math.sin(this.fpsYaw) * Math.cos(this.fpsPitch);
    const lookY = Math.sin(this.fpsPitch);
    const lookZ = Math.cos(this.fpsYaw) * Math.cos(this.fpsPitch);
    cam.setTarget(new Vector3(
      pos.x + lookX,
      1.4 + lookY,
      pos.z + lookZ
    ));
  }
}
