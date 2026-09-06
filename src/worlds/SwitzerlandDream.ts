import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class SwitzerlandDream implements IDreamWorld {
  public id = 'switzerland';
  public name = 'Swiss Alps Journey';
  public icon = '🏔️';
  public subtitle = 'A breathtaking immersive walk through the Swiss mountains';
  public cozyQuote = 'The air is crisp, the mountains are calling, and the journey is yours.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'snow';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 5);
  public returnPortalPosition = new THREE.Vector3(0, 0, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@46.5595,7.9056,3a,75y,0h,90t/data=!3m6!1e1';
  public streetViewLocation = 'Lauterbrunnen Valley, Switzerland';

  private videoTexture!: THREE.VideoTexture;

  public init() {
    this.setupLighting();
    this.buildInvisibleFloor();
    this.buildImmersiveVideoSky();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0x52b788, 0x10002b, 0.95);
    this.sceneGroup.add(hemiLight);

    const moonLight = new THREE.DirectionalLight(0xc8b6ff, 1.2);
    moonLight.position.set(-15, 25, -15);
    moonLight.castShadow = true;
    this.sceneGroup.add(moonLight);
  }

  private buildImmersiveVideoSky() {
    // Immersive Flat Video Screen
    this.videoTexture = TextureHelper.load360VideoTexture('/videos/switzerland.mp4');
    
    // Massive flat cinema screen: 16:9 ratio
    const skyGeo = new THREE.PlaneGeometry(160, 90);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      fog: false,
      side: THREE.DoubleSide
    });
    const auroraSkyMesh = new THREE.Mesh(skyGeo, skyMat);
    
    // Place screen straight ahead of the spawn position
    auroraSkyMesh.position.set(0, 15, -80);
    this.sceneGroup.add(auroraSkyMesh);
  }

  private buildInvisibleFloor() {
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      visible: false // invisible floor for collision/walking
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.sceneGroup.add(floor);
  }

  private buildReturnPortal() {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(this.returnPortalPosition);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9b5de5, roughness: 0.6 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 12, 24), stoneMat);
    arch.position.y = 1.6;
    portalGroup.add(arch);

    const glow = new THREE.PointLight(0xb5179e, 1.8, 8);
    glow.position.set(0, 1.6, 0);
    portalGroup.add(glow);

    this.sceneGroup.add(portalGroup);
  }

  public playVideo() {
    if (this.videoTexture && this.videoTexture.image) {
      const vid = this.videoTexture.image as HTMLVideoElement;
      vid.muted = false;
      vid.volume = 1.0;
      vid.play().catch(e => console.warn('Autoplay prevented:', e));
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // No procedural objects to update anymore, the video handles the realism!
  }

  public destroy() {
    if (this.videoTexture && this.videoTexture.image) {
      const vid = this.videoTexture.image as HTMLVideoElement;
      vid.pause();
    }
    this.sceneGroup.clear();
  }
}

