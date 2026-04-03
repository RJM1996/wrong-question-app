import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Plus, Filter, X } from 'lucide-react'
import { db, initDefaultCategories, getAllQuestions, getAllSubjects, getQuestionTypesBySubject } from '../db/database'

function HomePage() {
  const [questions, setQuestions] = useState([])
  const [subjects, setSubjects] = useState([])
  const [questionTypes, setQuestionTypes] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('全部')
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedSubject && selectedSubject !== '全部') {
      loadQuestionTypes(selectedSubject)
    } else {
      setQuestionTypes([])
      setSelectedType('')
    }
  }, [selectedSubject])

  async function loadData() {
    await initDefaultCategories()
    const allQuestions = await getAllQuestions()
    const allSubjects = await getAllSubjects()
    setQuestions(allQuestions)
    setSubjects(allSubjects)
    setLoading(false)
  }

  async function loadQuestionTypes(subject) {
    const types = await getQuestionTypesBySubject(subject)
    setQuestionTypes(types)
  }

  // 筛选错题
  const filteredQuestions = questions.filter(q => {
    if (selectedSubject !== '全部' && q.subject !== selectedSubject) return false
    if (selectedType && q.questionType !== selectedType) return false
    return true
  })

  // 按科目分组
  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    const key = `${q.subject}-${q.questionType}`
    if (!acc[key]) {
      acc[key] = {
        subject: q.subject,
        questionType: q.questionType,
        items: []
      }
    }
    acc[key].items.push(q)
    return acc
  }, {})

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

  return (
    <div>
      {/* 科目筛选 Tab */}
      <div className="bg-white rounded-2xl p-3 mb-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedSubject('全部')
              setSelectedType('')
            }}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-colors ${
              selectedSubject === '全部'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {subjects.map(s => (
            <button
              key={s.name}
              onClick={() => {
                setSelectedSubject(s.name)
                setSelectedType('')
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
        </div>
      </div>

      {/* 题型筛选 Tab（选中科目后显示） */}
      {selectedSubject !== '全部' && questionTypes.length > 0 && (
        <div className="bg-white rounded-2xl p-3 mb-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedType('')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                selectedType === ''
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              全部题型
            </button>
            {questionTypes.map(t => (
              <button
                key={t.name}
                onClick={() => setSelectedType(t.name)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedType === t.name
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 数量统计 */}
      <div className="text-gray-500 text-sm mb-4 px-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <FileText size={14} className="text-gray-400" />
          共 {filteredQuestions.length} 道错题
        </span>
        {(selectedSubject !== '全部' || selectedType) && (
          <button
            onClick={() => {
              setSelectedSubject('全部')
              setSelectedType('')
            }}
            className="text-indigo-600 flex items-center gap-1 text-xs hover:text-indigo-700"
          >
            <X size={12} />
            清除筛选
          </button>
        )}
      </div>

      {/* 错题列表 */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 mb-2 font-medium">还没有错题记录</p>
          <p className="text-gray-400 text-sm mb-6">上传你的第一道错题开始整理</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            上传错题
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedQuestions).map(group => (
            <div key={`${group.subject}-${group.questionType}`}>
              {/* 分类标题 */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-sm font-semibold text-gray-900">
                  {group.subject}
                </span>
                <span className="text-gray-300 text-xs">/</span>
                <span className="text-sm text-gray-500">
                  {group.questionType}
                </span>
                <span className="text-xs text-gray-400 ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                  {group.items.length}
                </span>
              </div>

              {/* 错题卡片 - 横向滚动 */}
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {group.items.map(q => (
                  <Link
                    key={q.id}
                    to={`/question/${q.id}`}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0 w-36 snap-start hover:shadow-md transition-shadow cursor-pointer"
                  >
                    {/* 图片 */}
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      {q.imageUrl ? (
                        <img
                          src={q.imageUrl}
                          alt="错题"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText size={32} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="p-3">
                      <div className="flex gap-1 overflow-hidden">
                        {q.tags?.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded truncate"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage