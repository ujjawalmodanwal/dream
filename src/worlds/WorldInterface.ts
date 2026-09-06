import * as THREE from 'three';

export interface PortalData {
  id: string;
  name: string;
  icon: string;
  description: string;
  quote: string;
  position: THREE.Vector3;
  color: number;
}

export interface IDreamWorld {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  cozyQuote: string;
  surfaceType: 'grass' | 'stone' | 'snow' | 'water';
  isUnderwaterOrCosmic: boolean;
  spawnPosition: THREE.Vector3;
  returnPortalPosition: THREE.Vector3;
  sceneGroup: THREE.Group;
  streetViewUrl?: string;
  streetViewLocation?: string;
  init(): void;
  update(delta: number, playerPos: THREE.Vector3): void;
  destroy(): void;
}
