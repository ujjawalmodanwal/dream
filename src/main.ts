import * as THREE from 'three';
import { GirlCharacter } from './character/GirlCharacter';
import { CameraController } from './controls/CameraController';
import { InputManager } from './controls/InputManager';
import { SoundEngine } from './audio/SoundEngine';
import { WorldManager } from './worlds/WorldManager';
import { UIManager } from './ui/UIManager';

class App {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private cameraController: CameraController;
  private inputManager: InputManager;
  private soundEngine: SoundEngine;
  private character: GirlCharacter;
  private worldManager: WorldManager;
  private uiManager: UIManager;

  private clock: THREE.Clock = new THREE.Clock();
  private gravity: number = 22.0;
  private walkSpeed: number = 4.2;
  private runSpeed: number = 7.8;
  private jumpForce: number = 7.8;

  constructor() {
    // 1. Scene & Renderer Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      250
    );

    const container = document.getElementById('canvas-container')!;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    container.appendChild(this.renderer.domElement);

    // 2. Subsystems
    this.soundEngine = new SoundEngine();
    this.character = new GirlCharacter(this.soundEngine);
    this.scene.add(this.character.mesh);

    this.cameraController = new CameraController(this.camera);
    this.inputManager = new InputManager();
    this.worldManager = new WorldManager(this.scene, this.character, this.soundEngine);
    this.uiManager = new UIManager(this.worldManager, this.soundEngine);

    this.setupResizeHandler();
    this.simulateLoading();
    this.animate();
  }

  private setupResizeHandler() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  private simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        this.uiManager.setLoadProgress(100, 'Your journey is ready! ✨');
      } else {
        const messages = [
          'Planting the garden & lighting lanterns... 🌸',
          'Scenting the air with fresh pine & jasmine... 🍃',
          'Awakening the butterflies & songbirds... 🦋',
          'Tuning the river waters & divine flutes... 🪈',
          'Ready for your heart to soar... ✨'
        ];
        const msg = messages[Math.min(Math.floor(progress / 25), messages.length - 1)];
        this.uiManager.setLoadProgress(progress, msg);
      }
    }, 120);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.08); // Cap delta to prevent physics jumps

    this.inputManager.update();
    const input = this.inputManager.state;

    // Camera look update from mouse / touch swipe
    const { dx, dy } = this.inputManager.consumeLookDeltas();
    if (dx !== 0 || dy !== 0) {
      this.cameraController.rotate(dx, dy);
    }

    // Interaction key check (Keyboard 'E' or Mobile button)
    if (input.isInteracting) {
      this.uiManager.handleInteractionKey();
      input.isInteracting = false;
    }

    // Movement calculation
    this.handleMovement(delta, input);

    // Update character model procedural animation
    const currentSurface = this.worldManager.currentWorld.surfaceType;
    this.character.update(delta, currentSurface);

    // Update 3rd person follow camera
    this.cameraController.update(delta, this.character.position);

    // Update current active world (animations, particles, proximity detection)
    this.worldManager.update(delta);

    this.renderer.render(this.scene, this.camera);
  };

  private handleMovement(delta: number, input: any) {
    const forward = this.cameraController.getForwardVector();
    const right = this.cameraController.getRightVector();

    // Desired movement direction relative to camera
    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, input.moveZ)
      .addScaledVector(right, input.moveX);

    const hasInput = moveDir.lengthSq() > 0.01;
    if (hasInput) {
      moveDir.normalize();
      // Target rotation angle
      this.character.targetRotationY = Math.atan2(moveDir.x, moveDir.z);
    }

    const isSwimming = this.character.isSwimming;
    const speed = input.isSprinting ? this.runSpeed : this.walkSpeed;

    if (isSwimming) {
      // Swimming / Zero-G Cosmic floating physics
      if (hasInput) {
        this.character.position.x += moveDir.x * (speed * 0.75) * delta;
        this.character.position.z += moveDir.z * (speed * 0.75) * delta;
      }
      // Gentle floating bob
      if (input.isJumping) {
        this.character.position.y += 3.5 * delta;
      }
      this.character.isGrounded = false;
      this.character.animState = 'swim';
      // Keep within swim bounds
      this.character.position.y = THREE.MathUtils.clamp(this.character.position.y, 0.4, 8.0);
    } else {
      // Standard Ground Physics
      if (hasInput) {
        this.character.position.x += moveDir.x * speed * delta;
        this.character.position.z += moveDir.z * speed * delta;
        this.character.animState = input.isSprinting ? 'run' : 'walk';
      } else {
        this.character.animState = 'idle';
      }

      // Jumping & Gravity
      if (input.isJumping && this.character.isGrounded) {
        this.character.velocity.y = this.jumpForce;
        this.character.isGrounded = false;
        this.soundEngine.playJump();
      }

      // Apply Gravity
      this.character.velocity.y -= this.gravity * delta;
      this.character.position.y += this.character.velocity.y * delta;

      // Ground Collision Plane
      const groundLevel = 0;
      if (this.character.position.y <= groundLevel) {
        this.character.position.y = groundLevel;
        this.character.velocity.y = 0;
        this.character.isGrounded = true;
      } else {
        this.character.isGrounded = false;
      }
    }
  }
}

// Start application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
