import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthStore.jsx'
import { ProjectProvider } from './store/ProjectStore.jsx'
import { WebMCPProvider } from './webmcp/WebMCPProvider.jsx'
import TopBar from './components/TopBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FilmStudio from './pages/FilmStudio.jsx'
import LoginPage from './pages/LoginPage.jsx'

import LandingPage from './pages/LandingPage.jsx'

function Shell() {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-studio-950 overflow-hidden">
      <TopBar />
      <main className="flex-1 min-h-0">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/studio/:projectId" element={<FilmStudio />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <WebMCPProvider>
          <HashRouter>
            <Routes>
              {/* Standalone Landing Page Route */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />

              {/* Standalone Login Route with its own cinematic fullscreen layout */}
              <Route path="/login" element={<LoginPage />} />

              {/* Main Studio Shell */}
              <Route path="/*" element={<Shell />} />
            </Routes>
          </HashRouter>
        </WebMCPProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
