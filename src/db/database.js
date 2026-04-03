import Dexie from 'dexie'

// 创建数据库
export const db = new Dexie('WrongQuestionDB')

db.version(1).stores({
  // 错题表
  questions: '++id, subject, questionType, tags, createdAt',
  // 分类表（动态生成）
  subjects: 'name',
  questionTypes: 'name, subject'
})

// 初始化默认分类
export async function initDefaultCategories() {
  const subjectsCount = await db.subjects.count()
  if (subjectsCount === 0) {
    // 添加默认科目
    await db.subjects.bulkAdd([
      { name: '语文', color: '#ef4444' },
      { name: '数学', color: '#3b82f6' },
      { name: '英语', color: '#22c55e' },
      { name: '物理', color: '#f59e0b' },
      { name: '化学', color: '#8b5cf6' },
      { name: '生物', color: '#06b6d4' }
    ])

    // 添加默认题型
    await db.questionTypes.bulkAdd([
      // 语文
      { name: '文言文', subject: '语文' },
      { name: '阅读理解', subject: '语文' },
      { name: '古诗', subject: '语文' },
      { name: '作文', subject: '语文' },
      // 数学
      { name: '几何', subject: '数学' },
      { name: '函数', subject: '数学' },
      { name: '代数', subject: '数学' },
      { name: '概率统计', subject: '数学' },
      // 英语
      { name: '完形填空', subject: '英语' },
      { name: '阅读理解', subject: '英语' },
      { name: '语法', subject: '英语' },
      { name: '写作', subject: '英语' }
    ])
  }
}

// 添加错题
export async function addQuestion(data) {
  // 将图片 Blob 转为 base64 存储
  let imageDataBase64 = data.imageUrl
  if (data.imageFile && data.imageFile instanceof Blob) {
    imageDataBase64 = await blobToBase64(data.imageFile)
  }

  const question = {
    subject: data.subject,
    questionType: data.questionType,
    imageUrl: imageDataBase64,  // 存储 base64
    tags: data.tags || [],
    annotation: data.annotation || '',
    difficulty: data.difficulty || '',
    createdAt: new Date().toISOString()
  }
  const id = await db.questions.add(question)
  return id
}

// Blob 转 base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 获取所有错题
export async function getAllQuestions() {
  return await db.questions.orderBy('createdAt').reverse().toArray()
}

// 按科目获取错题
export async function getQuestionsBySubject(subject) {
  return await db.questions.where('subject').equals(subject).reverse().sortBy('createdAt')
}

// 按题型获取错题
export async function getQuestionsByType(questionType) {
  return await db.questions.where('questionType').equals(questionType).reverse().sortBy('createdAt')
}

// 更新错题
export async function updateQuestion(id, data) {
  await db.questions.update(id, data)
}

// 删除错题
export async function deleteQuestion(id) {
  await db.questions.delete(id)
}

// 获取所有科目
export async function getAllSubjects() {
  return await db.subjects.toArray()
}

// 获取某科目下的所有题型
export async function getQuestionTypesBySubject(subject) {
  return await db.questionTypes.where('subject').equals(subject).toArray()
}

// 添加新科目
export async function addSubject(name, color = '#6b7280') {
  return await db.subjects.add({ name, color })
}

// 添加新题型
export async function addQuestionType(name, subject) {
  return await db.questionTypes.add({ name, subject })
}