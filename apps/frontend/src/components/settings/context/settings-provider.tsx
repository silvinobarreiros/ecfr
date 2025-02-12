'use client'

import isEqual from 'lodash/isEqual'
import { useMemo } from 'react'

import { useLocalStorage } from 'src/hooks/use-local-storage'

import { SettingsValueProps } from '../types'
import { SettingsContext } from './settings-context'

// ----------------------------------------------------------------------

const STORAGE_KEY = 'settings'

type SettingsProviderProps = {
  children: React.ReactNode
  defaultSettings: SettingsValueProps
}

export function SettingsProvider({ children, defaultSettings }: SettingsProviderProps) {
  const { state, update, reset } = useLocalStorage(STORAGE_KEY, defaultSettings)

  const canReset = !isEqual(state, defaultSettings)

  const memoizedValue = useMemo(
    () => ({
      ...state,
      onUpdate: update,
      // Reset
      canReset,
      onReset: reset,
    }),
    [reset, update, state, canReset]
  )

  return <SettingsContext.Provider value={memoizedValue}>{children}</SettingsContext.Provider>
}
