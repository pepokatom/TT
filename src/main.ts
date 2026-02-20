import { Engine } from "./core/Engine";
import { InputManager } from "./core/InputManager";
import { OpenWorldScene } from "./scenes/OpenWorldScene";

console.info("main.ts: modules loaded");

function startOpenWorld() {
  const engine = new Engine(document.body);
  const input = new InputManager(engine.canvas);

  const scene = new OpenWorldScene(engine, input);
  scene.init();
  engine.start();
}

// Signal to watchdog that the module loaded successfully
(window as unknown as Record<string, unknown>).__MODULE_LOADED = true;

// Remove loading screen and start
document.getElementById("loading-screen")?.remove();
console.info("main.ts: starting open world");
startOpenWorld();
