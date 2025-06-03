// 操作类型枚举
export enum OperationType {
  ADD = 'add',
  MOVE = 'move',
  SCALE = 'scale',
  ROTATE = 'rotate',
  DELETE = 'delete',
  COPY = 'copy',
  OPACITY = 'opacity',
}

export interface OperationRecord {
  type: OperationType;
  data: any;
  timestamp: number;
}

class OperationHistory {
  private static instance: OperationHistory;
  private history: OperationRecord[] = [];
  private currentIndex: number = -1;
  private listeners: Set<() => void> = new Set();
  private initialSnapshot: any[] | null = null;  // 存储初始状态的快照

  private constructor() { }

  static getInstance(): OperationHistory {
    if (!OperationHistory.instance) {
      OperationHistory.instance = new OperationHistory();
    }
    return OperationHistory.instance;
  }

  // 添加操作记录
  addOperation(type: OperationType, data: any) {
    const newOperation: OperationRecord = {
      type,
      data,
      timestamp: Date.now(),
    };

    // 如果当前不在最新位置，需要删除当前位置之后的所有记录
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(newOperation);
    this.currentIndex = this.history.length - 1;
    this.notifyListeners();
  }

  // 保存初始状态快照
  saveInitialSnapshot(elements: any[]) {
    this.initialSnapshot = [...elements];  // 创建深拷贝
  }

  // 获取初始状态快照
  getInitialSnapshot(): any[] | null {
    return this.initialSnapshot ? [...this.initialSnapshot] : null;
  }

  // 撤销操作
  undo(): OperationRecord | null {
    console.log('undo start', this.currentIndex)
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const operation = this.history[this.currentIndex];
      this.notifyListeners();
      return operation;
    } else if (this.currentIndex === 0) {
      // 如果是第一个操作，返回初始状态
      this.currentIndex = -1;
      this.notifyListeners();
      // 如果有初始快照，返回初始状态
      if (this.initialSnapshot) {
        return {
          type: OperationType.ADD,
          data: { elements: this.initialSnapshot },
          timestamp: Date.now()
        };
      }
      return null;
    }
    return null;
  }

  // 重做操作
  redo(): OperationRecord | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const operation = this.history[this.currentIndex];
      this.notifyListeners();
      return operation;
    }
    return null;
  }

  // 获取当前操作记录
  getCurrentOperation(): OperationRecord | null {
    return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
  }

  // 获取当前索引
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  // 获取历史记录长度
  getHistoryLength(): number {
    return this.history.length;
  }

  // 获取完整历史记录
  getHistory(): OperationRecord[] {
    return [...this.history];
  }

  // 清空历史记录
  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
    this.initialSnapshot = null;  // 同时清空初始快照
    this.notifyListeners();
  }

  // 添加监听器
  addListener(listener: () => void) {
    this.listeners.add(listener);
  }

  // 移除监听器
  removeListener(listener: () => void) {
    this.listeners.delete(listener);
  }

  // 通知所有监听器
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const operationHistory = OperationHistory.getInstance(); 