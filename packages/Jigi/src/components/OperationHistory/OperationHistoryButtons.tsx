import React from 'react'
import { Undo, Redo } from '@icon-park/react'
import { useState, useEffect } from 'react'
import { operationHistory, OperationType } from '../../utils/operationHistory'
import './OperationHistoryButtons.css'

interface OperationHistoryButtonsProps {
  onElementsChange?: (elements: any[]) => void;
}

const OperationHistoryButtons: React.FC<OperationHistoryButtonsProps> = ({ onElementsChange }) => {
  const [historyLength, setHistoryLength] = useState(0)
  const [currentOperation, setCurrentOperation] = useState(operationHistory.getCurrentOperation())
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const updateState = () => {
      setHistoryLength(operationHistory.getHistoryLength())
      setCurrentOperation(operationHistory.getCurrentOperation())
    }

    // 添加监听器
    operationHistory.addListener(updateState)
    // 初始化状态
    updateState()

    // 清理监听器
    return () => {
      operationHistory.removeListener(updateState)
    }
  }, [])

  // 检查是否可以撤销
  const canUndo = currentOperation !== null && operationHistory.getCurrentIndex() >= 0
  // 检查是否可以重做
  const canRedo = historyLength > 0 && operationHistory.getCurrentIndex() < historyLength - 1

  // 处理撤销操作
  const handleUndo = () => {
    const operation = operationHistory.undo()
    if (onElementsChange) {
      // 如果 operation 为 null，说明已经撤销到初始状态，将 elements 设置为空数组
      onElementsChange(operation?.data.elements || [])
    }
  }

  // 处理重做操作
  const handleRedo = () => {
    const operation = operationHistory.redo()
    if (operation && onElementsChange) {
      // 更新画板状态
      onElementsChange(operation.data.elements)
    }
  }

  // 获取操作类型的中文描述
  const getOperationTypeText = (type: OperationType) => {
    const typeMap: Record<OperationType, string> = {
      [OperationType.MOVE]: '移动',
      [OperationType.SCALE]: '缩放',
      [OperationType.ROTATE]: '旋转',
      [OperationType.DELETE]: '删除',
      [OperationType.COPY]: '复制',
      [OperationType.ADD]: '添加',
      [OperationType.OPACITY]: '透明度'
    }
    return typeMap[type] || type
  }

  return (
    <div className="absolute left-4 bottom-4">
      <div className="flex items-center gap-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="撤销"
        >
          <Undo
            size={24}
            className={canUndo ? 'text-gray-600' : 'text-gray-400'}
          />
        </button>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded hover:bg-gray-100"
          title="查看历史记录"
        >
          <div className="text-sm text-gray-600">历史{operationHistory.getHistoryLength()}</div>
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="重做"
        >
          <Redo
            size={24}
            className={canRedo ? 'text-gray-600' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* 历史记录列表 */}
      {showHistory && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
          <div className="text-sm font-medium text-gray-700 mb-2">操作历史</div>
          <div className="space-y-1">
            {operationHistory.getHistory().map((operation, index) => (
              <div
                key={operation.timestamp}
                className={`text-xs p-1 rounded ${index === operationHistory.getCurrentIndex()
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600'
                  }`}
              >
                {getOperationTypeText(operation.type)} - {new Date(operation.timestamp).toLocaleTimeString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationHistoryButtons 