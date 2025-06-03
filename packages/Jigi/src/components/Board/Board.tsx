import { useState, useCallback, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Rect, Group, Image, Line } from 'react-konva'
import { mmToPixels } from '../../utils/units'
import { calculateMinScale, calculateNewScale } from '../../utils/scale'
import BoardBackground, { BoardBackgroundType } from './BoardBackground'
import { ImageObject } from '../../types/image'
import { useClickHandler } from '../../hooks/useClickHandler'
import SelectionBox from './SelectionBox'
import { rotateAroundCenter, scaleAroundCenter } from '../../utils/transform'
import { operationHistory, OperationType } from '../../utils/operationHistory'
import { DEFAULT_KNIFE_LINE_CONFIG, DEFAULT_BLEEDING_LINE_CONFIG } from '../../config/constants'

/**
 * 切割线
 */
interface KnifeLineProps {
  visible?: boolean
  color?: string
  width?: number // 单位毫米，切割线宽度, 默认1mm
  style?: React.CSSProperties
  export?: boolean // 是否在导出时包含刀线
}

/**
 * 出血线
 */
interface BleedingLineProps {
  visible?: boolean
  color?: string
  width?: number // 单位毫米，出血线宽度, 默认3mm
  style?: React.CSSProperties
  export?: boolean // 是否在导出时包含出血线
}

export interface BoardProps {
  width: number // 单位毫米, 画布产品的物理尺寸宽度
  height: number // 单位毫米, 画布产品的物理尺寸高度
  ppi?: number // 单位像素/英寸, 画布产品的物理尺寸分辨率, 默认300ppi
  displayPPI?: number // 显示用的PPI，由Workspace计算
  backgroundType?: BoardBackgroundType // 背景类型
  gridSize?: number // 网格大小，默认10像素
  gridColor?: string // 网格颜色，默认#e0e0e0
  elements?: ImageObject[] // 添加 elements 属性
  onElementsChange?: (elements: ImageObject[]) => void // 添加元素变化回调
  onSelectionChange?: (selectedId: string | null) => void // 添加选中状态变化回调
  selectedId?: string | null // 添加选中状态属性
  knifeLine?: KnifeLineProps // 刀线配置
  bleedingLine?: BleedingLineProps // 出血线配置
}

export interface BoardRef {
  clearSelection: () => void
}

const Board = forwardRef<BoardRef, BoardProps>(({
  width,
  height,
  ppi = 300,
  displayPPI,
  gridSize = 10,
  gridColor = '#e0e0e0',
  elements = [],
  onElementsChange,
  onSelectionChange,
  selectedId: externalSelectedId,
  knifeLine,
  bleedingLine
}, ref) => {
  // 计算元素位置和尺寸的缩放比例
  const displayScale = (displayPPI || ppi) / ppi

  // 计算刀线宽度（像素）
  const baseKnifeLineWidth = knifeLine?.width ? mmToPixels(knifeLine.width, ppi) : 0
  const knifeLineWidth = baseKnifeLineWidth * displayScale

  // 计算出血线宽度（像素）
  const baseBleedingLineWidth = bleedingLine?.width ? mmToPixels(bleedingLine.width, ppi) : 0
  const bleedingLineWidth = baseBleedingLineWidth * displayScale

  // 使用显示PPI计算画板在像素单位下的尺寸，并加上刀线和出血线空间
  const totalExtraWidth = (knifeLine?.width ? knifeLineWidth * 2 : 0) + (bleedingLine?.width ? bleedingLineWidth * 2 : 0)
  const totalExtraHeight = (knifeLine?.width ? knifeLineWidth * 2 : 0) + (bleedingLine?.width ? bleedingLineWidth * 2 : 0)
  const pixelWidth = mmToPixels(width, displayPPI || ppi) + totalExtraWidth
  const pixelHeight = mmToPixels(height, displayPPI || ppi) + totalExtraHeight

  // 使用外部传入的选中状态
  const [selectedId, setSelectedId] = useState<string | null>(externalSelectedId || null)

  // 当外部选中状态变化时，更新内部状态
  useEffect(() => {
    setSelectedId(externalSelectedId || null)
  }, [externalSelectedId])

  // 添加触摸状态管理
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(null)
  const [lastDist, setLastDist] = useState<number | null>(null)

  // 添加触摸状态
  const [isTouchScaling, setIsTouchScaling] = useState(false)
  const [isButtonTouched, setIsButtonTouched] = useState(false)

  const maxScale = 5
  const minPixelSize = 50 // 图片在画板中的最小像素尺寸，确保图片不会缩得太小

  // 计算元素的最小缩放比例
  const getMinScale = (element: ImageObject) => {
    return calculateMinScale(element.width, element.height, displayScale, minPixelSize)
  }

  // 计算两点之间的距离
  const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }

  // 计算两点的中心点
  const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    }
  }

  // 修改触摸事件处理函数
  const handleTouchStart = (e: any) => {
    e.evt.preventDefault()
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    // 更新触摸点数量
    const newTouchCount = e.evt.touches.length

    // 获取当前图片组
    const imageGroup = e.target.getParent()
    if (!imageGroup) return

    if (newTouchCount === 2 && !isButtonTouched) {
      // 双指触摸且没有按钮被触摸，启用缩放
      imageGroup.draggable(false)
      setIsTouchScaling(true)

      const center = getCenter(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      const dist = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )

      setLastCenter(center)
      setLastDist(dist)
    } else if (newTouchCount === 1) {
      // 单指触摸，启用拖动，禁用缩放
      imageGroup.draggable(true)
      setIsTouchScaling(false)
      setLastCenter(null)
      setLastDist(null)
    }
  }

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault()
    const touch1 = e.evt.touches[0]
    const touch2 = e.evt.touches[1]

    // 只在双指触摸且没有按钮被触摸时处理缩放
    if (touch1 && touch2 && lastCenter && lastDist && !isButtonTouched) {
      const currentCenter = getCenter(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )
      const currentDist = getDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      )

      const touchScale = currentDist / lastDist

      const selectedElement = elements.find(el => el.id === selectedId)
      if (selectedElement && onElementsChange) {
        const index = elements.findIndex(el => el.id === selectedId)
        // 获取当前元素的最小缩放比例
        const minScale = getMinScale(selectedElement)
        // 限制缩放倍率
        const clampedScale = calculateNewScale(selectedElement.scaleX || 1, touchScale, minScale, maxScale)
        handleScale(index, clampedScale)
      }

      setLastCenter(currentCenter)
      setLastDist(currentDist)
    }
  }

  const handleTouchEnd = (e: any) => {
    e.evt.preventDefault()

    // 更新触摸点数量
    const newTouchCount = e.evt.touches.length

    // 获取当前图片组
    const imageGroup = e.target.getParent()
    if (!imageGroup) return

    if (newTouchCount === 0) {
      // 所有手指都离开，重置状态
      setLastCenter(null)
      setLastDist(null)
      setIsTouchScaling(false)
      setIsButtonTouched(false)
      imageGroup.draggable(true)
    } else if (newTouchCount === 1) {
      // 从双指变为单指，启用拖动，禁用缩放
      imageGroup.draggable(true)
      setIsTouchScaling(false)
      setLastCenter(null)
      setLastDist(null)
    }
  }

  // 添加按钮触摸状态处理函数
  const handleButtonTouchStart = () => {
    setIsButtonTouched(true)
    setIsTouchScaling(false)
  }

  const handleButtonTouchEnd = () => {
    setIsButtonTouched(false)
  }

  // 处理拖拽结束
  const handleDragEnd = (e: any) => {
    if (!onElementsChange) return

    const id = e.target.id()
    const element = elements.find(el => el.id === id)
    if (!element) return

    // 获取最终位置并转换为画板坐标
    const x = e.target.x() / displayScale
    const y = e.target.y() / displayScale

    // 更新元素位置
    const updatedElements = elements.map(el => {
      if (el.id === id) {
        return {
          ...el,
          x,
          y
        }
      }
      return el
    })

    // 移动，保存操作后的状态
    operationHistory.addOperation(OperationType.MOVE, {
      elements: updatedElements
    })

    onElementsChange(updatedElements)
  }

  // 处理点击选择
  const handleSelect = useCallback((element: ImageObject) => {
    setSelectedId(element.id)
    onSelectionChange?.(element.id)
  }, [onSelectionChange])

  // 处理画布点击（取消选择）
  const handleBoardClick = useCallback((e: any) => {
    const target = e.target

    // 通过 id 判断是否点击了背景或边框
    const targetId = target.id()
    if (targetId === 'board-background' || targetId === 'board-border') {
      setSelectedId(null)
      onSelectionChange?.(null)
    }
  }, [onSelectionChange])

  // 使用共享的点击处理 hook
  const boardClickHandler = useClickHandler(handleBoardClick)

  const handleScale = (index: number, newScale: number) => {
    const updatedElements = [...elements]
    const element = updatedElements[index]

    // 获取当前元素的最小缩放比例
    const minScale = getMinScale(element)

    // 限制缩放倍率
    const clampedScale = calculateNewScale(element.scaleX || 1, newScale / (element.scaleX || 1), minScale, maxScale)

    // 计算新的位置和缩放
    const { x, y } = scaleAroundCenter(
      element.x,
      element.y,
      element.width,
      element.height,
      element.rotation,
      element.scaleX || 1,
      clampedScale
    )

    updatedElements[index] = {
      ...element,
      x,
      y,
      scaleX: clampedScale,
      scaleY: clampedScale
    }

    if (onElementsChange) {
      onElementsChange(updatedElements)
    }
    return updatedElements
  }

  // 暴露清除选中状态的方法
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      setSelectedId(null)
      onSelectionChange?.(null)
    }
  }))

  // 保存初始状态快照
  useEffect(() => {
    // 只在 elements 数量变化且历史记录为空时保存快照
    if (elements.length > 0 && operationHistory.getHistoryLength() === 0) {
      const prevElementsLength = operationHistory.getInitialSnapshot()?.length || 0;
      if (elements.length !== prevElementsLength) {
        console.log('save initial snapshot', elements);
        operationHistory.saveInitialSnapshot(elements);
      }
    }
  }, [elements.length]); // 只监听 elements 长度的变化

  return (
    <Group
      {...boardClickHandler}
    >
      {/* 背景和裁剪区域 */}
      <Group
        id="board-background"
        clipFunc={(ctx) => {
          ctx.beginPath()
          ctx.rect(0, 0, pixelWidth, pixelHeight)
          ctx.closePath()
        }}
      >
        <BoardBackground
          width={pixelWidth}
          height={pixelHeight}
          gridSize={gridSize}
          gridColor={gridColor}
        />
      </Group>

      {/* 画板边框 */}
      <Rect
        id="board-border"
        width={pixelWidth}
        height={pixelHeight}
        fill="transparent"
        stroke="#e0e0e0"
        strokeWidth={1}
      />

      {/* 渲染图片元素 */}
      {elements.map((element, index) => {
        const selectHandler = useClickHandler(() => handleSelect(element))
        return (
          <Group
            key={element.id}
            id={element.id}
            x={element.x * displayScale}
            y={element.y * displayScale}
            rotation={element.rotation}
            scaleX={element.scaleX}
            scaleY={element.scaleY}
            visible={element.visible}
            draggable={true}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...selectHandler}
          >
            {element.imageData && (
              <Image
                image={element.imageData}
                width={element.width * displayScale}
                height={element.height * displayScale}
                opacity={element.opacity}
              />
            )}
            {/* 选中状态边框 */}
            {selectedId === element.id && (
              <SelectionBox
                debug={true}
                width={element.width}
                height={element.height}
                scale={displayScale}
                elementScale={element.scaleX}
                minPixelSize={minPixelSize}
                maxScale={maxScale}
                isTouchScaling={isTouchScaling}
                onButtonTouchStart={handleButtonTouchStart}
                onButtonTouchEnd={handleButtonTouchEnd}
                onDelete={() => {
                  if (onElementsChange) {
                    const updatedElements = elements.filter(el => el.id !== element.id)
                    // 记录删除后的状态
                    operationHistory.addOperation(OperationType.DELETE, {
                      elements: updatedElements
                    })
                    onElementsChange(updatedElements)
                    setSelectedId(null)
                  }
                }}
                onRotate={(angle) => {
                  if (onElementsChange) {
                    const updatedElements = elements.map(el => {
                      if (el.id === element.id) {
                        const newPosition = rotateAroundCenter(el, angle)
                        return {
                          ...el,
                          x: newPosition.x,
                          y: newPosition.y,
                          rotation: newPosition.rotation
                        }
                      }
                      return el
                    })
                    onElementsChange(updatedElements)
                    return updatedElements
                  }
                  return elements
                }}
                onRotateEnd={(updatedElements) => {
                  operationHistory.addOperation(OperationType.ROTATE, {
                    elements: updatedElements
                  })
                }}
                onScale={(newScale) => handleScale(index, newScale)}
                onScaleEnd={(updatedElements) => {
                  operationHistory.addOperation(OperationType.SCALE, {
                    elements: updatedElements
                  })
                }}
              />
            )}
          </Group>
        )
      })}

      {/* 出血线层 */}
      {bleedingLine?.visible && bleedingLineWidth > 0 && (
        <Group>
          {/* 上出血线 */}
          <Line
            points={[
              bleedingLineWidth / 2, bleedingLineWidth / 2,
              pixelWidth - bleedingLineWidth / 2, bleedingLineWidth / 2
            ]}
            stroke={bleedingLine.color || DEFAULT_BLEEDING_LINE_CONFIG.color}
            strokeWidth={bleedingLineWidth}
            dash={[bleedingLineWidth, bleedingLineWidth]}
            opacity={DEFAULT_BLEEDING_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 下出血线 */}
          <Line
            points={[
              bleedingLineWidth / 2, pixelHeight - bleedingLineWidth / 2,
              pixelWidth - bleedingLineWidth / 2, pixelHeight - bleedingLineWidth / 2
            ]}
            stroke={bleedingLine.color || DEFAULT_BLEEDING_LINE_CONFIG.color}
            strokeWidth={bleedingLineWidth}
            dash={[bleedingLineWidth, bleedingLineWidth]}
            opacity={DEFAULT_BLEEDING_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 左出血线 */}
          <Line
            points={[
              bleedingLineWidth / 2, bleedingLineWidth / 2,
              bleedingLineWidth / 2, pixelHeight - bleedingLineWidth / 2
            ]}
            stroke={bleedingLine.color || DEFAULT_BLEEDING_LINE_CONFIG.color}
            strokeWidth={bleedingLineWidth}
            dash={[bleedingLineWidth, bleedingLineWidth]}
            opacity={DEFAULT_BLEEDING_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 右出血线 */}
          <Line
            points={[
              pixelWidth - bleedingLineWidth / 2, bleedingLineWidth / 2,
              pixelWidth - bleedingLineWidth / 2, pixelHeight - bleedingLineWidth / 2
            ]}
            stroke={bleedingLine.color || DEFAULT_BLEEDING_LINE_CONFIG.color}
            strokeWidth={bleedingLineWidth}
            dash={[bleedingLineWidth, bleedingLineWidth]}
            opacity={DEFAULT_BLEEDING_LINE_CONFIG.opacity}
            listening={false}
          />
        </Group>
      )}

      {/* 刀线层 */}
      {knifeLine?.visible && knifeLineWidth > 0 && (
        <Group>
          {/* 上刀线 */}
          <Line
            points={[
              bleedingLineWidth + knifeLineWidth / 2, bleedingLineWidth + knifeLineWidth / 2,
              pixelWidth - bleedingLineWidth - knifeLineWidth / 2, bleedingLineWidth + knifeLineWidth / 2
            ]}
            stroke={knifeLine.color || DEFAULT_KNIFE_LINE_CONFIG.color}
            strokeWidth={knifeLineWidth}
            dash={[knifeLineWidth * 2, knifeLineWidth * 2]}
            opacity={DEFAULT_KNIFE_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 下刀线 */}
          <Line
            points={[
              bleedingLineWidth + knifeLineWidth / 2, pixelHeight - bleedingLineWidth - knifeLineWidth / 2,
              pixelWidth - bleedingLineWidth - knifeLineWidth / 2, pixelHeight - bleedingLineWidth - knifeLineWidth / 2
            ]}
            stroke={knifeLine.color || DEFAULT_KNIFE_LINE_CONFIG.color}
            strokeWidth={knifeLineWidth}
            dash={[knifeLineWidth * 2, knifeLineWidth * 2]}
            opacity={DEFAULT_KNIFE_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 左刀线 */}
          <Line
            points={[
              bleedingLineWidth + knifeLineWidth / 2, bleedingLineWidth + knifeLineWidth / 2,
              bleedingLineWidth + knifeLineWidth / 2, pixelHeight - bleedingLineWidth - knifeLineWidth / 2
            ]}
            stroke={knifeLine.color || DEFAULT_KNIFE_LINE_CONFIG.color}
            strokeWidth={knifeLineWidth}
            dash={[knifeLineWidth * 2, knifeLineWidth * 2]}
            opacity={DEFAULT_KNIFE_LINE_CONFIG.opacity}
            listening={false}
          />
          {/* 右刀线 */}
          <Line
            points={[
              pixelWidth - bleedingLineWidth - knifeLineWidth / 2, bleedingLineWidth + knifeLineWidth / 2,
              pixelWidth - bleedingLineWidth - knifeLineWidth / 2, pixelHeight - bleedingLineWidth - knifeLineWidth / 2
            ]}
            stroke={knifeLine.color || DEFAULT_KNIFE_LINE_CONFIG.color}
            strokeWidth={knifeLineWidth}
            dash={[knifeLineWidth * 2, knifeLineWidth * 2]}
            opacity={DEFAULT_KNIFE_LINE_CONFIG.opacity}
            listening={false}
          />
        </Group>
      )}
    </Group>
  )
})

export default Board