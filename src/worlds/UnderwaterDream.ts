import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class UnderwaterDream implements IDreamWorld {
  public id = 'underwater';
  public name = 'Ocean Depths';
  public icon = '🐠';
  public subtitle = 'Real Google Street View underwater coral reef in 360°';
  public cozyQuote = 'Drift gently through the warm blue waters... surrounded by the real coral reef and ocean life.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'water';
  public isUnderwaterOrCosmic = true;
  public spawnPosition = new THREE.Vector3(0, 3, 0);
  public returnPortalPosition = new THREE.Vector3(0, 1, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@-23.4428,151.9149,3a,75y,180h,90t/data=!3m5!1e1';
  public streetViewLocation = 'Great Barrier Reef, Australia (Google Ocean Street View)';

  private videoTexture!: THREE.VideoTexture;

  public init() {
    this.setupLighting();
    this.buildInvisibleFloor();
    this.buildImmersiveVideoSky();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0x00f5d4, 0x03045e, 1.4);
    this.sceneGroup.add(hemiLight);

    const sunbeam = new THREE.DirectionalLight(0xa9d6e5, 1.8);
    sunbeam.position.set(5, 25, 5);
    this.sceneGroup.add(sunbeam);
  }

  private buildImmersiveVideoSky() {
    // Immersive Flat Video Screen
    this.videoTexture = TextureHelper.load360VideoTexture('/videos/underwater.mp4');
    
    // Massive flat cinema screen: 16:9 ratio
    const skyGeo = new THREE.PlaneGeometry(160, 90);
    const skyMat = new THREE.MeshBasicMaterial({
      map: this.videoTexture,
      fog: false,
      side: THREE.DoubleSide
    });
    const photoSphere = new THREE.Mesh(skyGeo, skyMat);
    
    // Place screen straight ahead of the spawn position
    photoSphere.position.set(0, 15, -80);
    this.sceneGroup.add(photoSphere);
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
    // Video handles realism
  }

  public destroy() {
    if (this.videoTexture && this.videoTexture.image) {
      const vid = this.videoTexture.image as HTMLVideoElement;
      vid.pause();
      vid.currentTime = 0;
    }
    this.sceneGroup.clear();
  }
}
