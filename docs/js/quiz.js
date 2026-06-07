const QUIZ_PATHS = {
  data: { nameAr: 'تحليل البيانات والذكاء الاصطناعي', nameEn: 'Data & AI', color: '#3B82F6' },
  dev: { nameAr: 'تطوير البرمجيات والمنتج', nameEn: 'Software & Product', color: '#8B5CF6' },
  marketing: { nameAr: 'التسويق الرقمي والمحتوى', nameEn: 'Digital Marketing', color: '#F59E0B' },
  ux: { nameAr: 'تصميم تجربة المستخدم', nameEn: 'UX Design', color: '#EC4899' },
  ops: { nameAr: 'إدارة المشاريع والعمليات', nameEn: 'Project & Operations', color: '#10B981' },
  procurement: { nameAr: 'المشتريات وسلاسل الإمداد', nameEn: 'Procurement & Supply Chain', color: '#14B8A6' }
};

const QUIZ_OPTIONS = {
  q1: [
    { text: 'تحليل أرقام وإيجاد أنماط وحلول عملية', scores: { data: 3, procurement: 1 } },
    { text: 'بناء منتجات أو أدوات تقنية متكاملة', scores: { dev: 3, ux: 1 } },
    { text: 'إقناع الآخرين، التواصل والتفاوض الفعال', scores: { marketing: 3, procurement: 2 } },
    { text: 'تنظيم الأعمال والترتيب التشغيلي للمهام', scores: { ops: 3, procurement: 2 } }
  ],
  q2: [
    { text: 'مشاريع تعتمد على تحليل البيانات والأرقام', scores: { data: 3, ops: 1 } },
    { text: 'بناء مواقع وتطبيقات تفاعلية متكاملة', scores: { dev: 3, ux: 1 } },
    { text: 'حملات تسويقية وتنسيق حضور رقمي جذاب', scores: { marketing: 3, ux: 1 } },
    { text: 'إدارة المخازن والمشتريات وتنسيق سلاسل الإمداد', scores: { procurement: 3, ops: 2 } }
  ],
  q3: [
    { text: 'بشكل مستقل مع إجراء أبحاث وتحليلات دقيقة', scores: { data: 2, dev: 2 } },
    { text: 'ضمن فريق عمل برمجيات أو منتجات تقنية', scores: { dev: 3, ops: 1 } },
    { text: 'مع عملاء وجماهير وموردين بشكل مباشر', scores: { marketing: 3, procurement: 2 } },
    { text: 'التفاوض وإدارة العمليات اللوجستية وتوزيع المهام', scores: { procurement: 3, ops: 2 } }
  ]
};

const QUIZ_QUESTIONS = [
  { id: 'q1', text: 'عند التفكير في مجال عملك المفضل، أيهم يصف شغفك أكثر؟' },
  { id: 'q2', text: 'ما نوع المهام والمشاريع التي تجذبك للعمل عليها؟' },
  { id: 'q3', text: 'كيف تفضّل المساهمة ضمن بيئة الشركة الناشئة؟' }
];

document.addEventListener('DOMContentLoaded', () => {
  const quizEl = document.getElementById('interest-quiz');
  if (!quizEl) return;

  let currentQ = 0;
  const scores = { data: 0, dev: 0, marketing: 0, ux: 0, ops: 0, procurement: 0 };

  const saved = localStorage.getItem('momthn_path_result');
  if (saved) {
    try {
      const result = JSON.parse(saved);
      showResult(result.topPaths);
      return;
    } catch { /* continue fresh */ }
  }

  renderQuestion();

  function renderQuestion() {
    if (currentQ >= QUIZ_QUESTIONS.length) {
      showResult(getTopPaths());
      return;
    }

    const q = QUIZ_QUESTIONS[currentQ];
    const options = QUIZ_OPTIONS[q.id];

    quizEl.innerHTML = `
      <div class="quiz-progress">
        <span class="quiz-progress__text">السؤال ${currentQ + 1} من ${QUIZ_QUESTIONS.length}</span>
        <div class="progress-bar"><div class="progress-bar__fill" style="width: ${((currentQ) / QUIZ_QUESTIONS.length) * 100}%"></div></div>
      </div>
      <h3 class="quiz-question">${q.text}</h3>
      <div class="quiz-options stagger-children">
        ${options.map((opt, i) => `
          <button class="quiz-option fade-up" style="--i: ${i}" data-index="${i}" type="button">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    `;

    requestAnimationFrame(() => {
      quizEl.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
    });

    quizEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        const optScores = options[idx].scores;
        Object.entries(optScores).forEach(([path, pts]) => {
          scores[path] = (scores[path] || 0) + pts;
        });
        currentQ++;
        renderQuestion();
      });
    });
  }

  function getTopPaths() {
    const sorted = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([key]) => key);
    return sorted;
  }

  function showResult(topPaths) {
    localStorage.setItem('momthn_path_result', JSON.stringify({ topPaths, date: Date.now() }));

    const cards = topPaths.map((key, i) => {
      const path = QUIZ_PATHS[key];
      return `
        <div class="quiz-result-card fade-up" style="--i: ${i}; border-color: ${path.color}">
          <div class="quiz-result-card__rank">${i === 0 ? 'الأنسب لك' : 'خيار ثانٍ'}</div>
          <h4 class="quiz-result-card__title">${path.nameAr}</h4>
          <p class="quiz-result-card__en en" dir="ltr">${path.nameEn}</p>
        </div>
      `;
    }).join('');

    quizEl.innerHTML = `
      <div class="quiz-result">
        <h3 class="quiz-result__title">مساراتك المقترحة</h3>
        <div class="quiz-result__cards">${cards}</div>
        <div class="quiz-result__actions">
          <a href="paths.html" class="btn btn-primary">اكتشف مسارك بالتفصيل ←</a>
          <button class="btn btn-secondary" id="quiz-retry" type="button">أعد الاختبار</button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      quizEl.querySelectorAll('.fade-up').forEach(el => el.classList.add('is-visible'));
    });

    document.getElementById('quiz-retry')?.addEventListener('click', () => {
      localStorage.removeItem('momthn_path_result');
      currentQ = 0;
      Object.keys(scores).forEach(k => scores[k] = 0);
      renderQuestion();
    });
  }
});
