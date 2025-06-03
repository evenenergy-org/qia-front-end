import React from 'react'
import { Line, Circle, Rect } from 'react-konva'

export type BoardBackgroundType = 'grid' | 'dots' | 'transparent'

interface BoardBackgroundProps {
  width: number
  height: number
  type?: BoardBackgroundType
  gridSize?: number
  gridColor?: string
}

const BoardBackground: React.FC<BoardBackgroundProps> = ({
  width,
  height,
  type = 'transparent',
  gridSize = 10,
  gridColor = '#e0e0e0'
}) => {
  // 生成网格线
  const generateGridLines = () => {
    const lines = []
    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      )
    }
    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke={gridColor}
          strokeWidth={1}
          listening={false}
        />
      )
    }
    return lines
  }

  // 生成点阵
  const generateDots = () => {
    const dots = []
    for (let x = 0; x <= width; x += gridSize) {
      for (let y = 0; y <= height; y += gridSize) {
        dots.push(
          <Circle
            key={`dot-${x}-${y}`}
            x={x}
            y={y}
            radius={1}
            fill={gridColor}
            listening={false}
          />
        )
      }
    }
    return dots
  }

  // 生成透明网格
  const generateTransparentGrid = () => {
    const squares = []
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        if ((Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0) {
          squares.push(
            <Rect
              key={`square-${x}-${y}`}
              x={x}
              y={y}
              width={gridSize}
              height={gridSize}
              fill={gridColor}
              listening={false}
            />
          )
        }
      }
    }
    return squares
  }

  // 根据类型渲染不同的背景
  const renderBackground = () => {
    switch (type) {
      case 'grid':
        return generateGridLines()
      case 'dots':
        return generateDots()
      case 'transparent':
        return generateTransparentGrid()
      default:
        return generateGridLines() // 默认使用网格线
    }
  }

  return <>{renderBackground()}</>
}

export default BoardBackground 