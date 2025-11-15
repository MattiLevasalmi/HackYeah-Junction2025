import { Object3D } from "three";

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      primitive: {
        object: Object3D;
        [key: string]: any;
      };
    }
  }
}