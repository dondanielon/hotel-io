export class MathUtils {
  static distance2D(x1: number, z1: number, x2: number, z2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(z1 - z2, 2));
  }
}
