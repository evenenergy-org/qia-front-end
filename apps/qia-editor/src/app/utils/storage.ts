// IndexedDB 数据库名称和版本
const DB_NAME = 'jigi-board'
const DB_VERSION = 1
const STORE_NAME = 'elements'

// 打开数据库连接
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
  })
}

// 保存数据
export const saveElements = async (elements: any[]): Promise<void> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.put(elements, 'current')
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to save elements:', error)
    throw error
  }
}

// 加载数据
export const loadElements = async (): Promise<any[]> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    return new Promise((resolve, reject) => {
      const request = store.get('current')
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
      transaction.oncomplete = () => db.close()
    })
  } catch (error) {
    console.error('Failed to load elements:', error)
    return []
  }
} 