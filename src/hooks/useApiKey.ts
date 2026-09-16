import { useState } from 'react'
import { getApiKey } from '../lib/generator'

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || ''
    }
    return ''
  })

  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const envApiKey = getApiKey()
  const hasEnvKey = Boolean(envApiKey)
  const isKeyAvailable = Boolean(hasEnvKey || apiKey.trim())
  const resolvedApiKey = getApiKey(apiKey)

  const handleApiKeyChange = (val: string) => {
    setApiKey(val)
    if (typeof localStorage !== 'undefined') {
      if (val.trim()) {
        localStorage.setItem('gemini_api_key', val.trim())
      } else {
        localStorage.removeItem('gemini_api_key')
      }
    }
  }

  return {
    apiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    handleApiKeyChange,
    envApiKey,
    hasEnvKey,
    isKeyAvailable,
    resolvedApiKey,
  }
}
