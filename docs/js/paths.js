document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('paths-grid');
  const filterBar = document.getElementById('path-filters');
  if (!grid) return;

  let paths = [];
  try {
    const res = await fetch('data/paths.json');
    paths = await res.json();
  } catch {
    grid.innerHTML = '<p class="text-muted">تعذّر تحميل المسارات.</p>';
    return;
  }

  let activeFilter = 'all';
  let expandedId = null;

  renderCards();
  initFilters();

  function initFilters() {
    if (!filterBar) return;

    filterBar.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        filterBar.querySelectorAll('[data-filter]').forEach(b => {
          b.classList.remove('is-active');
          b.style.background = '';
          b.style.color = '';
        });
        btn.classList.add('is-active');
        if (btn.dataset.color) {
          btn.style.background = btn.dataset.color;
          btn.style.color = 'white';
        }
        expandedId = null;
        renderCards();
      });
    });
  }

  function renderCards() {
    const filtered = activeFilter === 'all'
      ? paths
      : paths.filter(p => p.id === activeFilter);

    grid.innerHTML = filtered.map(path => {
      const isExpanded = expandedId === path.id;
      const stars = Array.from({ length: 5 }, (_, i) =>
        `<i class="ph${i < path.marketDemand ? ' ph-fill' : ''} ph-star"></i>`
      ).join('');

      const salaryMin = path.salaryRange.min.toLocaleString('ar-SA');
      const salaryMax = path.salaryRange.max.toLocaleString('ar-SA');

      return `
        <div class="path-explorer-card ${isExpanded ? 'is-expanded' : ''}" data-path-id="${path.id}">
          <div class="path-explorer-card__header" style="background: ${path.color}">
            <i class="ph ph-${path.icon}"></i>
          </div>
          <div class="path-explorer-card__body">
            <h3 class="path-explorer-card__title">${path.nameAr}</h3>
            <p class="path-explorer-card__en en" dir="ltr">${path.nameEn}</p>
            <p class="path-explorer-card__desc">${path.description}</p>
            <div class="path-explorer-card__skills">
              ${path.skills.slice(0, 3).map(s => `<span class="badge">${s}</span>`).join('')}
            </div>
            <div class="path-explorer-card__meta">
              <div class="stars" aria-label="الطلب في السوق: ${path.marketDemand} من 5">${stars}</div>
              <span class="path-explorer-card__salary">${salaryMin} – ${salaryMax} ر.س</span>
            </div>
            <button class="btn btn-dark btn-sm path-explorer-card__toggle" type="button" aria-expanded="${isExpanded}">
              ${isExpanded ? 'إغلاق التفاصيل' : 'اكتشف المسار'}
            </button>
          </div>
          ${isExpanded ? renderDetailPanel(path) : ''}
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.path-explorer-card__toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.path-explorer-card');
        const id = card.dataset.pathId;
        expandedId = expandedId === id ? null : id;
        renderCards();
      });
    });

    if (expandedId) {
      initTabs();
    }
  }

  function renderDetailPanel(path) {
    const levelMap = { 'أساسي': 'beginner', 'متوسط': 'intermediate', 'متقدم': 'advanced' };

    return `
      <div class="path-detail-panel">
        <div class="tabs" role="tablist">
          <button class="tab is-active" data-tab="skills" role="tab" type="button">المهارات</button>
          <button class="tab" data-tab="timeline" role="tab" type="button">المسار الزمني</button>
          <button class="tab" data-tab="resources" role="tab" type="button">الموارد</button>
          <button class="tab" data-tab="jobs" role="tab" type="button">الوظائف</button>
        </div>

        <div class="tab-panel is-active" data-panel="skills">
          <ul class="skill-level-list">
            ${path.skills.map(skill => `
              <li class="skill-level-item">
                <span>${skill}</span>
                <span class="skill-level-badge skill-level-badge--intermediate">مطلوب</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="tab-panel" data-panel="timeline">
          <div class="timeline">
            ${path.thirtyDayPlan.map(week => `
              <div class="timeline__item">
                <div class="timeline__marker" style="background: ${path.color}">أسبوع ${week.week.toLocaleString('ar-SA')}</div>
                <p class="timeline__text">${week.task}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="tab-panel" data-panel="resources">
          <ul class="resource-list">
            ${path.resources.map(r => `
              <li class="resource-item">
                <span class="resource-item__type badge">${r.type === 'course' ? 'دورة' : r.type === 'youtube' ? 'يوتيوب' : 'مقال'}</span>
                <a href="${r.url}" target="_blank" rel="noopener" class="resource-item__title">${r.title}</a>
                ${r.free ? '<span class="badge badge--lime">مجاني</span>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="tab-panel" data-panel="jobs">
          <ul class="job-list">
            ${path.jobTitles.map(title => `
              <li class="job-item">
                <span class="job-item__title">${title}</span>
                <span class="badge">${path.salaryRange.min.toLocaleString('ar-SA')} – ${path.salaryRange.max.toLocaleString('ar-SA')} ر.س</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  function initTabs() {
    const panel = document.querySelector('.path-detail-panel');
    if (!panel) return;

    panel.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        panel.querySelectorAll('.tab').forEach(t => t.classList.remove('is-active'));
        panel.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('is-active'));
        tab.classList.add('is-active');
        panel.querySelector(`[data-panel="${target}"]`)?.classList.add('is-active');
      });
    });
  }
});
