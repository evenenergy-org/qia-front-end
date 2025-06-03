import React, { useEffect, useState, useRef } from 'react'
import { Rect, Circle, Image, Group, Line } from 'react-konva'
import { Close, Redo, Scale } from '@icon-park/react'
import { createKonvaIcon } from '../../utils/iconConverter'
import { calculateMinScale, calculateNewScale } from '../../utils/scale'
import { ImageObject } from '../../types/image'

interface SelectionBoxProps {
  width: number
  height: number
  scale: number
  elementScale: number
  minPixelSize: number
  maxScale: number
  onDelete?: () => void
  onRotate?: (rotation: number) => ImageObject[]
  onRotateEnd?: (updatedElements: ImageObject[]) => void
  onScale?: (scale: number) => ImageObject[]
  onScaleEnd?: (updatedElements: ImageObject[]) => void
  onButtonTouchStart?: () => void
  onButtonTouchEnd?: () => void
  isTouchScaling?: boolean
  debug?: boolean
}

const SelectionBox: React.FC<SelectionBoxProps> = ({ width, height, scale, elementScale, minPixelSize, maxScale, onDelete, onRotate, onRotateEnd, onScale, onScaleEnd, onButtonTouchStart, onButtonTouchEnd, isTouchScaling = false, debug = false }) => {
  // ===== 选择框尺寸参数 =====
  // 按钮相关
  const BUTTON = {
    SIZE: 36 / elementScale, // 按钮整体尺寸
    RADIUS: 18 / elementScale, // 按钮半径 (SIZE / 2)
    ICON_SIZE: 18 / elementScale, // 按钮内图标尺寸
    PADDING: 7 / elementScale, // 按钮内边距
    OFFSET: 9 / elementScale, // 按钮与选择框边框的距离
  } as const

  // 边框相关
  const BORDER = {
    WIDTH: 4 / elementScale, // 边框线条宽度
    OFFSET: 2 / elementScale, // 边框与图片边缘的距离
  } as const

  // 交互相关
  const INTERACTION = {
    SCALE_UPDATE_INTERVAL: 16, // 缩放更新间隔（约60fps）
    MAX_SCALE: maxScale, // 最大缩放比例
    SCALE_SENSITIVITY: 0.5, // 缩放灵敏度
  } as const

  // ===== 状态管理 =====
  const [deleteIcon, setDeleteIcon] = useState<HTMLImageElement | null>(null)
  const [rotateIcon, setRotateIcon] = useState<HTMLImageElement | null>(null)
  const [scaleIcon, setScaleIcon] = useState<HTMLImageElement | null>(null)
  const [touchPoint, setTouchPoint] = useState<{ x: number; y: number } | null>(null)
  const [isRotating, setIsRotating] = useState(false)
  const [isScaling, setIsScaling] = useState(false)

  const currentImageGroupRef = useRef<any>(null)
  const startRotationRef = useRef<number>(0)
  const startScaleRef = useRef<number>(1)
  const lastScaleRef = useRef<number>(1)
  const lastScaleUpdateRef = useRef<number>(0)

  // 计算中心点（相对于 Group）
  const centerX = (width * scale) / 2
  const centerY = (height * scale) / 2

  // 计算两点之间的角度（弧度）
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1)
  }

  // 将角度转换为度数
  const radiansToDegrees = (radians: number) => {
    return radians * (180 / Math.PI)
  }

  // 将角度规范化到0-360度范围内
  const normalizeAngle = (angle: number) => {
    // 将角度转换为0-360度范围
    let normalized = angle % 360
    // 处理负数角度
    if (normalized < 0) {
      normalized += 360
    }
    return normalized
  }

  // 计算最小缩放比例
  const getMinScale = () => {
    return calculateMinScale(width, height, scale, minPixelSize)
  }

  const handleDeleteClick = (e: any) => {
    e.cancelBubble = true
    if (onDelete) {
      onDelete()
    }
  }

  const handleRotateTouchStart = (e: any) => {
    e.cancelBubble = true
    e.evt.stopPropagation()
    e.evt.preventDefault()

    onButtonTouchStart?.()

    // 禁用拖动
    const imageGroup = e.target.getParent().getParent()
    if (imageGroup) {
      imageGroup.draggable(false)
      currentImageGroupRef.current = imageGroup
      startRotationRef.current = imageGroup.rotation() || 0

      // 设置初始触摸点为旋转按钮位置
      setTouchPoint({ x: width * scale + 10, y: -10 })
      setIsRotating(true)
    }

    // 添加全局触摸移动和结束监听
    document.addEventListener('touchmove', handleRotateTouchMove, { passive: false })
    document.addEventListener('touchend', handleRotateTouchEnd)
  }

  const handleRotateTouchMove = (e: any) => {
    e.cancelBubble = true
    e.evt?.stopPropagation()
    e.evt?.preventDefault()

    if (!currentImageGroupRef.current) return

    const imageGroup = currentImageGroupRef.current

    // 1. 图片中心点（SelectionBox坐标系）
    const imageCenterX = centerX
    const imageCenterY = centerY

    // 2. 旋转按钮中心点（SelectionBox坐标系）
    const rotateButtonX = width * scale + 10
    const rotateButtonY = -10

    // 3. 获取当前触摸点坐标
    const touch = e.evt?.touches?.[0] || e.touches?.[0]
    if (!touch) return

    // 获取相对于SelectionBox的指针位置
    const pointerPos = imageGroup.getRelativePointerPosition()
    if (!pointerPos) return

    // 更新触摸点坐标
    setTouchPoint({ x: pointerPos.x, y: pointerPos.y })

    // 计算过程线角度（所有坐标都是SelectionBox坐标系）
    const processAngle = calculateAngle(
      imageCenterX,
      imageCenterY,
      pointerPos.x,
      pointerPos.y
    )

    // 计算需要旋转的角度（所有坐标都是SelectionBox坐标系）
    let angleDiff = processAngle - calculateAngle(
      imageCenterX,
      imageCenterY,
      rotateButtonX,
      rotateButtonY
    )

    // 处理角度跨越 2π 的情况
    if (angleDiff > Math.PI) {
      angleDiff -= 2 * Math.PI
    } else if (angleDiff < -Math.PI) {
      angleDiff += 2 * Math.PI
    }

    // 转换为度数
    const angleInDegrees = radiansToDegrees(angleDiff)

    // 使用上一次的角度作为基准，计算增量
    const lastRotation = imageGroup.rotation() || 0
    const newRotation = normalizeAngle(lastRotation + angleInDegrees)

    if (onRotate) {
      onRotate(newRotation)
    }
  }

  const handleRotateTouchEnd = () => {
    if (onRotateEnd && onRotate && currentImageGroupRef.current) {
      const updatedElements = onRotate(currentImageGroupRef.current.rotation() || 0)
      onRotateEnd(updatedElements)
    }
    // 移除全局监听
    document.removeEventListener('touchmove', handleRotateTouchMove)
    document.removeEventListener('touchend', handleRotateTouchEnd)

    // 恢复拖动
    if (currentImageGroupRef.current) {
      currentImageGroupRef.current.draggable(true)
      currentImageGroupRef.current = null
    }

    // 清除触摸点和旋转状态
    setTouchPoint(null)
    setIsRotating(false)

    onButtonTouchEnd?.()
  }

  const handleScaleTouchStart = (e: any) => {
    e.cancelBubble = true
    e.evt.stopPropagation()
    e.evt.preventDefault()

    onButtonTouchStart?.()

    // 禁用拖动
    const imageGroup = e.target.getParent().getParent()
    if (imageGroup) {
      imageGroup.draggable(false)
      currentImageGroupRef.current = imageGroup
      const currentScale = imageGroup.scaleX() || 1
      startScaleRef.current = currentScale
      lastScaleRef.current = currentScale
      lastScaleUpdateRef.current = Date.now()
      setIsScaling(true)

      // 获取相对于SelectionBox的指针位置
      const pointerPos = imageGroup.getRelativePointerPosition()
      if (pointerPos) {
        // 设置初始触摸点
        setTouchPoint({ x: pointerPos.x, y: pointerPos.y })
      }
    }

    // 添加全局触摸移动和结束监听
    document.addEventListener('touchmove', handleScaleTouchMove, { passive: false })
    document.addEventListener('touchend', handleScaleTouchEnd)
  }

  const handleScaleTouchMove = (e: any) => {
    e.cancelBubble = true
    e.evt?.stopPropagation()
    e.evt?.preventDefault()

    if (!currentImageGroupRef.current) return

    const now = Date.now()
    if (now - lastScaleUpdateRef.current < INTERACTION.SCALE_UPDATE_INTERVAL) {
      return
    }
    lastScaleUpdateRef.current = now

    const imageGroup = currentImageGroupRef.current

    // 获取当前触摸点坐标
    const touch = e.evt?.touches?.[0] || e.touches?.[0]
    if (!touch) return

    // 获取相对于SelectionBox的指针位置
    const pointerPos = imageGroup.getRelativePointerPosition()
    if (!pointerPos) return

    // 更新触摸点坐标
    setTouchPoint({ x: pointerPos.x, y: pointerPos.y })

    // 计算缩放比例
    const distance = Math.sqrt(
      Math.pow(pointerPos.x - centerX, 2) +
      Math.pow(pointerPos.y - centerY, 2)
    )
    const baseDistance = Math.sqrt(
      Math.pow(width * scale + 10 - centerX, 2) +
      Math.pow(height * scale + 10 - centerY, 2)
    )

    // 计算缩放因子
    const scaleFactor = (distance / baseDistance - 1) * INTERACTION.SCALE_SENSITIVITY + 1
    const minScale = getMinScale()
    const clampedScale = calculateNewScale(lastScaleRef.current, scaleFactor, minScale, INTERACTION.MAX_SCALE)

    // 更新上一次的缩放值
    lastScaleRef.current = clampedScale

    if (onScale) {
      onScale(clampedScale)
    }
  }

  const handleScaleTouchEnd = () => {
    if (onScaleEnd && onScale && currentImageGroupRef.current) {
      const updatedElements = onScale(currentImageGroupRef.current.scaleX() || 1)
      onScaleEnd(updatedElements)
    }
    // 移除全局监听
    document.removeEventListener('touchmove', handleScaleTouchMove)
    document.removeEventListener('touchend', handleScaleTouchEnd)

    // 恢复拖动
    if (currentImageGroupRef.current) {
      currentImageGroupRef.current.draggable(true)
      currentImageGroupRef.current = null
    }

    // 清除触摸点和缩放状态
    setTouchPoint(null)
    setIsScaling(false)

    onButtonTouchEnd?.()
  }

  useEffect(() => {
    createKonvaIcon(Close, { fill: '#ffffff', size: BUTTON.ICON_SIZE.toString() }).then(img => {
      setDeleteIcon(img)
    })
    createKonvaIcon(Redo, { fill: '#000000', size: BUTTON.ICON_SIZE.toString() }).then(img => {
      setRotateIcon(img)
    })
    createKonvaIcon(Scale, { fill: '#000000', size: BUTTON.ICON_SIZE.toString() }).then(img => {
      setScaleIcon(img)
    })

    // 清理函数
    return () => {
      document.removeEventListener('touchmove', handleRotateTouchMove)
      document.removeEventListener('touchend', handleRotateTouchEnd)
      document.removeEventListener('touchmove', handleScaleTouchMove)
      document.removeEventListener('touchend', handleScaleTouchEnd)
    }
  }, [])

  // 根据操作状态获取边框颜色
  const getBorderColor = () => {
    if (!debug) return '#2196f3' // 非debug模式下使用默认颜色

    if (isTouchScaling) return '#FFC107' // 双指缩放时的黄色
    if (isRotating) return '#4CAF50' // 旋转时的绿色
    if (isScaling) return '#2196F3' // 缩放时的蓝色
    return '#2196f3' // 默认颜色
  }

  // 根据操作状态获取边框透明度
  const getBorderOpacity = () => {
    if (!debug) return 1 // 非debug模式下不改变透明度

    if (isRotating || isScaling || isTouchScaling) return 0.5 // 操作时降低透明度
    return 1
  }

  return (
    <>
      {/* 选择框边框 */}
      <Rect
        x={-BORDER.OFFSET}
        y={-BORDER.OFFSET}
        width={width * scale + BORDER.OFFSET * 2}
        height={height * scale + BORDER.OFFSET * 2}
        stroke={getBorderColor()}
        strokeWidth={BORDER.WIDTH}
        fill="transparent"
        opacity={getBorderOpacity()}
      />
      {/* 过程线（中心点到触摸点） */}
      {debug && isRotating && touchPoint && (
        <Line
          points={[
            centerX, centerY,
            touchPoint.x, touchPoint.y
          ]}
          stroke="#4CAF50"
          strokeWidth={BORDER.WIDTH}
          dash={[5, 5]}
        />
      )}
      {/* 删除按钮 */}
      <Group
        x={-BORDER.OFFSET}
        y={-BORDER.OFFSET}
      >
        <Circle
          radius={BUTTON.RADIUS}
          fill="#ff4d4f"
          onClick={handleDeleteClick}
          onTap={handleDeleteClick}
        />
        {deleteIcon && (
          <Image
            x={-BUTTON.RADIUS + BUTTON.PADDING}
            y={-BUTTON.RADIUS + BUTTON.PADDING}
            image={deleteIcon}
            width={BUTTON.SIZE - BUTTON.PADDING * 2}
            height={BUTTON.SIZE - BUTTON.PADDING * 2}
            onClick={handleDeleteClick}
            onTap={handleDeleteClick}
          />
        )}
      </Group>
      {/* 旋转按钮 */}
      <Group
        x={width * scale + BORDER.OFFSET}
        y={-BORDER.OFFSET}
        onTouchStart={!isScaling ? handleRotateTouchStart : undefined}
        listening={!isScaling}
      >
        <Circle
          radius={BUTTON.RADIUS}
          fill="#ffffff"
          stroke={debug && isRotating ? '#4CAF50' : '#e0e0e0'}
          strokeWidth={BORDER.WIDTH}
        />
        {rotateIcon && (
          <Image
            x={-BUTTON.RADIUS + BUTTON.PADDING}
            y={-BUTTON.RADIUS + BUTTON.PADDING}
            image={rotateIcon}
            width={BUTTON.SIZE - BUTTON.PADDING * 2}
            height={BUTTON.SIZE - BUTTON.PADDING * 2}
          />
        )}
      </Group>
      {/* 缩放按钮 */}
      <Group
        x={width * scale + BORDER.OFFSET}
        y={height * scale + BORDER.OFFSET}
        onTouchStart={!isRotating ? handleScaleTouchStart : undefined}
        listening={!isRotating}
      >
        <Circle
          radius={BUTTON.RADIUS}
          fill="#ffffff"
          stroke={debug && isScaling ? '#2196F3' : '#e0e0e0'}
          strokeWidth={BORDER.WIDTH}
        />
        {scaleIcon && (
          <Image
            x={-BUTTON.RADIUS + BUTTON.PADDING}
            y={-BUTTON.RADIUS + BUTTON.PADDING}
            image={scaleIcon}
            width={BUTTON.SIZE - BUTTON.PADDING * 2}
            height={BUTTON.SIZE - BUTTON.PADDING * 2}
          />
        )}
      </Group>
      {/* 缩放过程线 */}
      {debug && isScaling && touchPoint && (
        <Line
          points={[
            centerX, centerY,
            touchPoint.x, touchPoint.y
          ]}
          stroke="#2196F3"
          strokeWidth={BORDER.WIDTH}
          dash={[5, 5]}
        />
      )}
    </>
  )
}

export default SelectionBox 