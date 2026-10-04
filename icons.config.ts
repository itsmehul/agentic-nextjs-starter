export type IconStyle = "outlined" | "rounded" | "sharp";

export type IconsConfig = {
  style: IconStyle;
  /** 0 = outlined glyph, 1 = filled glyph. */
  fill: 0 | 1;
  /** 100–700 */
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** -25, 0 or 200 */
  grade: -25 | 0 | 200;
  /** 20–48 */
  opticalSize: number;
  /** Pixel size used when an icon has no size class or `size` prop. */
  size: number;
  /** Any CSS color. `currentColor` follows the surrounding text color. */
  color: string;
};

const iconsConfig: IconsConfig = {
  style: "outlined",
  fill: 0,
  weight: 400,
  grade: 0,
  opticalSize: 24,
  size: 24,
  color: "currentColor",
};

export default iconsConfig;
