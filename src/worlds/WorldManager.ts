import * as THREE from 'three';
import { IDreamWorld, PortalData } from './WorldInterface';
import { GardenHub } from './GardenHub';
import { UnderwaterDream } from './UnderwaterDream';
import { AuroraDream } from './AuroraDream';
import { SwitzerlandDream } from './SwitzerlandDream';
import { MountainDream } from './MountainDream';
import { SkyGazingDream } from './SkyGazingDream';
import { ParisDream } from './ParisDream';
import { ItalyDream } from './ItalyDream';
import { VaranasiDream } from './VaranasiDream';
import { KrishnaDream } from './KrishnaDream';
import { GirlCharacter } from '../character/GirlCharacter';
import { SoundEngine } from '../audio/SoundEngine';

export class WorldManager {
  public scene: THREE.Scene;
  public character: GirlCharacter;
  public soundEngine: SoundEngine;
  public currentWorldId: string = 'garden';
  public currentWorld!: IDreamWorld;

  private worlds: Map<string, IDreamWorld> = new Map();
  private gardenHub!: GardenHub;
  private isTransitioning: boolean = false;
  private lastDreamId: string | null = null;
  private onWorldChangeCallback?: (world: IDreamWorld) => void;
  private onPromptChangeCallback?: (portal: PortalData | null, isReturn: boolean) => void;

  constructor(scene: THREE.Scene, character: GirlCharacter, soundEngine: SoundEngine) {
    this.scene = scene;
    this.character = character;
    this.soundEngine = soundEngine;

    this.registerWorlds();
    this.loadWorld('garden', false);
  }

  public setOnWorldChange(callback: (world: IDreamWorld) => void) {
    this.onWorldChangeCallback = callback;
  }

  public setOnPromptChange(callback: (portal: PortalData | null, isReturn: boolean) => void) {
    this.onPromptChangeCallback = callback;
  }

  private registerWorlds() {
    this.gardenHub = new GardenHub();
    this.worlds.set('garden', this.gardenHub);
    this.worlds.set('underwater', new UnderwaterDream());
    this.worlds.set('switzerland', new SwitzerlandDream());
    this.worlds.set('aurora', new AuroraDream());
    this.worlds.set('mountain', new MountainDream());
    this.worlds.set('skygazing', new SkyGazingDream());
    this.worlds.set('paris', new ParisDream());
    this.worlds.set('italy', new ItalyDream());
    this.worlds.set('varanasi', new VaranasiDream());
    this.worlds.set('krishna', new KrishnaDream());
  }

  public getAllWorlds(): IDreamWorld[] {
    return Array.from(this.worlds.values());
  }

  public transitionTo(worldId: string) {
    if (this.isTransitioning || this.currentWorldId === worldId) return;
    this.isTransitioning = true;

    // Trigger visual warp overlay
    const overlay = document.getElementById('warp-overlay');
    if (overlay) overlay.classList.add('active');

    // Chime
    this.soundEngine.playPortalChime();

    setTimeout(() => {
      this.loadWorld(worldId, true);
      setTimeout(() => {
        if (overlay) overlay.classList.remove('active');
        this.isTransitioning = false;
      }, 400);
    }, 450);
  }

  private loadWorld(worldId: string, spawnAtStart: boolean = true) {
    const target = this.worlds.get(worldId);
    if (!target) return;

    // Remove old world group
    if (this.currentWorld) {
      this.scene.remove(this.currentWorld.sceneGroup);
      this.currentWorld.destroy();
    }

    // Set and init new world
    this.currentWorldId = worldId;
    this.currentWorld = target;
    this.currentWorld.init();
    this.scene.add(this.currentWorld.sceneGroup);

    // Reposition player
    if (spawnAtStart) {
      if (worldId === 'garden' && this.lastDreamId) {
        const portal = this.gardenHub.getPortalById(this.lastDreamId);
        if (portal) {
          // Spawn right outside the portal (offset towards center path x=0)
          const offsetX = portal.position.x > 0 ? portal.position.x - 3 : portal.position.x + 3;
          this.character.position.set(offsetX, this.currentWorld.spawnPosition.y, portal.position.z);
          // Look at the portal
          this.character.targetRotationY = portal.position.x > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
          this.character.position.copy(this.currentWorld.spawnPosition);
        }
        this.lastDreamId = null; // Clear it after returning
      } else {
        this.character.position.copy(this.currentWorld.spawnPosition);
        if (worldId !== 'garden') {
          this.lastDreamId = worldId;
        }
      }
      this.character.velocity.set(0, 0, 0);
    }
    this.character.isSwimming = this.currentWorld.isUnderwaterOrCosmic;

    // Adjust scene background & fog to match world mood
    this.updateAtmosphere(worldId);

    // Switch soundscape or disable it for video worlds so native audio plays
    if (['switzerland', 'aurora', 'underwater', 'paris', 'varanasi'].includes(worldId)) {
      this.soundEngine.playWorldTheme('none'); // Stops all themes
    } else {
      this.soundEngine.playWorldTheme(worldId);
    }

    // Ensure the video plays if this world has one
    if (typeof (this.currentWorld as any).playVideo === 'function') {
      (this.currentWorld as any).playVideo();
    }

    if (this.onWorldChangeCallback) {
      this.onWorldChangeCallback(this.currentWorld);
    }
  }

  private updateAtmosphere(worldId: string) {
    switch (worldId) {
      case 'garden':
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.012);
        break;
      case 'underwater':
        this.scene.background = new THREE.Color(0x005f73);
        this.scene.fog = new THREE.FogExp2(0x005f73, 0.038);
        break;
      case 'switzerland':
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.005);
        break;
      case 'aurora':
        this.scene.background = new THREE.Color(0x0b091a);
        this.scene.fog = new THREE.FogExp2(0x10002b, 0.018);
        break;
      case 'mountain':
        this.scene.background = new THREE.Color(0x90e0ef);
        this.scene.fog = new THREE.FogExp2(0xade8f4, 0.010);
        break;
      case 'skygazing':
        this.scene.background = new THREE.Color(0xade8f4);
        this.scene.fog = new THREE.FogExp2(0xcaf0f8, 0.014);
        break;
      case 'paris':
        this.scene.background = new THREE.Color(0x1d3557);
        this.scene.fog = new THREE.FogExp2(0x1d3557, 0.016);
        break;
      case 'italy':
        this.scene.background = new THREE.Color(0xffe3a8);
        this.scene.fog = new THREE.FogExp2(0xffd166, 0.012);
        break;
      case 'varanasi':
        this.scene.background = new THREE.Color(0x2b1055);
        this.scene.fog = new THREE.FogExp2(0x2b1055, 0.018);
        break;
      case 'krishna':
        this.scene.background = new THREE.Color(0x02010a);
        this.scene.fog = new THREE.FogExp2(0x0a0520, 0.008);
        break;
      default:
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.012);
        break;
    }
  }

  public update(delta: number) {
    if (!this.currentWorld) return;
    this.currentWorld.update(delta, this.character.position);

    // Proximity checks for UI prompt
    if (this.currentWorldId === 'garden') {
      const nearPortal = this.gardenHub.getNearbyPortal(this.character.position, 3.4);
      if (this.onPromptChangeCallback) {
        this.onPromptChangeCallback(nearPortal, false);
      }
    } else {
      // In a dream world: check distance to return portal
      const distToReturn = this.character.position.distanceTo(this.currentWorld.returnPortalPosition);
      if (this.onPromptChangeCallback) {
        if (distToReturn < 3.4) {
          this.onPromptChangeCallback({
            id: 'garden',
            name: 'The Cozy Garden',
            icon: '🌸',
            description: 'Return to the peaceful garden pathway',
            quote: 'Return to the sanctuary of flowers and choose another dream.',
            position: this.currentWorld.returnPortalPosition,
            color: 0xff8fa3
          }, true);
        } else {
          this.onPromptChangeCallback(null, false);
        }
      }
    }
  }
}
