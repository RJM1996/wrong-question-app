import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, PenLine, Tag, Calendar, Check, X, ZoomIn } from 'lucide-react'
import { db, updateQuestion, deleteQuestion, getQuestionTypesBySubject } from '../db/database'
import ImageZoomViewer from '../components/ImageZoomViewer'

function QuestionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [annotation, setAnnotation] = useState('')
  const [questionTypes, setQuestionTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fullscreenImage, setFullscreenImage] = useState(null)

  useEffect(() => {
    loadQuestion()
  }, [id])

  async function loadQuestion() {
    const q = await db.questions.get(Number(id))
    if (q) {
      setQuestion(q)
      setAnnotation(q.annotation || '')
      setSelectedType(q.questionType)
      const types = await getQuestionTypesBySubject(q.subject)
      setQuestionTypes(types)
    }
    setLoading(false)
  }

  async function handleSaveAnnotation() {
    await updateQuestion(Number(id), {
      annotation,
      questionType: selectedType
    })
    setEditing(false)
    loadQuestion()
  }

  async function handleDelete() {
    await deleteQuestion(Number(id))
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="text-gray-400 text-sm">加载中...</div>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <X size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-500 mb-2 font-medium">未找到该错题</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={18} />
          返回
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
        >
          <Trash2 size={18} />
          删除
        </button>
      </div>

      {/* 分类信息 */}
      <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            {question.subject}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">
            {question.questionType}
          </span>
        </div>
        {question.tags?.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {question.tags.map(tag => (
              <span
                key={tag}
                className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
          <Calendar size={12} />
          {new Date(question.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* 图片 */}
      <div
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => question.imageUrl && setFullscreenImage(question.imageUrl)}
      >
        {question.imageUrl ? (
          <div className="relative">
            <img
              src={question.imageUrl}
              alt="错题"
              className="w-full rounded-xl"
            />
            <div className="absolute bottom-2 right-2 bg-gray-900/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <ZoomIn size={12} />
              点击放大
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-300 py-12">
            <X size={48} className="mx-auto mb-2" />
            <p className="text-sm">无图片</p>
          </div>
        )}
      </div>

      {/* 批注区域 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <PenLine size={18} className="text-indigo-600" />
            批注
          </h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1"
            >
              <PenLine size={14} />
              编辑
            </button>
          )}
        </div>

        {editing ? (
          <div>
            {/* 题型调整 */}
            <div className="mb-3">
              <label className="block text-sm text-gray-500 mb-2 font-medium">题型</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {questionTypes.map(t => (
                  <button
                    key={t.name}
                    onClick={() => setSelectedType(t.name)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      selectedType === t.name
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 批注编辑 */}
            <textarea
              value={annotation}
              onChange={(e) => setAnnotation(e.target.value)}
              placeholder="添加批注、解题思路、错误原因..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 h-24 resize-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSaveAnnotation}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                保存
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setAnnotation(question.annotation || '')
                  setSelectedType(question.questionType)
                }}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X size={18} />
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600 py-2 leading-relaxed">
            {question.annotation || (
              <span className="text-gray-400 italic">暂无批注，点击编辑添加</span>
            )}
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <p className="text-gray-900 font-semibold">确定删除这道错题吗？</p>
              <p className="text-gray-400 text-sm mt-1">删除后无法恢复</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium shadow-md hover:bg-red-700 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 图片放大弹窗 */}
      {fullscreenImage && (
        <ImageZoomViewer
          imageUrl={fullscreenImage}
          onClose={() => setFullscreenImage(null)}
        />
      )}
    </div>
  )
}

export default QuestionDetailPage