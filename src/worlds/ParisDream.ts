import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class ParisDream implements IDreamWorld {
  public id = 'paris';
  public name = 'Paris & Eiffel Tower';
  public icon = '🗼';
  public subtitle = 'Twilight on the Champ de Mars with real Parisian lights';
  public cozyQuote = 'The City of Lights glows with romance and wonder... look at the Eiffel Tower sparkle in the twilight.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'stone';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 8);
  public returnPortalPosition = new THREE.Vector3(0, 0, 16);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@48.85837,2.294481,3a,75y,312h,115t/data=!3m6!1e1';
  public streetViewLocation = 'Champ de Mars & Eiffel Tower, Paris, France';

  private videoTexture!: THREE.VideoTexture;

  public init() {
    this.setupLighting();
    this.buildInvisibleFloor();
    this.buildImmersiveVideoSky();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffbe0b, 0x1d3557, 0.8);
    this.sceneGroup.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfdf0d5, 0.9);
    dirLight.position.set(15, 30, 20);
    this.sceneGroup.add(dirLight);
  }

  private buildImmersiveVideoSky() {
    // Immersive Flat Video Screen
    this.videoTexture = TextureHelper.load360VideoTexture('/videos/paris.mp4');
    
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
    // Playlist video handles realism
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
