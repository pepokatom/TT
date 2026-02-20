import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AssetFactory } from "../core/AssetFactory";

export interface DoorInfo {
  pivot: TransformNode;
  isOpen: boolean;
  currentAngle: number;
}

export class OpenWorld {
  readonly doors: DoorInfo[] = [];

  constructor(scene: Scene, shadowGen: ShadowGenerator) {
    this.buildGround(scene);
    this.buildRoads(scene);
    this.buildHouses(scene, shadowGen);
    this.buildBuildings(scene, shadowGen);
    this.buildShops(scene, shadowGen);
    this.buildPark(scene, shadowGen);
    this.buildTrees(scene, shadowGen);
    this.buildStreetLamps(scene);
    this.buildFences(scene);
  }

  private buildGround(scene: Scene): void {
    const ground = CreateGround("ground", { width: 200, height: 200, subdivisions: 4 }, scene);
    const groundMat = new StandardMaterial("groundMat", scene);
    groundMat.diffuseColor = new Color3(0.4, 0.55, 0.3);
    ground.material = groundMat;
    ground.receiveShadows = true;
  }

  private buildRoads(scene: Scene): void {
    // Main east-west road
    const road1 = AssetFactory.createRoad(scene, 200, 6);
    road1.position.z = 0;

    // Main north-south road
    const road2 = AssetFactory.createRoad(scene, 6, 200);
    road2.position.x = 0;

    // Secondary roads
    const road3 = AssetFactory.createRoad(scene, 200, 4);
    road3.position.z = 25;

    const road4 = AssetFactory.createRoad(scene, 200, 4);
    road4.position.z = -25;

    const road5 = AssetFactory.createRoad(scene, 4, 200);
    road5.position.x = 30;

    const road6 = AssetFactory.createRoad(scene, 4, 200);
    road6.position.x = -30;

    // Intersection crossing markings (white lines)
    const whiteMat = new StandardMaterial("whiteLine", scene);
    whiteMat.diffuseColor = new Color3(0.9, 0.9, 0.9);

    const crossings = [
      { x: 0, z: 0 },
      { x: 30, z: 0 },
      { x: -30, z: 0 },
      { x: 0, z: 25 },
      { x: 0, z: -25 },
    ];
    for (const c of crossings) {
      for (let i = -2; i <= 2; i++) {
        const stripe = CreateBox("stripe", { width: 0.4, height: 0.025, depth: 1.2 }, scene);
        stripe.material = whiteMat;
        stripe.position.set(c.x + i * 1.2, 0.02, c.z);
      }
    }
  }

  private buildHouses(scene: Scene, shadowGen: ShadowGenerator): void {
    const houses = [
      { x: 10, z: 10, w: 5, h: 3.5, d: 4, wall: new Color3(0.9, 0.85, 0.75), roof: new Color3(0.6, 0.25, 0.2), ry: 0 },
      { x: 20, z: 10, w: 4, h: 3, d: 5, wall: new Color3(0.85, 0.9, 0.85), roof: new Color3(0.3, 0.45, 0.3), ry: 0 },
      { x: 10, z: -10, w: 6, h: 4, d: 5, wall: new Color3(0.95, 0.9, 0.8), roof: new Color3(0.5, 0.3, 0.15), ry: Math.PI },
      { x: 22, z: -12, w: 5, h: 3, d: 4, wall: new Color3(0.8, 0.8, 0.9), roof: new Color3(0.35, 0.35, 0.5), ry: Math.PI },
      { x: -10, z: 10, w: 5, h: 3.5, d: 5, wall: new Color3(0.95, 0.92, 0.85), roof: new Color3(0.65, 0.3, 0.15), ry: 0 },
      { x: -20, z: 12, w: 4.5, h: 3, d: 4, wall: new Color3(0.88, 0.85, 0.82), roof: new Color3(0.4, 0.25, 0.15), ry: 0 },
      { x: -12, z: -10, w: 5, h: 3.5, d: 4.5, wall: new Color3(0.9, 0.88, 0.82), roof: new Color3(0.55, 0.2, 0.15), ry: Math.PI },
      { x: -22, z: -11, w: 4, h: 3, d: 5, wall: new Color3(0.85, 0.82, 0.75), roof: new Color3(0.3, 0.3, 0.35), ry: Math.PI },
      // Far area houses
      { x: 15, z: 35, w: 5, h: 3, d: 4, wall: new Color3(0.92, 0.88, 0.8), roof: new Color3(0.5, 0.25, 0.2), ry: 0 },
      { x: -15, z: 35, w: 4.5, h: 3.5, d: 5, wall: new Color3(0.85, 0.9, 0.85), roof: new Color3(0.35, 0.5, 0.3), ry: 0 },
      { x: 15, z: -35, w: 5, h: 3, d: 4, wall: new Color3(0.9, 0.85, 0.8), roof: new Color3(0.6, 0.3, 0.2), ry: Math.PI },
      { x: -15, z: -35, w: 4, h: 3, d: 5, wall: new Color3(0.88, 0.88, 0.82), roof: new Color3(0.4, 0.3, 0.2), ry: Math.PI },
    ];

    for (const h of houses) {
      const { root: house, doorPivot } = AssetFactory.createHouse(scene, h.w, h.h, h.d, h.wall, h.roof);
      house.position.set(h.x, 0, h.z);
      house.rotation.y = h.ry;
      house.getChildMeshes().forEach((m) => shadowGen.addShadowCaster(m));
      this.doors.push({ pivot: doorPivot, isOpen: false, currentAngle: 0 });
    }
  }

  private buildBuildings(scene: Scene, shadowGen: ShadowGenerator): void {
    const buildings = [
      { x: 40, z: 10, w: 8, h: 12, d: 8, color: new Color3(0.7, 0.7, 0.75) },
      { x: 40, z: -10, w: 6, h: 8, d: 6, color: new Color3(0.75, 0.7, 0.65) },
      { x: -40, z: 10, w: 7, h: 10, d: 7, color: new Color3(0.65, 0.65, 0.7) },
      { x: -40, z: -12, w: 8, h: 15, d: 6, color: new Color3(0.72, 0.72, 0.72) },
      { x: 40, z: 35, w: 10, h: 10, d: 8, color: new Color3(0.68, 0.7, 0.72) },
      { x: -40, z: 35, w: 7, h: 8, d: 7, color: new Color3(0.75, 0.72, 0.68) },
    ];

    for (const b of buildings) {
      const building = AssetFactory.createBuilding(scene, b.w, b.h, b.d, b.color);
      building.position.set(b.x, 0, b.z);
      building.getChildMeshes().forEach((m) => shadowGen.addShadowCaster(m));
    }
  }

  private buildShops(scene: Scene, shadowGen: ShadowGenerator): void {
    const shops = [
      { x: 8, z: -4, ry: Math.PI },
      { x: -8, z: 4, ry: 0 },
      { x: 35, z: -4, ry: Math.PI },
    ];

    for (const s of shops) {
      const shop = AssetFactory.createShop(scene);
      shop.position.set(s.x, 0, s.z);
      shop.rotation.y = s.ry;
      shop.getChildMeshes().forEach((m) => shadowGen.addShadowCaster(m));
    }
  }

  private buildPark(scene: Scene, shadowGen: ShadowGenerator): void {
    // Park area with benches and trees around x=-5, z=35
    const parkTrees = [
      { x: -5, z: 38 }, { x: -8, z: 32 }, { x: -2, z: 32 },
      { x: -9, z: 38 }, { x: -1, z: 38 },
    ];
    for (const t of parkTrees) {
      const tree = AssetFactory.createTree(scene);
      tree.position.set(t.x, 0, t.z);
      tree.getChildMeshes().forEach((m) => shadowGen.addShadowCaster(m));
    }

    const benches = [
      { x: -5, z: 34, ry: 0 },
      { x: -5, z: 36, ry: Math.PI },
      { x: -3, z: 35, ry: Math.PI / 2 },
    ];
    for (const b of benches) {
      const bench = AssetFactory.createBench(scene);
      bench.position.set(b.x, 0, b.z);
      bench.rotation.y = b.ry;
    }
  }

  private buildTrees(scene: Scene, shadowGen: ShadowGenerator): void {
    // Scatter trees along roads and in open areas
    const treePositions = [
      { x: 5, z: 5 }, { x: -5, z: -5 }, { x: 5, z: -5 }, { x: -5, z: 5 },
      { x: 15, z: 5 }, { x: -15, z: 5 }, { x: 15, z: -5 }, { x: -15, z: -5 },
      { x: 25, z: 5 }, { x: -25, z: 5 }, { x: 25, z: -5 }, { x: -25, z: -5 },
      { x: 5, z: 20 }, { x: -5, z: 20 }, { x: 5, z: -20 }, { x: -5, z: -20 },
      { x: 25, z: 20 }, { x: -25, z: 20 },
      { x: 50, z: 5 }, { x: -50, z: 5 }, { x: 50, z: -5 }, { x: -50, z: -5 },
      { x: 50, z: 20 }, { x: -50, z: 20 }, { x: 50, z: -20 }, { x: -50, z: -20 },
      { x: 50, z: 40 }, { x: -50, z: 40 }, { x: 50, z: -40 }, { x: -50, z: -40 },
    ];

    for (const t of treePositions) {
      const tree = AssetFactory.createTree(scene);
      tree.position.set(t.x, 0, t.z);
      tree.getChildMeshes().forEach((m) => shadowGen.addShadowCaster(m));
    }
  }

  private buildStreetLamps(scene: Scene): void {
    const lampPositions = [
      { x: 4, z: 4 }, { x: 4, z: -4 }, { x: -4, z: 4 }, { x: -4, z: -4 },
      { x: 15, z: 4 }, { x: 15, z: -4 }, { x: -15, z: 4 }, { x: -15, z: -4 },
      { x: 25, z: 4 }, { x: -25, z: 4 },
      { x: 4, z: 15 }, { x: -4, z: 15 }, { x: 4, z: -15 }, { x: -4, z: -15 },
      { x: 35, z: 4 }, { x: -35, z: 4 }, { x: 4, z: 28 }, { x: -4, z: 28 },
      { x: 4, z: -28 }, { x: -4, z: -28 },
    ];

    for (const p of lampPositions) {
      const lamp = AssetFactory.createStreetLamp(scene);
      lamp.position.set(p.x, 0, p.z);
    }
  }

  private buildFences(scene: Scene): void {
    // Park fence
    const fenceSegments = [
      { x: -5, z: 30, w: 12, ry: 0 },
      { x: -5, z: 40, w: 12, ry: 0 },
      { x: -11, z: 35, w: 10, ry: Math.PI / 2 },
      { x: 1, z: 35, w: 10, ry: Math.PI / 2 },
    ];

    for (const f of fenceSegments) {
      const fence = AssetFactory.createFence(scene, f.w);
      fence.position.set(f.x, 0, f.z);
      fence.rotation.y = f.ry;
    }
  }
}
