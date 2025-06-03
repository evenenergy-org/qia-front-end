/**
 * 计算元素的最小缩放比例
 * @param width 元素宽度
 * @param height 元素高度
 * @param scale 当前缩放比例
 * @param minPixelSize 最小像素尺寸
 * @returns 最小缩放比例
 */
export const calculateMinScale = (
  width: number,
  height: number,
  scale: number,
  minPixelSize: number = 50
): number => {
  // 计算图片在画板中的实际像素大小
  const pixelWidth = width * scale
  const pixelHeight = height * scale

  // 计算需要的最小缩放比例，确保图片至少有一个维度不小于最小像素尺寸
  const widthScale = minPixelSize / pixelWidth
  const heightScale = minPixelSize / pixelHeight

  // 取较大的缩放比例，确保两个维度都不小于最小像素尺寸
  return Math.max(widthScale, heightScale)
}

/**
 * 计算缩放后的新比例
 * @param currentScale 当前缩放比例
 * @param scaleFactor 缩放因子
 * @param minScale 最小缩放比例
 * @param maxScale 最大缩放比例
 * @returns 新的缩放比例
 */
export const calculateNewScale = (
  currentScale: number,
  scaleFactor: number,
  minScale: number,
  maxScale: number
): number => {
  const newScale = currentScale * scaleFactor
  return Math.max(minScale, Math.min(maxScale, newScale))
} 