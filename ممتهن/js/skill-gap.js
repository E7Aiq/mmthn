document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('skill-gap-tool');
  if (!container) return;

  let jobs = [];
  try {
    const res = await fetch('data/skills.json');
    jobs = await res.json();
  } catch {
    container.innerHTML = '<p class="text-muted">تعذّر تحميل البيانات. حاول لاحقاً.</p>';
    return;
  }

  renderStep1();

  function renderStep1() {
    container.innerHTML = `
      <div class="skill-gap-step">
        <span class="skill-gap-step__label">الخطوة ١</span>
        <h3 class="skill-gap-step__title">اختر الوظيفة المستهدفة</h3>
        <select class="form-select" id="job-select" aria-label="اختر الوظيفة المستهدفة">
          <option value="">— اختر وظيفة —</option>
          ${jobs.map(j => `<option value="${j.jobId}">${j.jobNameAr}</option>`).join('')}
        </select>
      </div>
    `;

    document.getElementById('job-select').addEventListener('change', (e) => {
      const job = jobs.find(j => j.jobId === e.target.value);
      if (job) renderStep2(job);
    });
  }

  function renderStep2(job) {
    container.innerHTML = `
      <div class="skill-gap-step">
        <span class="skill-gap-step__label">الخطوة ٢</span>
        <h3 class="skill-gap-step__title">حدّد المهارات التي تملكها</h3>
        <p class="text-sm text-muted" style="margin-block-end: 1rem">الوظيفة: <strong>${job.jobNameAr}</strong></p>
        <div class="skill-gap-checklist" id="skill-checklist">
          ${job.requiredSkills.map(skill => `
            <label class="checkbox-item">
              <input type="checkbox" value="${skill.id}" data-name="${skill.nameAr}" data-url="${skill.resourceUrl}">
              <span>${skill.nameAr} <span class="text-muted text-xs">(${skill.level})</span></span>
            </label>
          `).join('')}
        </div>
        <button class="btn btn-primary" id="analyze-btn" type="button" style="margin-block-start: 1.5rem">حلّل الفجوة</button>
        <button class="btn btn-secondary btn-sm" id="back-btn" type="button" style="margin-block-start: 0.5rem">← رجوع</button>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', renderStep1);
    document.getElementById('analyze-btn').addEventListener('click', () => renderResult(job));
  }

  function renderResult(job) {
    const checked = [...document.querySelectorAll('#skill-checklist input:checked')];
    const checkedIds = new Set(checked.map(c => c.value));

    const have = job.requiredSkills.filter(s => checkedIds.has(s.id));
    const need = job.requiredSkills.filter(s => !checkedIds.has(s.id));
    const percent = Math.round((have.length / job.requiredSkills.length) * 100);

    container.innerHTML = `
      <div class="skill-gap-step">
        <span class="skill-gap-step__label">النتيجة</span>
        <h3 class="skill-gap-step__title">تحليل فجوة المهارات</h3>

        <div class="skill-gap-progress">
          <div class="flex justify-between items-center" style="margin-block-end: 0.5rem">
            <span class="text-sm font-arabic" style="font-weight: 600">مستوى جاهزيتك</span>
            <span class="text-lime font-display" style="font-weight: 800; font-size: 1.25rem">${percent.toLocaleString('ar-SA')}%</span>
          </div>
          <div class="progress-bar" style="height: 10px">
            <div class="progress-bar__fill" style="width: ${percent}%"></div>
          </div>
        </div>

        <div class="skill-gap-columns">
          <div class="skill-gap-col">
            <h4 class="skill-gap-col__title text-lime">ما تملكه ✓</h4>
            <div class="skill-gap-tags">
              ${have.length ? have.map(s => `<span class="tag tag--have">${s.nameAr}</span>`).join('') : '<span class="text-muted text-sm">لم تحدد مهارات بعد</span>'}
            </div>
          </div>
          <div class="skill-gap-col">
            <h4 class="skill-gap-col__title text-ember">ما تحتاجه ✗</h4>
            <div class="skill-gap-tags">
              ${need.map(s => `
                <span class="tag tag--need">
                  ${s.nameAr}
                  ${s.resourceUrl ? `<a href="${s.resourceUrl}" target="_blank" rel="noopener" aria-label="مصدر تعلّم ${s.nameAr}" style="margin-inline-start: 4px"><i class="ph ph-link"></i></a>` : ''}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="skill-gap-cta">
          <a href="graduates.html#apply" class="btn btn-primary">ابدأ سدّ الفجوة — سجّل في ممتهن</a>
          <button class="btn btn-secondary btn-sm" id="retry-btn" type="button">أعد التحليل</button>
        </div>
      </div>
    `;

    document.getElementById('retry-btn').addEventListener('click', renderStep1);
  }
});
