export interface InputState {
  moveX: number; // -1 (left) to 1 (right)
  moveZ: number; // -1 (backward) to 1 (forward)
  isSprinting: boolean;
  isJumping: boolean;
  isInteracting: boolean;
  lookDeltaX: number;
  lookDeltaY: number;
}

export class InputManager {
  public state: InputState = {
    moveX: 0,
    moveZ: 0,
    isSprinting: false,
    isJumping: false,
    isInteracting: false,
    lookDeltaX: 0,
    lookDeltaY: 0
  };

  private keys: { [key: string]: boolean } = {};
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private joystickZone: HTMLElement | null = null;
  private joystickKnob: HTMLElement | null = null;
  private joystickTouchId: number | null = null;
  private lookTouchId: number | null = null;
  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private maxJoystickRadius: number = 45;

  constructor() {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.setupTouchListeners();
  }

  private setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        this.state.isJumping = true;
      }
      if (e.code === 'KeyE') {
        this.state.isInteracting = true;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.state.isSprinting = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.state.isJumping = false;
      }
      if (e.code === 'KeyE') {
        this.state.isInteracting = false;
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.state.isSprinting = false;
      }
    });
  }

  private setupMouseListeners() {
    window.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).closest('.interactive') || (e.target as HTMLElement).closest('button')) return;
      
      // Request pointer lock for true first-person immersion on desktop
      if (document.pointerLockElement !== document.body) {
        document.body.requestPointerLock().catch(() => {});
      }
      
      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === document.body) {
        // True FPS look using movementX/Y
        this.state.lookDeltaX += e.movementX * 0.002;
        this.state.lookDeltaY += e.movementY * 0.002;
      } else if (this.isPointerDown) {
        // Fallback drag-to-look
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.state.lookDeltaX += dx * 0.0035;
        this.state.lookDeltaY += dy * 0.0035;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isPointerDown = false;
    });
  }

  private setupTouchListeners() {
    this.joystickZone = document.getElementById('joystick-zone');
    this.joystickKnob = document.getElementById('joystick-knob');

    // Mobile Action buttons
    const jumpBtn = document.getElementById('mobile-jump-btn');
    const sprintBtn = document.getElementById('mobile-sprint-btn');
    const interactBtn = document.getElementById('mobile-interact-btn');

    if (jumpBtn) {
      jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.state.isJumping = true; jumpBtn.classList.add('pressed'); });
      jumpBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.state.isJumping = false; jumpBtn.classList.remove('pressed'); });
    }
    if (sprintBtn) {
      sprintBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.state.isSprinting = !this.state.isSprinting; sprintBtn.classList.toggle('pressed', this.state.isSprinting); });
    }
    if (interactBtn) {
      interactBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.state.isInteracting = true; interactBtn.classList.add('pressed'); });
      interactBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.state.isInteracting = false; interactBtn.classList.remove('pressed'); });
    }

    // Touch events for screen & joystick
    window.addEventListener('touchstart', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const target = touch.target as HTMLElement;

        if (target.closest('.interactive') || target.closest('button')) continue;

        // If touching left half of screen or joystick zone -> Joystick
        if (touch.clientX < window.innerWidth * 0.45 && this.joystickTouchId === null) {
          this.joystickTouchId = touch.identifier;
          if (this.joystickZone) {
            const rect = this.joystickZone.getBoundingClientRect();
            this.joystickCenter = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2
            };
            this.handleJoystickMove(touch.clientX, touch.clientY);
          }
        } else if (touch.clientX >= window.innerWidth * 0.45 && this.lookTouchId === null) {
          // Touching right half -> Camera Orbit
          this.lookTouchId = touch.identifier;
          this.lastPointerX = touch.clientX;
          this.lastPointerY = touch.clientY;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.handleJoystickMove(touch.clientX, touch.clientY);
        } else if (touch.identifier === this.lookTouchId) {
          const dx = touch.clientX - this.lastPointerX;
          const dy = touch.clientY - this.lastPointerY;
          this.lastPointerX = touch.clientX;
          this.lastPointerY = touch.clientY;
          this.state.lookDeltaX += dx * 0.005;
          this.state.lookDeltaY += dy * 0.005;
        }
      }
    }, { passive: false });

    const endTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.resetJoystick();
        } else if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }

  private handleJoystickMove(x: number, y: number) {
    const dx = x - this.joystickCenter.x;
    const dy = y - this.joystickCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(distance, this.maxJoystickRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    if (this.joystickKnob) {
      this.joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
    }

    const norm = clampedDist / this.maxJoystickRadius;
    this.state.moveX = (knobX / this.maxJoystickRadius);
    this.state.moveZ = -(knobY / this.maxJoystickRadius); // Up is forward
  }

  private resetJoystick() {
    this.state.moveX = 0;
    this.state.moveZ = 0;
    if (this.joystickKnob) {
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
    }
  }

  public update() {
    // Keyboard fallback if joystick is inactive
    if (this.joystickTouchId === null) {
      let kx = 0;
      let kz = 0;
      if (this.keys['KeyW'] || this.keys['ArrowUp']) kz += 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) kz -= 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) kx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) kx += 1;

      // Normalize diagonal
      const len = Math.sqrt(kx * kx + kz * kz);
      if (len > 0) {
        this.state.moveX = kx / len;
        this.state.moveZ = kz / len;
      } else {
        this.state.moveX = 0;
        this.state.moveZ = 0;
      }
    }
  }

  public consumeLookDeltas() {
    const dx = this.state.lookDeltaX;
    const dy = this.state.lookDeltaY;
    this.state.lookDeltaX = 0;
    this.state.lookDeltaY = 0;
    return { dx, dy };
  }
}
