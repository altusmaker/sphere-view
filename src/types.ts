export type ProjectionMode = 'equirectangular' | 'fisheye_single' | 'fisheye_dual' | 'little_planet';

export interface Hotspot {
  id: string;
  title: string;
  description: string;
  yaw: number; // In degrees (-180 to 180)
  pitch: number; // In degrees (-90 to 90)
  icon?: string;
  imageUrl?: string; // Optional attached photo image
  targetPanoramaId?: string; // For navigation between spots
}

export interface FisheyeParams {
  radius: number; // 0.1 to 1.0
  centerX: number; // 0.0 to 1.0
  centerY: number; // 0.0 to 1.0
  fovScale: number; // 0.5 to 2.0
  distortion: number; // -1.0 to 1.0
}

export interface PanoramaItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Fisheye 360' | 'Street View' | 'Architecture' | 'Nature' | 'Custom';
  url: string;
  thumbnailUrl?: string;
  projectionMode: ProjectionMode;
  fisheyeParams?: FisheyeParams;
  initialYaw?: number;
  initialPitch?: number;
  initialFov?: number;
  hotspots?: Hotspot[];
  locationName?: string;
  dateTaken?: string;
  cameraModel?: string;
}

export interface ViewerState {
  yaw: number; // horizontal angle in degrees
  pitch: number; // vertical angle in degrees
  fov: number; // field of view in degrees (30 to 110)
  isAutoRotating: boolean;
  autoRotateSpeed: number;
  showHotspots: boolean;
  showCompass: boolean;
  projectionMode: ProjectionMode;
  fisheyeParams: FisheyeParams;
}
