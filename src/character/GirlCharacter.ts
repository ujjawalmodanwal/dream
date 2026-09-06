import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { SoundEngine } from '../audio/SoundEngine';

export type AnimationState = 'idle' | 'walk' | 'run' | 'jump' | 'swim' | 'wave';

/**
 * Realistic Human 3D Female Character.
 * Loads a photorealistic rigged 3D human model (Michelle / Mixamo)
 * with authentic human textures, skin, eyes, hair, and skeletal animations.
 */
export class GirlCharacter {
  public mesh: THREE.Group;
  public position: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public rotationY: number = 0;
  public targetRotationY: number = 0;
  public isGrounded: boolean = true;
  public isSwimming: boolean = false;
  public animState: AnimationState = 'idle';

  private mixer: THREE.AnimationMixer | null = null;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction: THREE.AnimationAction | null = null;
  private humanModel: THREE.Group | null = null;

  // Fallback human procedural mesh while GLTF loads
  private fallbackMesh: THREE.Group;
  private animTimer: number = 0;
  private footstepTimer: number = 0;
  private soundEngine: SoundEngine;

  constructor(soundEngine: SoundEngine) {
    this.soundEngine = soundEngine;
    this.mesh = new THREE.Group();
    // Hide the mesh entirely for First-Person perspective
    this.mesh.visible = false; 

    this.fallbackMesh = new THREE.Group();
    this.mesh.add(this.fallbackMesh);

    this.buildRealisticFallback();
    this.loadRealHumanModel();
  }

  private loadRealHumanModel() {
    const loader = new GLTFLoader();

    // 1. Load realistic human female GLTF
    loader.load('/models/girl.glb', (gltf) => {
      this.humanModel = gltf.scene;
      this.humanModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.roughness = 0.55;
            mat.metalness = 0.05;
          }
        }
      });

      // Height is ~1.66m, stands upright
      this.humanModel.position.set(0, 0, 0);

      this.mixer = new THREE.AnimationMixer(this.humanModel);

      // 2. Load authentic skeletal animations (Idle, Walk, Run)
      loader.load('/models/animations.glb', (animGltf) => {
        animGltf.animations.forEach((clip) => {
          const action = this.mixer!.clipAction(clip);
          this.actions.set(clip.name.toLowerCase(), action);
        });

        // Swap out fallback mesh for real human GLTF
        this.mesh.remove(this.fallbackMesh);
        this.mesh.add(this.humanModel!);

        // Start with Idle animation
        const idleAction = this.actions.get('idle');
        if (idleAction) {
          idleAction.play();
          this.currentAction = idleAction;
        }
      }, undefined, (err) => {
        console.warn('Animation load warning, using procedural rig:', err);
        // If animations fail, still display the real human model
        this.mesh.remove(this.fallbackMesh);
        this.mesh.add(this.humanModel!);
      });
    }, undefined, (err) => {
      console.warn('GLB load fallback active:', err);
    });
  }

  private buildRealisticFallback() {
    // Realistic human silhouette fallback
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbf0ea,
      roughness: 0.5,
      metalness: 0.05
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x2b1d14,
      roughness: 0.45
    });

    const sweaterMat = new THREE.MeshStandardMaterial({
      color: 0xf5efe6, // Ivory cashmere
      roughness: 0.85
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x212529,
      roughness: 0.75
    });

    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x2c1d11,
      roughness: 0.4
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.52, 16), sweaterMat);
    torso.position.y = 1.18;
    torso.castShadow = true;
    this.fallbackMesh.add(torso);

    // Turtleneck collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 16), sweaterMat);
    collar.position.y = 1.48;
    this.fallbackMesh.add(collar);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 24, 24), skinMat);
    head.position.y = 1.62;
    head.scale.set(0.9, 1.05, 0.95);
    head.castShadow = true;
    this.fallbackMesh.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), hairMat);
    hair.position.set(0, 1.66, -0.02);
    hair.scale.set(1.02, 1.05, 1.05);
    this.fallbackMesh.add(hair);

    // Flowing hair cascade
    const cascade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.65, 12), hairMat);
    cascade.position.set(0, 1.35, -0.12);
    this.fallbackMesh.add(cascade);

    // Legs
    [-0.09, 0.09].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.88, 12), pantsMat);
      leg.position.set(x, 0.48, 0);
      leg.castShadow = true;
      this.fallbackMesh.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.18), leatherMat);
      boot.position.set(x, 0.06, 0.03);
      boot.castShadow = true;
      this.fallbackMesh.add(boot);
    });

    // Arms
    [-0.24, 0.24].forEach(x => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.62, 10), sweaterMat);
      arm.position.set(x, 1.15, 0);
      arm.castShadow = true;
      this.fallbackMesh.add(arm);
    });
  }

  public update(delta: number, currentSurface: 'grass' | 'stone' | 'snow' | 'water' = 'grass') {
    this.animTimer += delta;

    // Smooth body yaw rotation towards movement direction
    let diff = this.targetRotationY - this.rotationY;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    this.rotationY += diff * Math.min(1, delta * 12);
    this.mesh.rotation.y = this.rotationY;

    // Update skeletal mixer if GLTF model is active
    if (this.mixer) {
      this.updateGLTFAnimation(delta);
      this.mixer.update(delta);
    } else {
      // Procedural fallback animation
      this.updateProceduralAnimation(delta);
    }

    // Footstep audio triggers during movement
    if (this.animState === 'walk' || this.animState === 'run') {
      const cadence = this.animState === 'run' ? 12.0 : 7.5;
      this.footstepTimer += delta * cadence;
      if (this.footstepTimer > Math.PI) {
        this.footstepTimer -= Math.PI;
        this.soundEngine.playFootstep(currentSurface);
      }
    }

    this.mesh.position.copy(this.position);
  }

  private updateGLTFAnimation(delta: number) {
    let targetName = 'idle';
    if (this.isSwimming) {
      targetName = 'walk'; // Swimming float motion
    } else if (this.animState === 'run') {
      targetName = 'run';
    } else if (this.animState === 'walk') {
      targetName = 'walk';
    } else {
      targetName = 'idle';
    }

    const targetAction = this.actions.get(targetName);
    if (targetAction && this.currentAction !== targetAction) {
      if (this.currentAction) {
        this.currentAction.fadeOut(0.2);
      }
      targetAction.reset().fadeIn(0.2).play();
      this.currentAction = targetAction;
    }
  }

  private updateProceduralAnimation(delta: number) {
    const t = this.animTimer * 7.5;
    if (this.animState === 'walk' || this.animState === 'run') {
      this.fallbackMesh.position.y = Math.abs(Math.sin(t)) * 0.04;
    } else {
      this.fallbackMesh.position.y = Math.sin(this.animTimer * 2) * 0.012; // breathing
    }
  }
}
