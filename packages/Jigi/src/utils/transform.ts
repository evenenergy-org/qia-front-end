import { ImageObject } from "../types/image"
import Konva from "konva"

// 计算旋转点
const rotatePoint = ({ x, y }: { x: number; y: number }, rad: number) => {
  const rcos = Math.cos(rad)
  const rsin = Math.sin(rad)
  return { x: x * rcos - y * rsin, y: y * rcos + x * rsin }
}

// 围绕中心点旋转
const rotateAroundCenter = (element: ImageObject, rotation: number) => {
  // 计算当前旋转原点(0, 0)相对于期望的原点(中心点)的位置
  const topLeft = {
    x: -(element.width * element.scaleX) / 2,
    y: -(element.height * element.scaleY) / 2
  }

  // 计算当前旋转后的位置
  const current = rotatePoint(topLeft, Konva.getAngle(element.rotation || 0))
  // 计算目标旋转后的位置
  const rotated = rotatePoint(topLeft, Konva.getAngle(rotation))

  // 计算位置偏移量
  const dx = rotated.x - current.x
  const dy = rotated.y - current.y

  return {
    x: element.x + dx,
    y: element.y + dy,
    rotation
  }
}

// 围绕中心点缩放
const scaleAroundCenter = (
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  oldScale: number,
  newScale: number
) => {
  // 计算当前缩放原点(0, 0)相对于期望的原点(中心点)的位置
  const topLeft = {
    x: -(width * oldScale) / 2,
    y: -(height * oldScale) / 2
  }

  // 计算当前旋转后的位置
  const current = rotatePoint(topLeft, Konva.getAngle(rotation))

  // 计算新的缩放后的位置
  const newTopLeft = {
    x: -(width * newScale) / 2,
    y: -(height * newScale) / 2
  }
  const scaled = rotatePoint(newTopLeft, Konva.getAngle(rotation))

  // 计算位置偏移量
  const dx = scaled.x - current.x
  const dy = scaled.y - current.y

  return {
    x: x + dx,
    y: y + dy
  }
}

export { rotateAroundCenter, scaleAroundCenter }