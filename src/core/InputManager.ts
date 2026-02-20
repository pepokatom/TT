export interface DragState {
  dirX: number;
  dirY: number;
  magnitude: number;
  active: boolean;
}

export class InputManager {
  private dragStartX = 0;
  private dragStartY = 0;
  private _drag: DragState = { dirX: 0, dirY: 0, magnitude: 0, active: false };
  private readonly maxRadius: number;
  private wasDrag = false;

  onTap: (() => void) | null = null;

  private joystickBase: HTMLDivElement;
  private joystickKnob: HTMLDivElement;

  get drag(): Readonly<DragState> {
    return this._drag;
  }

  constructor(element: HTMLElement, maxRadius = 80) {
    this.maxRadius = maxRadius;

    this.joystickBase = document.createElement("div");
    this.joystickBase.style.cssText =
      "position:fixed;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);border:2px solid rgba(255,255,255,0.2);pointer-events:none;z-index:20;display:none;transform:translate(-50%,-50%);";
    this.joystickKnob = document.createElement("div");
    this.joystickKnob.style.cssText =
      "position:absolute;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.35);left:50%;top:50%;transform:translate(-50%,-50%);transition:background 0.1s;";
    this.joystickBase.appendChild(this.joystickKnob);
    document.body.appendChild(this.joystickBase);

    element.addEventListener("touchstart", this.onTouchStart, { passive: false });
    element.addEventListener("touchmove", this.onTouchMove, { passive: false });
    element.addEventListener("touchend", this.onTouchEnd, { passive: false });
    element.addEventListener("mousedown", this.onMouseDown);
    element.addEventListener("mousemove", this.onMouseMove);
    element.addEventListener("mouseup", this.onMouseUp);
  }

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    this.startDrag(t.clientX, t.clientY);
  };
  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    this.moveDrag(t.clientX, t.clientY);
  };
  private onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.endDrag();
  };
  private onMouseDown = (e: MouseEvent) => this.startDrag(e.clientX, e.clientY);
  private onMouseMove = (e: MouseEvent) => { if (this._drag.active) this.moveDrag(e.clientX, e.clientY); };
  private onMouseUp = () => this.endDrag();

  private startDrag(x: number, y: number): void {
    this.dragStartX = x;
    this.dragStartY = y;
    this._drag.active = true;
    this._drag.magnitude = 0;
    this._drag.dirX = 0;
    this._drag.dirY = 0;
    this.wasDrag = false;

    this.joystickBase.style.left = x + "px";
    this.joystickBase.style.top = y + "px";
    this.joystickBase.style.display = "block";
    this.joystickKnob.style.transform = "translate(-50%,-50%)";
  }

  private moveDrag(x: number, y: number): void {
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 5) this.wasDrag = true;

    const clamped = Math.min(dist, this.maxRadius);
    this._drag.magnitude = clamped / this.maxRadius;

    if (dist > 0.001) {
      this._drag.dirX = dx / dist;
      this._drag.dirY = dy / dist;
    }

    const knobX = (dx / Math.max(dist, 0.001)) * clamped;
    const knobY = (dy / Math.max(dist, 0.001)) * clamped;
    this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    this.joystickKnob.style.background =
      this._drag.magnitude > 0.7 ? "rgba(231,76,60,0.5)" : "rgba(255,255,255,0.35)";
  }

  private endDrag(): void {
    if (!this.wasDrag && this.onTap) {
      this.onTap();
    }
    this._drag.active = false;
    this._drag.magnitude = 0;
    this._drag.dirX = 0;
    this._drag.dirY = 0;
    this.joystickBase.style.display = "none";
  }
}
