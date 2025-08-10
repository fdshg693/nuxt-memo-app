import { ref, onUnmounted, readonly } from 'vue'

interface ExecutionResult {
  type: 'log' | 'error' | 'warn';
  args: string;
}

interface SandboxMessage {
  type: 'ready' | 'result' | 'error';
  requestId?: string;
  logs?: ExecutionResult[];
  error?: string;
}

export const useSecureJavaScriptExecution = () => {
  const isReady = ref(false)
  const isExecuting = ref(false)
  const results = ref<ExecutionResult[]>([])
  const error = ref<string>('')
  
  let iframe: HTMLIFrameElement | null = null
  let currentRequestId = 0
  let messageHandler: ((event: MessageEvent) => void) | null = null
  
  const initializeSandbox = () => {
    return new Promise<void>((resolve, reject) => {
      if (iframe) {
        resolve()
        return
      }
      
      iframe = document.createElement('iframe')
      
      // Critical: Set sandbox attribute WITHOUT allow-same-origin for opaque origin
      iframe.sandbox.add('allow-scripts')
      iframe.src = '/sandbox.html'
      iframe.style.display = 'none'
      
      // Set up message handler
      messageHandler = (event: MessageEvent<SandboxMessage>) => {
        // Only accept messages from our sandbox
        if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
          return
        }
        
        switch (event.data.type) {
          case 'ready':
            isReady.value = true
            resolve()
            break
            
          case 'result':
            isExecuting.value = false
            results.value = event.data.logs || []
            error.value = ''
            break
            
          case 'error':
            isExecuting.value = false
            results.value = []
            error.value = event.data.error || 'エラーが発生しました'
            break
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      // Set timeout for initialization
      const initTimeout = setTimeout(() => {
        reject(new Error('サンドボックスの初期化がタイムアウトしました'))
      }, 10000)
      
      iframe.onload = () => {
        clearTimeout(initTimeout)
      }
      
      iframe.onerror = () => {
        clearTimeout(initTimeout)
        reject(new Error('サンドボックスの読み込みに失敗しました'))
      }
      
      document.body.appendChild(iframe)
    })
  }
  
  const executeCode = async (code: string) => {
    if (!iframe || !isReady.value) {
      await initializeSandbox()
    }
    
    if (isExecuting.value) {
      error.value = '既に実行中のコードがあります'
      return
    }
    
    // Clear previous results
    results.value = []
    error.value = ''
    isExecuting.value = true
    
    const requestId = (++currentRequestId).toString()
    
    try {
      iframe!.contentWindow!.postMessage({
        type: 'execute',
        code: code,
        requestId: requestId
      }, '*')
    } catch (err) {
      isExecuting.value = false
      error.value = 'コードの送信に失敗しました'
    }
  }
  
  const terminateExecution = () => {
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'terminate' }, '*')
    }
    isExecuting.value = false
  }
  
  const clearResults = () => {
    results.value = []
    error.value = ''
  }
  
  const cleanup = () => {
    if (messageHandler) {
      window.removeEventListener('message', messageHandler)
      messageHandler = null
    }
    
    if (iframe) {
      document.body.removeChild(iframe)
      iframe = null
    }
    
    isReady.value = false
    isExecuting.value = false
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    isReady: readonly(isReady),
    isExecuting: readonly(isExecuting),
    results: readonly(results),
    error: readonly(error),
    executeCode,
    terminateExecution,
    clearResults,
    initializeSandbox,
    cleanup
  }
}