import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useThemeStore } from '@/core/theme/theme-store'
import { MainLayout } from '@/layouts/main-layout'
import { HomePage } from '@/pages/home'
import { SettingsRoute } from '@/pages/settings'
import { ProfilePage } from '@/pages/profile'
import { TrashPage } from '@/pages/trash'

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
