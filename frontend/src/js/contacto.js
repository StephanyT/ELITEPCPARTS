// ============================================================
// CONTACTO
// ============================================================

// Form validation
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const fields = ['firstName', 'lastName', 'email', 'subject', 'message'];
  let valid = true;

  fields.forEach(id => {
    const input = document.getElementById(id);
    const err   = document.getElementById('err-' + id);
    input?.classList.remove('error');
    if (err) err.textContent = '';

    if (!input?.value.trim()) {
      input?.classList.add('error');
      if (err) err.textContent = 'Este campo es obligatorio';
      valid = false;
    } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      input.classList.add('error');
      if (err) err.textContent = 'Ingresa un email válido';
      valid = false;
    }
  });

  if (!valid) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Enviando...';

  fetch('http://localhost:3000/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre:   document.getElementById('firstName').value.trim(),
      apellido: document.getElementById('lastName').value.trim(),
      email:    document.getElementById('email').value.trim(),
      asunto:   document.getElementById('subject').value.trim(),
      mensaje:  document.getElementById('message').value.trim(),
    }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Error al enviar');
      document.getElementById('contactForm').style.display = 'none';
      document.getElementById('formSuccess').style.display = 'flex';
    })
    .catch(() => {
      btn.disabled = false;
      btn.innerHTML = 'Enviar mensaje';
      alert('Hubo un error al enviar el mensaje. Intenta de nuevo.');
    });
});

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});
