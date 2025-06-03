// 画板默认配置
export const DEFAULT_BOARD_CONFIG = {
  ppi: 300, // 默认分辨率：300像素/英寸
} as const

// 刀线默认配置
export const DEFAULT_KNIFE_LINE_CONFIG = {
  color: "rgba(255, 0, 0, 0.5)",
  opacity: 0.5,
  width: 1, // 默认1mm
} as const

// 出血线默认配置
export const DEFAULT_BLEEDING_LINE_CONFIG = {
  color: "rgba(0, 0, 255, 0.5)",
  opacity: 0.5,
  width: 3, // 默认3mm
} as const

// 图片放置方式
export type ImagePlacementType = 'center' | 'fill' | 'custom'
