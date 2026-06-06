document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('expert-form');
  if (!form) return;

  let currentStep = 0;
  const totalSteps = 3;
  const steps = form.querySelectorAll('.form-step');
  const indicators = form.querySelectorAll('.form-step-indicator');
  const prevBtn = document.getElementById('prev-step');
  const nextBtn = document.getElementById('next-step');

  function updateStep() {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === currentStep));
    indicators.forEach((ind, i) => {
      ind.classList.toggle('is-active', i === currentStep);
      ind.classList.toggle('is-done', i < currentStep);
    });
    prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    nextBtn.textContent = currentStep === totalSteps - 1 ? 'إرسال الطلب' : 'التالي';
  }

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateStep();
    }
  });

  nextBtn.addEventListener('click', () => {
    const activeStep = steps[currentStep];
    const inputs = activeStep.querySelectorAll('input[required], select[required], textarea[required]');
    let valid = true;
    inputs.forEach(input => {
      if (!input.value.trim()) {
        valid = false;
        input.style.borderColor = 'var(--color-ember)';
      } else {
        input.style.borderColor = '';
      }
    });

    if (!valid) return;

    if (currentStep < totalSteps - 1) {
      currentStep++;
      updateStep();
    } else {
      alert('شكراً! سنراجع طلبك ونتواصل معك خلال أسبوع.');
      currentStep = 0;
      form.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
      updateStep();
    }
  });
});
