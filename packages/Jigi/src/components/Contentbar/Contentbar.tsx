import React, { useState, useEffect } from 'react'
import { GridNine, Copy, Cutting } from '@icon-park/react'
import { ImageObject } from '../../types/image'
import './Contentbar.css'
import { operationHistory, OperationType } from '/src/utils/operationHistory';

interface ContentbarProps {
  selectedElement?: ImageObject;
  onElementsChange: (elements: ImageObject[]) => void;
  elements: ImageObject[];
  onSelectionChange: (id: string | null) => void;
}

const Contentbar: React.FC<ContentbarProps> = ({
  selectedElement,
  onElementsChange,
  elements,
  onSelectionChange
}) => {
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 处理复制
  const handleCopy = () => {
    if (!selectedElement) return;
    
    // 创建新元素的副本
    const newElement: ImageObject = {
      ...selectedElement,
      id: `img_${Date.now()}`,
      x: selectedElement.x + 40, // 向右偏移 10 个单位
      y: selectedElement.y + 40, // 向下偏移 10 个单位
    }

    // 更新元素列表
    const newElements = [...elements, newElement]
    
    // 记录复制后的状态，保存完整的元素列表
    operationHistory.addOperation(OperationType.COPY, {
      elements: newElements
    })

    // 更新元素列表
    onElementsChange(newElements)

    // 选中新复制的元素
    onSelectionChange(newElement.id)
  }

  // 处理透明度变化
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedElement) return;
    
    const newOpacity = parseInt(e.target.value) / 100;
    
    // 更新实际元素的透明度
    const updatedElements = elements.map(element => {
      if (element.id === selectedElement.id) {
        return {
          ...element,
          opacity: newOpacity
        };
      }
      return element;
    });
    onElementsChange(updatedElements);
  };

  // 处理滑动结束
  const handleOpacityChangeEnd = () => {
    // 记录透明度变化操作
    operationHistory.addOperation(OperationType.OPACITY, {
      elements: elements
    });
  };

  // 当选中元素变化时，显示工具栏
  useEffect(() => {
    if (selectedElement) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className={`contentbar ${isVisible ? 'show' : ''}`}>
        <div className="relative">
          <button
            className="contentbar-button"
            title="透明度"
            disabled
          >
            <GridNine theme="outline" size="24" fill="#999" />
          </button>
        </div>
        <button
          className="contentbar-button"
          title="复制"
          disabled
        >
          <Copy theme="outline" size="24" fill="#999" />
        </button>
        <button
          className="contentbar-button"
          title="裁剪"
          disabled
        >
          <Cutting theme="outline" size="24" fill="#999" />
        </button>
      </div>
    );
  }

  return (
    <div className={`contentbar ${isVisible ? 'show' : ''}`}>
      <div className="relative">
        <button
          className="contentbar-button"
          title="透明度"
          onClick={() => setShowOpacitySlider(!showOpacitySlider)}
        >
          <GridNine theme="outline" size="24" fill="#333" />
        </button>
        {showOpacitySlider && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-3 w-48">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={selectedElement.opacity * 100}
                onChange={handleOpacityChange}
                onMouseUp={handleOpacityChangeEnd}
                onTouchEnd={handleOpacityChangeEnd}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 w-12 text-right">
                {Math.round(selectedElement.opacity * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
      <button
        className="contentbar-button"
        title="复制"
        onClick={handleCopy}
      >
        <Copy theme="outline" size="24" fill="#333" />
      </button>
      <button
        className="contentbar-button"
        title="裁剪"
      >
        <Cutting theme="outline" size="24" fill="#333" />
      </button>
    </div>
  )
}

export { Contentbar } 