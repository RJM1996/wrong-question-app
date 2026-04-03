import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Home, Camera, Settings, BookOpen } from 'lucide-react'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import SettingsPage from './pages/SettingsPage'

// 底部导航组件
function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/upload', icon: Camera, label: '上传' },
    { path: '/settings', icon: Settings, label: '设置' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 z-50 pb-safe">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <a
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 pb-16">
        {/* 顶部标题栏 */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-40">
          <div className="px-4 py-3 flex items-center justify-center gap-2">
            <BookOpen size={20} className="text-indigo-600" strokeWidth={2.5} />
            <h1 className="text-lg font-bold text-gray-900">错题本</h1>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="px-4 py-4 max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/question/:id" element={<QuestionDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>

        {/* 底部导航 */}
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App