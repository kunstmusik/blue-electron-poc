/**
 * LineColors — color configuration for automation parameter lines.
 * Mirrors the Java LineColors class.
 */
export class LineColors {
  static readonly DEFAULT_COLORS: number[] = [
    0xff6666, 0x66ff66, 0x6666ff, 0xffff66,
    0xff66ff, 0x66ffff, 0xff9966, 0x99ff66,
  ];

  private _colors: number[] = [...LineColors.DEFAULT_COLORS];

  getColors(): number[] {
    return [...this._colors];
  }

  getColor(index: number): number {
    return this._colors[index % this._colors.length];
  }

  setColors(colors: number[]): void {
    this._colors = [...colors];
  }
}
