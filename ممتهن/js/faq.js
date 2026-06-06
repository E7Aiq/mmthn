const FAQ_CATEGORIES = {
  all: 'الكل',
  graduates: 'للخريجين',
  startups: 'للشركات',
  experts: 'للخبراء',
  general: 'عام'
};

document.addEventListener('DOMContentLoaded', async () => {
  const listEl = document.getElementById('faq-list');
  const searchInput = document.getElementById('faq-search');
  const categoriesEl = document.getElementById('faq-categories');
  const noResults = document.getElementById('faq-no-results');

  if (!listEl) return;

  let faqs = [];
  try {
    const res = await fetch('data/faq.json');
    faqs = await res.json();
  } catch {
    listEl.innerHTML = '<p class="text-muted">تعذّر تحميل الأسئلة.</p>';
    return;
  }

  let activeCategory = 'all';
  let searchQuery = '';

  renderCategories();
  renderFaqs();

  function renderCategories() {
    categoriesEl.innerHTML = Object.entries(FAQ_CATEGORIES).map(([key, label]) =>
      `<button class="faq-category-btn${key === activeCategory ? ' is-active' : ''}" data-category="${key}" type="button">${label}</button>`
    ).join('');

    categoriesEl.querySelectorAll('.faq-category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.category;
        categoriesEl.querySelectorAll('.faq-category-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderFaqs();
      });
    });
  }

  function renderFaqs() {
    const filtered = faqs.filter(faq => {
      const matchCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchSearch = !searchQuery || faq.question.toLowerCase().includes(searchQuery) || faq.answer.toLowerCase().includes(searchQuery);
      return matchCategory && matchSearch;
    });

    if (!filtered.length) {
      listEl.innerHTML = '';
      noResults.classList.add('is-visible');
      return;
    }

    noResults.classList.remove('is-visible');

    listEl.innerHTML = filtered.map(faq => {
      const questionHtml = highlightText(faq.question, searchQuery);
      return `
        <div class="faq-item accordion__item" data-category="${faq.category}">
          <button class="accordion__trigger" aria-expanded="false">
            ${questionHtml}
            <i class="ph ph-caret-down accordion__icon"></i>
          </button>
          <div class="accordion__panel">
            <p class="accordion__content">${faq.answer}</p>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.accordion__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion__item');
        const isOpen = item.classList.contains('is-open');
        listEl.querySelectorAll('.accordion__item.is-open').forEach(open => {
          if (open !== item) {
            open.classList.remove('is-open');
            open.querySelector('.accordion__trigger')?.setAttribute('aria-expanded', 'false');
          }
        });
        item.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderFaqs();
  });
});
