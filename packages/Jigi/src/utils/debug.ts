import VConsole from 'vconsole'

class Debug {
  private static instance: Debug
  private vConsole: VConsole | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): Debug {
    if (!Debug.instance) {
      Debug.instance = new Debug()
    }
    return Debug.instance
  }

  init() {
    if (this.isInitialized) {
      console.log('vConsole 已经初始化')
      return
    }

    console.log('正在初始化 vConsole...')
    console.log('当前环境:', process.env.NODE_ENV)
    console.log('是否应该启用调试:', this.shouldEnableDebug())

    // 强制在开发环境下启用
    if (process.env.NODE_ENV === 'development') {
      this.initializeVConsole()
      return
    }

    // 在生产环境下，根据 URL 参数决定是否启用
    if (this.shouldEnableDebug()) {
      this.initializeVConsole()
    } else {
      console.log('当前环境不需要初始化 vConsole')
    }
  }

  private initializeVConsole() {
    try {
      this.vConsole = new VConsole({
        theme: 'dark',
        defaultPlugins: ['system', 'network', 'element', 'storage'],
        maxLogNumber: 1000,
        onReady: () => {
          console.log('vConsole 已准备就绪')
          // 添加一个初始日志
          this.log('vConsole 初始化成功')
        }
      })
      this.isInitialized = true
      console.log('vConsole 初始化成功')
    } catch (error) {
      console.error('vConsole 初始化失败:', error)
    }
  }

  private shouldEnableDebug(): boolean {
    // 可以通过 URL 参数、localStorage 或其他方式控制是否启用调试
    const urlParams = new URLSearchParams(window.location.search)
    const shouldEnable = urlParams.get('debug') === 'true'
    console.log('URL 参数 debug:', urlParams.get('debug'))
    console.log('是否应该启用调试:', shouldEnable)
    return shouldEnable
  }

  // 添加日志
  log(...args: any[]) {
    console.log('[Debug]', ...args)
  }

  // 添加警告
  warn(...args: any[]) {
    console.warn('[Debug]', ...args)
  }

  // 添加错误
  error(...args: any[]) {
    console.error('[Debug]', ...args)
  }

  // 添加信息
  info(...args: any[]) {
    console.info('[Debug]', ...args)
  }

  // 清除所有日志
  clear() {
    console.clear()
  }
}

// 导出单例实例
export const debug = Debug.getInstance()

// 导出类型
export type DebugType = typeof debug 