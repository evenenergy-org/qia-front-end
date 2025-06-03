import React from 'react'
import './Workspace.css'
import { Stage, Layer, Group } from 'react-konva'
import type { BoardProps } from '../Board/Board'
import Board, { BoardRef } from '../Board/Board'
import { mmToPixels } from '../../utils/units'
import { ImageObject } from '../../types/image'
import { LayerPanel } from '../LayerPanel/LayerPanel'
import OperationHistoryButtons from '../OperationHistory/OperationHistoryButtons'

/**
 * 切割线
 */
interface KnifeLineProps {
  visible?: boolean
  color?: string
  width?: number // 单位毫米，切割线宽度, 默认1mm
  style?: React.CSSProperties,
  export?: boolean
}

/**
 * 出血线
 */
interface BleedingLineProps {
  visible?: boolean
  color?: string
  width?: number // 单位毫米，出血线宽度, 默认3mm
  style?: React.CSSProperties
  export?: boolean
}

/**
 * 工作区配置
 */
export interface WorkspaceProps {
  id: string // 工作区id
  width?: number  // 单位像素, 指定工作区高，如不传参则默认填充容器宽度
  height?: number // 单位像素, 指定工作区高，如不传参则默认填充容器高度
  knifeLine?: KnifeLineProps
  bleedingLine?: BleedingLineProps
  board?: BoardProps
  elements?: ImageObject[] // 添加 elements 属性
  onElementsChange?: (elements: ImageObject[]) => void // 添加元素变化回调
  onSelectionChange?: (selectedId: string | null) => void // 添加选中状态变化回调
  stageRef: React.RefObject<any>
  selectedId?: string | null // 添加选中状态属性
}

export const Workspace: React.FC<WorkspaceProps> = React.memo(({
  id,
  width,
  height,
  knifeLine,
  bleedingLine,
  board,
  elements = [],
  onElementsChange,
  onSelectionChange,
  stageRef,
  selectedId
}) => {
  // 获取容器尺寸
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 })
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [displayPPI, setDisplayPPI] = React.useState<number>(300)
  const [shouldRenderBoard, setShouldRenderBoard] = React.useState(false)
  const rafRef = React.useRef<number>()
  const lastResizeTime = React.useRef<number>(0)

  // 创建 Board 的 ref
  const boardRef = React.useRef<BoardRef>(null)

  // 计算画板位置和显示分辨率
  const calculateBoardPosition = React.useCallback(() => {
    if (!board || !containerSize.width || !containerSize.height) return

    // 计算显示用的低分辨率（考虑边距）
    const margin = 0.05
    const maxWidth = containerSize.width * (1 - margin * 2)
    const maxHeight = containerSize.height * (1 - margin * 2)

    // 计算显示用的PPI（确保画板完全显示）
    const newDisplayPPI = Math.min(
      (maxWidth / board.width) * 25.4,
      (maxHeight / board.height) * 25.4
    )

    // 计算刀线宽度（像素）
    const knifeLineWidth = knifeLine?.width ? mmToPixels(knifeLine.width, newDisplayPPI) : 0
    // 只要配置了刀线宽度，就保留空间
    const totalKnifeLineWidth = knifeLine?.width ? knifeLineWidth * 2 : 0

    // 计算出血线宽度（像素）
    const bleedingLineWidth = bleedingLine?.width ? mmToPixels(bleedingLine.width, newDisplayPPI) : 0
    // 只要配置了出血线宽度，就保留空间
    const totalBleedingLineWidth = bleedingLine?.width ? bleedingLineWidth * 2 : 0

    // 使用显示PPI计算画板实际显示尺寸（包含刀线和出血线空间）
    const totalExtraWidth = totalKnifeLineWidth + totalBleedingLineWidth
    const totalExtraHeight = totalKnifeLineWidth + totalBleedingLineWidth
    const displayWidth = mmToPixels(board.width, newDisplayPPI) + totalExtraWidth
    const displayHeight = mmToPixels(board.height, newDisplayPPI) + totalExtraHeight

    // 计算居中位置
    const newX = (containerSize.width - displayWidth) / 2
    const newY = (containerSize.height - displayHeight) / 2

    setPosition({ x: newX, y: newY })
    setDisplayPPI(newDisplayPPI)
    setShouldRenderBoard(true)
  }, [board, containerSize, knifeLine, bleedingLine])

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        setContainerSize({
          width: clientWidth,
          height: clientHeight
        })
      }
    }

    // 初始化尺寸
    updateSize()

    // 只在 Workspace 尺寸不固定时才监听窗口大小变化
    if (!width && !height) {
      const handleResize = () => {
        const now = performance.now()
        // 确保两次更新之间至少间隔 16.67ms (约60fps)
        if (now - lastResizeTime.current >= 16.67) {
          // 取消之前的动画帧
          if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
          }
          // 请求新的动画帧
          rafRef.current = requestAnimationFrame(() => {
            updateSize()
            lastResizeTime.current = now
          })
        }
      }

      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current)
        }
      }
    }
  }, [width, height])

  // 当容器尺寸或画板属性变化时，重新计算位置
  React.useEffect(() => {
    if (containerSize.width && containerSize.height) {
      calculateBoardPosition()
    }
  }, [containerSize, board, calculateBoardPosition])

  // 计算实际使用的宽高
  const stageWidth = width || containerSize.width
  const stageHeight = height || containerSize.height

  // 容器样式
  const containerStyle: React.CSSProperties = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
    position: 'relative'
  }

  // 处理舞台点击
  const handleStageClick = React.useCallback((e: any) => {
    // 如果点击的是舞台本身，说明点击了画板外区域
    if (e.target === e.target.getStage()) {
      // 直接调用 Board 的清除选中状态方法
      boardRef.current?.clearSelection()
      // 通知选中状态变化
      onSelectionChange?.(null)
    }
  }, [onSelectionChange])

  return (
    <div
      ref={containerRef}
      id={id}
      className="workspace"
      style={containerStyle}
    >
      <Stage
        ref={stageRef}
        width={stageWidth}
        height={stageHeight}
        style={{ background: '#f0f0f0' }}
        onClick={handleStageClick}
      >
        <Layer>
          {shouldRenderBoard && board && (
            <Group
              x={position.x}
              y={position.y}
            >
              <Board
                ref={boardRef}
                {...board}
                elements={elements}
                onElementsChange={onElementsChange}
                onSelectionChange={onSelectionChange}
                displayPPI={displayPPI}
                selectedId={selectedId}
                knifeLine={knifeLine}
                bleedingLine={bleedingLine}
              />
            </Group>
          )}
        </Layer>
      </Stage>
      <LayerPanel elements={elements} onElementsChange={onElementsChange} />
      <OperationHistoryButtons onElementsChange={onElementsChange} />
    </div>
  )
})
