const slides = [...document.querySelectorAll<HTMLElement>('[data-slide]')];
const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const overview = byId<HTMLDialogElement>('overview');
const notes = byId<HTMLDialogElement>('notes');
const previous = byId<HTMLButtonElement>('prev');
const next = byId<HTMLButtonElement>('next');
const progress = byId('progress');
let current = 0;

function readHash() {
  const match = location.hash.match(/^#\/(\d+)$/);
  return match ? Math.max(0, Math.min(slides.length - 1, Number(match[1]) - 1)) : 0;
}

function render(index: number, updateHash = true, focus = false) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === current);
    slide.inert = i !== current;
    slide.setAttribute('aria-hidden', String(i !== current));
  });
  const slide = slides[current];
  if (updateHash && location.hash !== `#/${current + 1}`) history.pushState(null, '', `#/${current + 1}`);
  byId('slide-counter').innerHTML = `${String(current + 1).padStart(2, '0')} <span>/ ${slides.length}</span>`;
  byId('chapter').textContent = slide.dataset.section ?? '';
  byId('announcement').textContent = `Diapositiva ${current + 1} de ${slides.length}: ${slide.dataset.title}`;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  progress.parentElement?.setAttribute('aria-valuenow', String(current + 1));
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  document.querySelectorAll<HTMLButtonElement>('[data-prev]').forEach(button => button.disabled = current === 0);
  document.querySelectorAll<HTMLButtonElement>('.notes-nav [data-next]').forEach(button => button.disabled = current === slides.length - 1);
  document.querySelectorAll('[data-go]').forEach(button => button.setAttribute('aria-current', String(Number((button as HTMLElement).dataset.go) === current + 1)));
  byId('notes-title').textContent = slide.dataset.title ?? '';
  byId('note-content').textContent = slide.querySelector<HTMLTemplateElement>('.speaker-note')?.content.textContent ?? '';
  const elapsedTarget = slides.slice(0, current).reduce((sum, item) => sum + Number(item.dataset.seconds), 0);
  byId('note-timing').textContent = `${current + 1} / ${slides.length} · ${slide.dataset.seconds} s sugeridos · Inicio: ${formatTime(elapsedTarget)}`;
  // Fetch the upcoming illustration before it becomes visible.
  slides[current + 1]?.querySelectorAll('img').forEach(img => img.loading = 'eager');
  if (focus && !notes.open && !overview.open) slide.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function toggleDialog(dialog: HTMLDialogElement) {
  if (dialog.open) { dialog.close(); return; }
  [notes, overview].forEach(other => { if (other.open) other.close(); });
  dialog.showModal();
  if (dialog === overview) overview.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
}

async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
  } catch { byId('announcement').textContent = 'Tu navegador no permite activar pantalla completa aquí.'; }
}

let timerRunning = false;
let elapsed = 0;
let startedAt = 0;
function formatTime(seconds: number) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`; }
function updateTimer() {
  const seconds = (elapsed + (timerRunning ? performance.now() - startedAt : 0)) / 1000;
  byId('timer').textContent = formatTime(seconds);
  byId('timer-toggle').classList.toggle('over-time', seconds >= 300);
}
function toggleTimer() {
  if (timerRunning) elapsed += performance.now() - startedAt;
  else startedAt = performance.now();
  timerRunning = !timerRunning;
  byId('timer-toggle').classList.toggle('running', timerRunning);
  byId('timer-toggle').setAttribute('aria-label', timerRunning ? 'Pausar cronómetro' : 'Iniciar cronómetro de cinco minutos');
  byId('timer-toggle').setAttribute('aria-pressed', String(timerRunning));
  updateTimer();
}

previous.addEventListener('click', () => render(current - 1));
next.addEventListener('click', () => render(current + 1));
document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => render(current + 1, true, !notes.open)));
document.querySelectorAll('[data-prev]').forEach(button => button.addEventListener('click', () => render(current - 1)));
document.querySelectorAll<HTMLElement>('[data-go]').forEach(button => button.addEventListener('click', () => { overview.close(); render(Number(button.dataset.go) - 1, true, true); }));
byId('overview-toggle').addEventListener('click', () => toggleDialog(overview));
byId('notes-toggle').addEventListener('click', () => toggleDialog(notes));
byId('fullscreen').addEventListener('click', fullscreen);
if (!document.fullscreenEnabled) byId('fullscreen').hidden = true;
document.addEventListener('fullscreenchange', () => byId('fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa'));
byId('timer-toggle').addEventListener('click', toggleTimer);
byId('timer-reset').addEventListener('click', () => { elapsed = 0; startedAt = performance.now(); updateTimer(); });
setInterval(updateTimer, 250);
[overview, notes].forEach(dialog => {
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
});
window.addEventListener('hashchange', () => render(readHash(), false));
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).matches('input, textarea, select, [contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  if (key === 'escape') return; // Native dialog handles focus restoration and Escape.
  if (overview.open) return;
  if (['arrowright', 'arrowdown', 'pagedown'].includes(key)) { event.preventDefault(); render(current + 1, true, !notes.open); }
  else if (['arrowleft', 'arrowup', 'pageup'].includes(key)) { event.preventDefault(); render(current - 1, true, !notes.open); }
  else if (key === ' ' && !(event.target as HTMLElement).closest('button, a')) { event.preventDefault(); render(current + (event.shiftKey ? -1 : 1), true, !notes.open); }
  else if (key === 'home') { event.preventDefault(); render(0, true, !notes.open); }
  else if (key === 'end') { event.preventDefault(); render(slides.length - 1, true, !notes.open); }
  else if (key === 'f') { event.preventDefault(); void fullscreen(); }
  else if (key === 'n') { event.preventDefault(); toggleDialog(notes); }
  else if (key === 'o') { event.preventDefault(); toggleDialog(overview); }
  else if (key === 't') { event.preventDefault(); toggleTimer(); }
});
let touchX = 0, touchY = 0;
const deck = byId('deck');
deck.addEventListener('touchstart', event => { touchX = event.changedTouches[0].clientX; touchY = event.changedTouches[0].clientY; }, { passive: true });
deck.addEventListener('touchend', event => {
  const dx = event.changedTouches[0].clientX - touchX;
  const dy = event.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.6 && !(event.target as HTMLElement).closest('a, button')) render(current + (dx < 0 ? 1 : -1));
}, { passive: true });
document.documentElement.classList.add('js');
render(readHash(), false);
window.addEventListener('beforeprint', () => slides.forEach(slide => { slide.inert = false; slide.removeAttribute('aria-hidden'); slide.querySelectorAll('img').forEach(img => img.loading = 'eager'); }));
window.addEventListener('afterprint', () => render(current, false));
