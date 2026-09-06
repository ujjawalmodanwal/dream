import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class AuroraDream implements IDreamWorld {
  public id = 'aurora';
  public name = 'Aurora Night Sky';
  public icon = '🌌';
  public subtitle = 'Dancing northern lights in a peaceful winter wonderland';
  public cozyQuote = 'The air is crisp, the snow is soft, and the celestial lights dance just for you.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'snow';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 5);
  public returnPortalPosition = new THREE.Vector3(0, 0, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@69.6492,18.9553,3a,75y,0h,120t/data=!3m6!1e1';
  public streetViewLocation = 'Tromsø Arctic Fjords & Northern Lights, Norway';

  private auroraVideoTexture!: THREE.VideoTexture;

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
    this.auroraVideoTexture = TextureHelper.load360VideoTexture('/videos/aurora.mp4');
    
    // Massive flat cinema screen: 16:9 ratio
    const skyGeo = new THREE.PlaneGeometry(160, 90);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.auroraVideoTexture,
      fog: false,
      side: THREE.DoubleSide
    });
    const auroraSkyMesh = new THREE.Mesh(skyGeo, skyMat);
    
    // Place screen straight ahead of the spawn position
    auroraSkyMesh.position.set(0, 15, -80);
    this.sceneGroup.add(auroraSkyMesh);
  }

  private buildInvisibleFloor() {
    // Flat invisible floor matching the immersive movie's ground perspective
    const geo = new THREE.PlaneGeometry(100, 100);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      visible: false // invisible floor for collision/walking
    });

    const ground = new THREE.Mesh(geo, mat);
    ground.rotation.x = -Math.PI / 2;
    this.sceneGroup.add(ground);
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
    if (this.auroraVideoTexture && this.auroraVideoTexture.image) {
      const vid = this.auroraVideoTexture.image as HTMLVideoElement;
      vid.muted = false; // Play native video audio
      vid.volume = 1.0;
      vid.play().catch(e => console.warn('Autoplay prevented:', e));
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // No procedural objects to update anymore, the video handles the realism!
  }

  public destroy() {
    if (this.auroraVideoTexture && this.auroraVideoTexture.image) {
      const vid = this.auroraVideoTexture.image as HTMLVideoElement;
      vid.pause();
    }
    this.sceneGroup.clear();
  }
}

