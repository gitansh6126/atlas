import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useThemeStore } from '@/core/theme/theme-store'
import { MainLayout } from '@/layouts/main-layout'
import { HomePage } from '@/pages/home'
import { SettingsRoute } from '@/pages/settings'
import { ProfilePage } from '@/pages/profile'
import { TrashPage } from '@/pages/trash'
import { seedDatabase } from '@/core/database/seed'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { logger } from '@/core/storage/logger'

export default function App() {
  const theme = useThemeStore((s) => s.theme)
  const loadWorkspaces = useWorkspaceStore((s) => s.loadWorkspaces)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    async function init() {
      try {
        await seedDatabase()
        await loadWorkspaces()
      } catch (error) {
        logger.error('Failed to initialize app:', error)
      } finally {
        setInitialized(true)
      }
    }
    init()
  }, [loadWorkspaces])

  if (!initialized) {
    return null
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsRoute />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/trash" element={<TrashPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
