import * as THREE from 'three';
import { IDreamWorld } from './WorldInterface';
import { TextureHelper } from '../utils/TextureHelper';

export class ItalyDream implements IDreamWorld {
  public id = 'italy';
  public name = 'Italian Trattoria & Pizza';
  public icon = '🍕';
  public subtitle = 'A rustic Italian patio with fresh Neapolitan wood-fired pizza';
  public cozyQuote = 'Benvenuto! The wood oven is warm, and the table is set with freshly baked pizza.';
  public surfaceType: 'grass' | 'stone' | 'snow' | 'water' = 'stone';
  public isUnderwaterOrCosmic = false;
  public spawnPosition = new THREE.Vector3(0, 0, 4);
  public returnPortalPosition = new THREE.Vector3(0, 0, 10);
  public sceneGroup = new THREE.Group();

  public streetViewUrl = 'https://www.google.com/maps/@41.8893,12.4704,3a,75y,120h,90t/data=!3m6!1e1';
  public streetViewLocation = 'Trastevere Piazza & Pizzeria, Rome, Italy';

  private fairyLights: THREE.PointLight[] = [];
  private time: number = 0;

  public init() {
    this.setupLighting();
    this.buildTerracottaPatio();
    this.buildBrickPergola();
    this.buildFairyLights();
    this.buildDiningTablesAndPizzas();
    this.buildReturnPortal();
  }

  private setupLighting() {
    const hemiLight = new THREE.HemisphereLight(0xffbe0b, 0x3a0ca3, 0.95);
    this.sceneGroup.add(hemiLight);

    const warmSun = new THREE.DirectionalLight(0xffe3a8, 1.4);
    warmSun.position.set(15, 25, 10);
    this.sceneGroup.add(warmSun);
  }

  private buildTerracottaPatio() {
    const geo = new THREE.PlaneGeometry(40, 40);
    const tileTex = TextureHelper.createTerracottaTexture();
    const mat = new THREE.MeshStandardMaterial({
      map: tileTex,
      roughness: 0.75,
      metalness: 0.05
    });
    const patio = new THREE.Mesh(geo, mat);
    patio.rotation.x = -Math.PI / 2;
    patio.receiveShadow = true;
    this.sceneGroup.add(patio);

    // Tuscan cypress trees
    const cypressMat = new THREE.MeshStandardMaterial({ color: 0x224c36, roughness: 0.8 });
    for (let c = 0; c < 12; c++) {
      const angle = (c / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 16;
      const z = Math.sin(angle) * 16;

      const tree = new THREE.Mesh(new THREE.ConeGeometry(0.8, 6, 8), cypressMat);
      tree.position.set(x, 3, z);
      tree.castShadow = true;
      this.sceneGroup.add(tree);
    }
  }

  private buildBrickPergola() {
    const pergola = new THREE.Group();
    pergola.position.set(0, 0, 0);

    const brickMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.85 });
    const woodTex = TextureHelper.createWoodPlankTexture();
    const woodBeamMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x386641, roughness: 0.7 });

    const corners = [
      { x: -5, z: -5 },
      { x: 5, z: -5 },
      { x: -5, z: 5 },
      { x: 5, z: 5 }
    ];

    corners.forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.2, 0.7), brickMat);
      pillar.position.set(pos.x, 2.1, pos.z);
      pillar.castShadow = true;
      pergola.add(pillar);
    });

    for (let i = -5; i <= 5; i += 2.5) {
      const beamX = new THREE.Mesh(new THREE.BoxGeometry(11, 0.25, 0.25), woodBeamMat);
      beamX.position.set(0, 4.3, i);
      pergola.add(beamX);

      const beamZ = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 11), woodBeamMat);
      beamZ.position.set(i, 4.4, 0);
      pergola.add(beamZ);
    }

    for (let v = 0; v < 14; v++) {
      const vine = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.random() * 0.25, 8, 8), vineMat);
      vine.position.set((Math.random() - 0.5) * 8, 4.1 - Math.random() * 0.6, (Math.random() - 0.5) * 8);
      pergola.add(vine);
    }

    this.sceneGroup.add(pergola);
  }

  private buildFairyLights() {
    for (let i = -3; i <= 3; i += 2) {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xffd166 })
      );
      bulb.position.set(i, 3.9, 0);
      this.sceneGroup.add(bulb);

      const light = new THREE.PointLight(0xffbe0b, 1.4, 8);
      light.position.set(i, 3.8, 0);
      this.sceneGroup.add(light);
      this.fairyLights.push(light);
    }
  }

  private buildDiningTablesAndPizzas() {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 0);

    const woodTex = TextureHelper.createWoodPlankTexture();
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.8 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.0), woodMat);
    top.position.y = 0.9;
    tableGroup.add(top);

    [
      { x: -1.4, z: -0.8 },
      { x: 1.4, z: -0.8 },
      { x: -1.4, z: 0.8 },
      { x: 1.4, z: 0.8 }
    ].forEach(p => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), woodMat);
      leg.position.set(p.x, 0.45, p.z);
      tableGroup.add(leg);
    });

    const clothMat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.85 });
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.05, 1.8), clothMat);
    cloth.position.y = 0.97;
    tableGroup.add(cloth);

    // Realistic Wood-Fired Pizza with real photograph texture 🍕
    const pizzaGroup = new THREE.Group();
    pizzaGroup.position.set(0, 1.02, 0);

    const peel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.04, 24), woodMat);
    pizzaGroup.add(peel);

    const pizzaPhotoTex = TextureHelper.loadPhotoTexture('/textures/pizza.jpg');
    const pizzaMat = new THREE.MeshStandardMaterial({
      map: pizzaPhotoTex,
      roughness: 0.6,
      metalness: 0.05
    });
    const pizzaDisc = new THREE.Mesh(new THREE.CircleGeometry(0.76, 32), pizzaMat);
    pizzaDisc.rotation.x = -Math.PI / 2;
    pizzaDisc.position.y = 0.06;
    pizzaGroup.add(pizzaDisc);

    // Crust rim
    const crustMat = new THREE.MeshStandardMaterial({ color: 0xc48b52, roughness: 0.75 });
    const crustRing = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.07, 12, 32), crustMat);
    crustRing.rotation.x = Math.PI / 2;
    crustRing.position.y = 0.06;
    pizzaGroup.add(crustRing);

    // Fresh green basil leaves
    const basilMat = new THREE.MeshStandardMaterial({ color: 0x38b000, roughness: 0.6 });
    for (let b = 0; b < 5; b++) {
      const angle = (b / 5) * Math.PI * 2 + 0.3;
      const basil = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), basilMat);
      basil.rotation.x = Math.PI / 2;
      basil.position.set(Math.cos(angle) * 0.28, 0.08, Math.sin(angle) * 0.28);
      pizzaGroup.add(basil);
    }

    const glassMat = new THREE.MeshStandardMaterial({ color: 0x52b788, transparent: true, opacity: 0.6, metalness: 0.8 });
    const oilBottle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.45, 12), glassMat);
    oilBottle.position.set(1.0, 1.25, 0.4);
    tableGroup.add(oilBottle);

    tableGroup.add(pizzaGroup);

    [-1.8, 1.8].forEach(x => {
      const chair = new THREE.Group();
      chair.position.set(x, 0, 0);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), woodMat);
      seat.position.y = 0.5;
      chair.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.06), woodMat);
      back.position.set(0, 0.8, x > 0 ? 0.27 : -0.27);
      chair.add(back);

      tableGroup.add(chair);
    });

    this.sceneGroup.add(tableGroup);
  }

  private buildReturnPortal() {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(this.returnPortalPosition);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xf77f00, roughness: 0.5 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 12, 24), stoneMat);
    arch.position.y = 1.6;
    portalGroup.add(arch);

    const glow = new THREE.PointLight(0xd62828, 1.8, 8);
    glow.position.set(0, 1.6, 0);
    portalGroup.add(glow);

    this.sceneGroup.add(portalGroup);
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    this.time += delta;

    this.fairyLights.forEach((light, i) => {
      light.intensity = 1.2 + Math.sin(this.time * 6 + i) * 0.25;
    });
  }

  public destroy() {
    this.sceneGroup.clear();
  }
}
