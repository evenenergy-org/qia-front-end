'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageObject } from 'jigi';
import { loadElements } from './utils/storage';
import { Workspace, Toolbar, Contentbar } from 'jigi';

export default function Home() {
  // 将 board 配置提取为常量
  const BOARD_CONFIG = {
    width: 70,
    height: 210,
    ppi: 300
  } as const

  const [elements, setElements] = useState<ImageObject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const stageRef = useRef<any>(null)

  const knifeLineData = {
    visible: true,
    export: true,
    width: 1
  }

  const bleedingLineData = {
    visible: true,
    export: true,
    width: 3
  }

  // 从 IndexedDB 加载保存的元素
  useEffect(() => {
    const loadSavedElements = async () => {
      try {
        const savedElements = await loadElements()
        if (savedElements && savedElements.length > 0) {
          // 恢复图片数据
          const restoredElements = savedElements.map((element: any) => {
            if (element.imageData && element.imageData.startsWith('data:image')) {
              const img = new Image()
              img.src = element.imageData // 直接使用 base64 数据
              return {
                ...element,
                imageData: img
              }
            }
            return element
          })
          setElements(restoredElements)
        }
      } catch (error) {
        console.error('Failed to load saved elements:', error)
      }
    }

    loadSavedElements()
  }, [])

  // 处理元素变化
  const handleElementsChange = (newElements: ImageObject[]) => {
    setElements(newElements)
  }

  // 处理选中状态变化
  const handleSelectionChange = (id: string | null) => {
    setSelectedId(id)
  }

  // 获取当前选中的元素
  const selectedElement = elements.find(el => el.id === selectedId)

  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden">
      <div className="flex flex-col w-full h-full m-0 p-0 min-h-0">
        <div className="flex-1 min-h-0 w-full bg-red-100/10 flex justify-center items-center">
          <Workspace
            id="workspace"
            board={BOARD_CONFIG}
            elements={elements}
            onElementsChange={handleElementsChange}
            onSelectionChange={handleSelectionChange}
            stageRef={stageRef}
            selectedId={selectedId}
            knifeLine={knifeLineData}
            bleedingLine={bleedingLineData}
          />
        </div>
        <div className="flex-none w-full h-auto bg-green-100/10 relative">
          <Toolbar
            onImagesSelected={(images) => {
              // 直接使用传入的完整状态
              setElements(images)
            }}
            boardWidth={BOARD_CONFIG.width}
            boardHeight={BOARD_CONFIG.height}
            boardPpi={BOARD_CONFIG.ppi}
            elements={elements}
            stageRef={stageRef}
            knifeLine={knifeLineData}
            bleedingLine={bleedingLineData}
          />
          <Contentbar
            selectedElement={selectedElement}
            elements={elements}
            onElementsChange={handleElementsChange}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>
    </main>
  );
} 