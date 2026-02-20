import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

function mat(scene: Scene, r: number, g: number, b: number): StandardMaterial {
  const m = new StandardMaterial("m" + Math.random().toString(36).slice(2), scene);
  m.diffuseColor = new Color3(r, g, b);
  return m;
}

export class AssetFactory {
  /** Box-style humanoid character */
  static createCharacter(scene: Scene, color: Color3): TransformNode {
    const root = new TransformNode("character", scene);

    const bodyMat = mat(scene, color.r, color.g, color.b);
    const skinMat = mat(scene, 1, 0.8, 0.6);
    const legMat = mat(scene, 0.27, 0.27, 0.4);

    const body = CreateBox("body", { width: 0.5, height: 0.7, depth: 0.3 }, scene);
    body.material = bodyMat;
    body.position.y = 0.75;
    body.parent = root;

    const head = CreateBox("head", { width: 0.35, height: 0.35, depth: 0.35 }, scene);
    head.material = skinMat;
    head.position.y = 1.3;
    head.parent = root;

    const eyeMat = mat(scene, 0.13, 0.13, 0.13);
    const leftEye = CreateSphere("leye", { diameter: 0.08, segments: 8 }, scene);
    leftEye.material = eyeMat;
    leftEye.position.set(-0.08, 1.35, 0.18);
    leftEye.parent = root;
    const rightEye = CreateSphere("reye", { diameter: 0.08, segments: 8 }, scene);
    rightEye.material = eyeMat;
    rightEye.position.set(0.08, 1.35, 0.18);
    rightEye.parent = root;

    const leftLeg = CreateBox("lleg", { width: 0.15, height: 0.4, depth: 0.2 }, scene);
    leftLeg.material = legMat;
    leftLeg.position.set(-0.13, 0.2, 0);
    leftLeg.parent = root;
    const rightLeg = CreateBox("rleg", { width: 0.15, height: 0.4, depth: 0.2 }, scene);
    rightLeg.material = legMat;
    rightLeg.position.set(0.13, 0.2, 0);
    rightLeg.parent = root;

    const leftArm = CreateBox("larm", { width: 0.12, height: 0.5, depth: 0.15 }, scene);
    leftArm.material = bodyMat;
    leftArm.position.set(-0.37, 0.75, 0);
    leftArm.parent = root;
    const rightArm = CreateBox("rarm", { width: 0.12, height: 0.5, depth: 0.15 }, scene);
    rightArm.material = bodyMat;
    rightArm.position.set(0.37, 0.75, 0);
    rightArm.parent = root;

    return root;
  }

  /** Simple house with walls and roof */
  static createHouse(scene: Scene, w: number, h: number, d: number, wallColor: Color3, roofColor: Color3): TransformNode {
    const root = new TransformNode("house", scene);

    const wallMat = mat(scene, wallColor.r, wallColor.g, wallColor.b);
    const roofMat = mat(scene, roofColor.r, roofColor.g, roofColor.b);

    const walls = CreateBox("walls", { width: w, height: h, depth: d }, scene);
    walls.material = wallMat;
    walls.position.y = h / 2;
    walls.parent = root;
    walls.receiveShadows = true;
    walls.checkCollisions = true;

    // Stepped roof
    const roof = CreateBox("roof", { width: w + 0.6, height: 0.3, depth: d + 0.6 }, scene);
    roof.material = roofMat;
    roof.position.y = h + 0.15;
    roof.parent = root;

    const peak = CreateBox("peak", { width: w * 0.7, height: 0.3, depth: d * 0.7 }, scene);
    peak.material = roofMat;
    peak.position.y = h + 0.45;
    peak.parent = root;

    const tip = CreateBox("tip", { width: w * 0.35, height: 0.25, depth: d * 0.35 }, scene);
    tip.material = roofMat;
    tip.position.y = h + 0.7;
    tip.parent = root;

    // Door
    const doorMat = mat(scene, 0.35, 0.22, 0.1);
    const door = CreateBox("door", { width: 0.6, height: 1.2, depth: 0.05 }, scene);
    door.material = doorMat;
    door.position.set(0, 0.6, d / 2 + 0.03);
    door.parent = root;

    // Windows
    const winMat = mat(scene, 0.6, 0.8, 1.0);
    const winPositions = [
      new Vector3(-w / 3, h * 0.6, d / 2 + 0.03),
      new Vector3(w / 3, h * 0.6, d / 2 + 0.03),
    ];
    winPositions.forEach((pos, i) => {
      const win = CreateBox(`win${i}`, { width: 0.5, height: 0.5, depth: 0.05 }, scene);
      win.material = winMat;
      win.position = pos;
      win.parent = root;
    });

    return root;
  }

  /** Tall building / apartment */
  static createBuilding(scene: Scene, w: number, h: number, d: number, color: Color3): TransformNode {
    const root = new TransformNode("building", scene);

    const wallMat = mat(scene, color.r, color.g, color.b);
    const walls = CreateBox("walls", { width: w, height: h, depth: d }, scene);
    walls.material = wallMat;
    walls.position.y = h / 2;
    walls.parent = root;
    walls.receiveShadows = true;
    walls.checkCollisions = true;

    // Windows grid
    const winMat = mat(scene, 0.7, 0.85, 1.0);
    const floors = Math.floor(h / 2.5);
    const cols = Math.max(1, Math.floor(w / 2));
    for (let floor = 0; floor < floors; floor++) {
      for (let col = 0; col < cols; col++) {
        const winX = -((cols - 1) * 1.5) / 2 + col * 1.5;
        const winY = 1.5 + floor * 2.5;
        if (winY > h - 1) continue;

        const wf = CreateBox(`wf${floor}_${col}`, { width: 0.6, height: 0.8, depth: 0.05 }, scene);
        wf.material = winMat;
        wf.position.set(winX, winY, d / 2 + 0.03);
        wf.parent = root;

        const wb = CreateBox(`wb${floor}_${col}`, { width: 0.6, height: 0.8, depth: 0.05 }, scene);
        wb.material = winMat;
        wb.position.set(winX, winY, -d / 2 - 0.03);
        wb.parent = root;
      }
    }

    // Flat roof edge
    const edgeMat = mat(scene, color.r * 0.7, color.g * 0.7, color.b * 0.7);
    const edge = CreateBox("edge", { width: w + 0.2, height: 0.3, depth: d + 0.2 }, scene);
    edge.material = edgeMat;
    edge.position.y = h + 0.15;
    edge.parent = root;

    return root;
  }

  /** Convenience store / shop */
  static createShop(scene: Scene): TransformNode {
    const root = new TransformNode("shop", scene);

    const wallMat = mat(scene, 0.95, 0.95, 0.9);
    const walls = CreateBox("walls", { width: 6, height: 3, depth: 5 }, scene);
    walls.material = wallMat;
    walls.position.y = 1.5;
    walls.parent = root;
    walls.receiveShadows = true;
    walls.checkCollisions = true;

    // Signboard
    const signMat = mat(scene, 0.1, 0.4, 0.8);
    const sign = CreateBox("sign", { width: 6.2, height: 0.8, depth: 0.1 }, scene);
    sign.material = signMat;
    sign.position.set(0, 3.4, 2.55);
    sign.parent = root;

    // Glass front
    const glassMat = mat(scene, 0.6, 0.85, 0.95);
    glassMat.alpha = 0.5;
    const glass = CreateBox("glass", { width: 4, height: 2.2, depth: 0.05 }, scene);
    glass.material = glassMat;
    glass.position.set(0, 1.4, 2.53);
    glass.parent = root;

    // Flat roof
    const roofMat = mat(scene, 0.7, 0.7, 0.7);
    const roof = CreateBox("roof", { width: 6.4, height: 0.15, depth: 5.4 }, scene);
    roof.material = roofMat;
    roof.position.y = 3.08;
    roof.parent = root;

    return root;
  }

  /** Tree */
  static createTree(scene: Scene): TransformNode {
    const root = new TransformNode("tree", scene);

    const trunkMat = mat(scene, 0.55, 0.41, 0.08);
    const trunk = CreateCylinder("trunk", { height: 1.5, diameterTop: 0.15, diameterBottom: 0.25, tessellation: 8 }, scene);
    trunk.material = trunkMat;
    trunk.position.y = 0.75;
    trunk.parent = root;

    const foliageMat = mat(scene, 0.18, 0.55, 0.27);
    const foliage = CreateSphere("foliage", { diameter: 1.8, segments: 8 }, scene);
    foliage.material = foliageMat;
    foliage.position.y = 2.2;
    foliage.parent = root;

    return root;
  }

  /** Street lamp */
  static createStreetLamp(scene: Scene): TransformNode {
    const root = new TransformNode("lamp", scene);

    const poleMat = mat(scene, 0.3, 0.3, 0.3);
    const pole = CreateCylinder("pole", { height: 4, diameter: 0.12, tessellation: 8 }, scene);
    pole.material = poleMat;
    pole.position.y = 2;
    pole.parent = root;

    const arm = CreateBox("arm", { width: 1, height: 0.08, depth: 0.08 }, scene);
    arm.material = poleMat;
    arm.position.set(0.5, 4, 0);
    arm.parent = root;

    const lampMat = mat(scene, 1, 0.95, 0.7);
    const lampHead = CreateBox("lamphead", { width: 0.5, height: 0.15, depth: 0.3 }, scene);
    lampHead.material = lampMat;
    lampHead.position.set(1, 3.9, 0);
    lampHead.parent = root;

    return root;
  }

  /** Bench */
  static createBench(scene: Scene): TransformNode {
    const root = new TransformNode("bench", scene);
    const woodMat = mat(scene, 0.55, 0.35, 0.15);
    const metalMat = mat(scene, 0.3, 0.3, 0.3);

    const seat = CreateBox("seat", { width: 1.5, height: 0.08, depth: 0.4 }, scene);
    seat.material = woodMat;
    seat.position.y = 0.45;
    seat.parent = root;

    const back = CreateBox("back", { width: 1.5, height: 0.5, depth: 0.06 }, scene);
    back.material = woodMat;
    back.position.set(0, 0.7, -0.17);
    back.parent = root;

    const leg1 = CreateBox("l1", { width: 0.06, height: 0.45, depth: 0.3 }, scene);
    leg1.material = metalMat;
    leg1.position.set(-0.6, 0.225, 0);
    leg1.parent = root;

    const leg2 = CreateBox("l2", { width: 0.06, height: 0.45, depth: 0.3 }, scene);
    leg2.material = metalMat;
    leg2.position.set(0.6, 0.225, 0);
    leg2.parent = root;

    return root;
  }

  /** Fence segment */
  static createFence(scene: Scene, length: number): Mesh {
    const fenceMat = mat(scene, 0.6, 0.45, 0.25);
    const fence = CreateBox("fence", { width: length, height: 1.0, depth: 0.1 }, scene);
    fence.material = fenceMat;
    fence.position.y = 0.5;
    fence.checkCollisions = true;
    return fence;
  }

  /** Road surface */
  static createRoad(scene: Scene, w: number, d: number): Mesh {
    const roadMat = mat(scene, 0.25, 0.25, 0.28);
    const road = CreateBox("road", { width: w, height: 0.02, depth: d }, scene);
    road.material = roadMat;
    road.position.y = 0.01;
    return road;
  }
}
