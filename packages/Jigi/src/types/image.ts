export interface ImageObject {
  id: string;
  name: string;
  format: string;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  x: number;
  y: number;
  opacity: number;
  visible: boolean;
  imageData?: HTMLImageElement;
} 