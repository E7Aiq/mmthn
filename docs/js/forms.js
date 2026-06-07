import { supabase } from './supabase.js';

/* Storage keys for one-submit-per-device protection */
const STORAGE_KEYS = {
  'graduates.html': 'mumtahan_submitted_graduates',
  'startups.html':  'mumtahan_submitted_startups',
  'experts.html':   'mumtahan_submitted_experts',
};
const currentPage  = window.location.pathname.split('/').pop();
const pageKey      = STORAGE_KEYS[currentPage] || null;

// ── Graduate Form ──────────────────────────────────────────
const graduateForm = document.getElementById('graduate-form');
if (graduateForm) {
  graduateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = graduateForm.querySelector('[type="submit"]');
    setLoading(btn, true);

    const { error } = await supabase
      .from('graduate_registrations')
      .insert([{
        full_name:      graduateForm.full_name?.value?.trim(),
        email:          graduateForm.email?.value?.trim(),
        phone:          graduateForm.phone?.value?.trim(),
        specialization: graduateForm.specialization?.value?.trim(),
        path:           graduateForm.path?.value,
        linkedin_url:   graduateForm.linkedin_url?.value?.trim(),
        message:        graduateForm.message?.value?.trim()
      }]);

    setLoading(btn, false);

    if (error) {
      console.error('Supabase error:', error);
      showErrorMessage(graduateForm, 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
    } else {
      if (typeof window.showSuccessState === 'function') {
        window.showSuccessState(graduateForm, pageKey);
      }
    }
  });
}

// ── Startup Form ───────────────────────────────────────────
const startupForm = document.getElementById('startup-form');
if (startupForm) {
  startupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = startupForm.querySelector('[type="submit"]');
    setLoading(btn, true);

    const checkedPaths = Array.from(startupForm.querySelectorAll('input[name="paths"]:checked'))
      .map(cb => cb.value)
      .join(', ');

    const { error } = await supabase
      .from('startup_applications')
      .insert([{
        company_name:  startupForm.company_name?.value?.trim(),
        sector:        startupForm.sector?.value?.trim(),
        stage:         startupForm.stage?.value,
        needed_paths:  checkedPaths,
        work_type:     startupForm.work_type?.value,
        contact_name:  startupForm.contact_name?.value?.trim(),
        email:         startupForm.email?.value?.trim(),
        phone:         startupForm.phone?.value?.trim()
      }]);

    setLoading(btn, false);

    if (error) {
      console.error('Supabase error:', error);
      showErrorMessage(startupForm, 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
    } else {
      if (typeof window.showSuccessState === 'function') {
        window.showSuccessState(startupForm, pageKey);
      }
    }
  });
}

// ── Expert Form ────────────────────────────────────────────
const expertForm = document.getElementById('expert-form');
if (expertForm) {
  expertForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = expertForm.querySelector('[type="submit"]');
    setLoading(btn, true);

    const { error } = await supabase
      .from('expert_applications')
      .insert([{
        full_name:        expertForm.full_name?.value?.trim(),
        email:            expertForm.email?.value?.trim(),
        phone:            expertForm.phone?.value?.trim(),
        specialty:        expertForm.specialty?.value?.trim(),
        years_experience: parseInt(expertForm.years_experience?.value) || null,
        linkedin_url:     expertForm.linkedin_url?.value?.trim(),
        motivation:       expertForm.motivation?.value?.trim()
      }]);

    setLoading(btn, false);

    if (error) {
      console.error('Supabase error:', error);
      showErrorMessage(expertForm, 'حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.');
    } else {
      if (typeof window.showSuccessState === 'function') {
        window.showSuccessState(expertForm, pageKey);
      }
    }
  });
}

// ── Helpers ────────────────────────────────────────────────
function setLoading(btn, isLoading) {
  if (!btn) return;
  if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
  btn.disabled = isLoading;
  btn.textContent = isLoading ? 'جارٍ الإرسال...' : btn.dataset.originalText;
}

function showErrorMessage(form, msg) {
  const existing = form.querySelector('.form-result--error');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className = 'form-result--error';
  el.style.cssText = `
    color: var(--color-ember);
    font-family: var(--font-arabic);
    margin-top: 1rem;
    font-size: 0.9rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-ember);
    border-radius: 8px;
    background: rgba(232,76,30,0.06);
  `;
  el.textContent = msg;
  form.appendChild(el);
  setTimeout(() => el.remove(), 7000);
}
