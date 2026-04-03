import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Sparkles, Check, X, ChevronRight, PenLine, Loader2 } from 'lucide-react'
import { recognizeImage, getApiKey } from '../api/qwen'
import { addQuestion, getAllSubjects, getQuestionTypesBySubject, addSubject, addQuestionType, initDefaultCategories } from '../db/database'

function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [recognizing, setRecognizing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 识别结果
  const [result, setResult] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [questionTypes, setQuestionTypes] = useState([])

  // 用户可调整的分类
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [customSubject, setCustomSubject] = useState('')
  const [customType, setCustomType] = useState('')
  const [annotation, setAnnotation] = useState('')
  const [showCustomSubject, setShowCustomSubject] = useState(false)
  const [showCustomType, setShowCustomType] = useState(false)

  useState(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    await initDefaultCategories()
    const allSubjects = await getAllSubjects()
    setSubjects(allSubjects)
  }

  async function loadQuestionTypes(subject) {
    const types = await getQuestionTypesBySubject(subject)
    setQuestionTypes(types)
  }

  // 选择图片
  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setResult(null)
    setError('')
  }

  // AI识别
  async function handleRecognize() {
    if (!imageFile) {
      setError('请先选择图片')
      return
    }

    if (!getApiKey()) {
      setError('请先在设置页面配置 API Key')
      return
    }

    setRecognizing(true)
    setError('')

    try {
      const recognitionResult = await recognizeImage(imageFile)
      setResult(recognitionResult)
      setSelectedSubject(recognitionResult.subject)
      setSelectedType(recognitionResult.questionType)
      setAnnotation(recognitionResult.keyPoints || '')
      await loadQuestionTypes(recognitionResult.subject)
    } catch (err) {
      setError(err.message)
    } finally {
      setRecognizing(false)
    }
  }

  // 保存错题
  async function handleSave() {
    if (!imageFile) {
      setError('请先选择图片')
      return
    }

    const finalSubject = customSubject || selectedSubject
    const finalType = customType || selectedType

    if (!finalSubject || !finalType) {
      setError('请选择或输入科目和题型')
      return
    }

    setSaving(true)
    setError('')

    try {
      // 如果是新科目，先添加
      if (customSubject && !subjects.find(s => s.name === customSubject)) {
        await addSubject(customSubject)
      }

      // 如果是新题型，先添加
      if (customType) {
        await addQuestionType(customType, finalSubject)
      }

      // 保存错题
      await addQuestion({
        subject: finalSubject,
        questionType: finalType,
        imageFile: imageFile,
        tags: result?.tags || [],
        annotation: annotation,
        difficulty: result?.difficulty || ''
      })

      navigate('/')
    } catch (err) {
      setError('保存失败: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* 上传区域 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        {!imagePreview ? (
          <div
            className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Camera size={28} className="text-indigo-600" />
            </div>
            <p className="text-gray-700 font-medium mb-1">上传错题图片</p>
            <p className="text-gray-400 text-sm">点击拍照或选择图片</p>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="预览"
              className="max-h-[300px] mx-auto rounded-xl"
            />
            <button
              onClick={() => {
                setImageFile(null)
                setImagePreview('')
                setResult(null)
              }}
              className="absolute top-2 right-2 bg-gray-900/80 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 识别按钮 */}
      {imagePreview && !result && (
        <button
          onClick={handleRecognize}
          disabled={recognizing}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-medium shadow-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:shadow-none mb-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          {recognizing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              AI 正在识别...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              开始 AI 识别
            </>
          )}
        </button>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-4 text-sm flex items-center gap-2">
          <X size={16} />
          {error}
        </div>
      )}

      {/* 识别结果 */}
      {result && (
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            AI 识别结果
          </h2>

          {/* 科目选择 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-2 font-medium">科目</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {subjects.map(s => (
                <button
                  key={s.name}
                  onClick={() => {
                    setSelectedSubject(s.name)
                    setCustomSubject('')
                    setShowCustomSubject(false)
                    loadQuestionTypes(s.name)
                  }}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
                    selectedSubject === s.name
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
              <button
                onClick={() => {
                  setShowCustomSubject(!showCustomSubject)
                  setSelectedSubject('')
                }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
                  showCustomSubject
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                + 自定义
              </button>
            </div>
            {showCustomSubject && (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="输入新科目名称"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-2 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            )}
          </div>

          {/* 题型选择 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-2 font-medium">题型</label>
            {questionTypes.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {questionTypes.map(t => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setSelectedType(t.name)
                      setCustomType('')
                      setShowCustomType(false)
                    }}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
                      selectedType === t.name
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowCustomType(!showCustomType)
                    setSelectedType('')
                  }}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
                    showCustomType
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  + 自定义
                </button>
              </div>
            )}
            {(showCustomType || questionTypes.length === 0) && (
              <input
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="输入新题型名称"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-2 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            )}
          </div>

          {/* 知识点标签 */}
          {result.tags?.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-2 font-medium">知识点</label>
              <div className="flex gap-2 flex-wrap">
                {result.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 批注 */}
          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-2 font-medium flex items-center gap-1">
              <PenLine size={14} />
              批注笔记
            </label>
            <textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="添加批注、解题思路、错误原因..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 h-20 resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-medium shadow-md hover:bg-emerald-700 disabled:bg-gray-300 disabled:shadow-none transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check size={20} />
                保存错题
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadPage