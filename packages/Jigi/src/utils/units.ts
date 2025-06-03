/**
 * 将毫米转换为像素
 * @param mm 毫米值
 * @param ppi 每英寸像素数，默认300
 * @returns 像素值
 */
export const mmToPixels = (mm: number, ppi: number = 300): number => {
  // 1英寸 = 25.4毫米
  return (mm / 25.4) * ppi
}

/**
 * 将像素转换为毫米
 * @param pixels 像素值
 * @param ppi 每英寸像素数，默认300
 * @returns 毫米值
 */
export const pixelsToMm = (pixels: number, ppi: number = 300): number => {
  // 1英寸 = 25.4毫米
  return (pixels * 25.4) / ppi
} 