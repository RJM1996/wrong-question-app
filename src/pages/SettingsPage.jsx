import { useState, useEffect } from 'react'
import { Key, BookOpen, FileText, Info, Eye, EyeOff, Plus, Check, ChevronDown } from 'lucide-react'
import { getApiKey, setApiKey } from '../api/qwen'
import { getAllSubjects, getQuestionTypesBySubject, addSubject, addQuestionType, initDefaultCategories } from '../db/database'

function SettingsPage() {
  const [apiKey, setApiKeyState] = useState('')
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [questionTypes, setQuestionTypes] = useState([])
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)

  // 新增分类
  const [newSubject, setNewSubject] = useState('')
  const [newType, setNewType] = useState('')
  const [newTypeSubject, setNewTypeSubject] = useState('')
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddType, setShowAddType] = useState(false)

  useEffect(() => {
    loadData()
    setApiKeyState(getApiKey())
  }, [])

  async function loadData() {
    await initDefaultCategories()
    const allSubjects = await getAllSubjects()
    setSubjects(allSubjects)
    if (allSubjects.length > 0) {
      setSelectedSubject(allSubjects[0].name)
      loadTypes(allSubjects[0].name)
    }
  }

  async function loadTypes(subject) {
    const types = await getQuestionTypesBySubject(subject)
    setQuestionTypes(types)
  }

  function handleSaveApiKey() {
    setApiKey(apiKey)
    setApiKeySaved(true)
    setTimeout(() => setApiKeySaved(false), 2000)
  }

  async function handleAddSubject() {
    if (!newSubject.trim()) return
    await addSubject(newSubject.trim())
    setNewSubject('')
    setShowAddSubject(false)
    loadData()
  }

  async function handleAddType() {
    if (!newType.trim() || !newTypeSubject) return
    await addQuestionType(newType.trim(), newTypeSubject)
    setNewType('')
    setShowAddType(false)
    if (selectedSubject === newTypeSubject) {
      loadTypes(newTypeSubject)
    }
  }

  return (
    <div>
      {/* API Key 配置 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Key size={18} className="text-indigo-600" />
          API 配置
        </h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-500 mb-2 font-medium">通义千问 API Key</label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              placeholder="输入 API Key"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            从阿里云百炼平台获取 API Key
          </p>
        </div>

        <button
          onClick={handleSaveApiKey}
          className={`w-full py-3 rounded-xl font-medium shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            apiKeySaved
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {apiKeySaved ? (
            <>
              <Check size={18} />
              已保存
            </>
          ) : (
            '保存 API Key'
          )}
        </button>
      </div>

      {/* 科目管理 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-600" />
          科目管理
        </h2>

        {/* 科目列表 */}
        <div className="flex gap-2 flex-wrap mb-3">
          {subjects.map(s => (
            <span
              key={s.name}
              className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              {s.name}
            </span>
          ))}
        </div>

        {/* 添加新科目 */}
        {showAddSubject ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="输入科目名称"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
            <button
              onClick={handleAddSubject}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:bg-emerald-700 transition-colors"
            >
              添加
            </button>
            <button
              onClick={() => {
                setShowAddSubject(false)
                setNewSubject('')
              }}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddSubject(true)}
            className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            添加新科目
          </button>
        )}
      </div>

      {/* 题型管理 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <FileText size={18} className="text-indigo-600" />
          题型管理
        </h2>

        {/* 选择科目查看题型 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-500 mb-2 font-medium">选择科目</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value)
              loadTypes(e.target.value)
            }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 appearance-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
          >
            {subjects.map(s => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-9 text-gray-400 pointer-events-none" />
        </div>

        {/* 题型列表 */}
        <div className="flex gap-2 flex-wrap mb-3">
          {questionTypes.map(t => (
            <span
              key={t.name}
              className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              {t.name}
            </span>
          ))}
        </div>

        {/* 添加新题型 */}
        {showAddType ? (
          <div className="space-y-2">
            <select
              value={newTypeSubject}
              onChange={(e) => setNewTypeSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 appearance-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
            >
              <option value="">选择科目</option>
              {subjects.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                placeholder="输入题型名称"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              <button
                onClick={handleAddType}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-md hover:bg-emerald-700 transition-colors"
              >
                添加
              </button>
              <button
                onClick={() => {
                  setShowAddType(false)
                  setNewType('')
                }}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddType(true)}
            className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            添加新题型
          </button>
        )}
      </div>

      {/* 使用说明 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Info size={18} className="text-indigo-600" />
          使用说明
        </h2>
        <div className="text-gray-600 text-sm space-y-3 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xs">1</span>
            <span>在此页面配置 API Key</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xs">2</span>
            <span>点击「上传」选择或拍照错题</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xs">3</span>
            <span>AI 自动识别科目、题型、知识点</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xs">4</span>
            <span>调整分类、添加批注后保存</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-xs">5</span>
            <span>在首页按分类筛选查看</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage