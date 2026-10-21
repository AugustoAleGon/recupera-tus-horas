import type { PresenterAction, PresenterState } from './presenter-channel';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const token = new URLSearchParams(location.search).get('session');
const host: Window | null = window.opener;
let state: PresenterState | null = null;
let lastResponse = 0;

function updateTimer() {
  if (!state) return;
  const seconds = Math.floor((state.elapsed + (state.running ? Math.max(0, Date.now() - state.capturedAt) : 0)) / 1000);
  byId('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  byId('timer').classList.toggle('over-time', seconds >= 600);
}

function send(action: PresenterAction) {
  if (!host || host.closed || !state || Date.now() - lastResponse > 4000) return;
  host.postMessage({ type: 'presenter-action', token, action }, location.origin);
}

window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== host || event.data?.token !== token || event.data.type !== 'presenter-state') return;
  const incoming = event.data.state as PresenterState;
  const changed = state?.index !== incoming.index;
  state = incoming;
  lastResponse = Date.now();
  byId('connection').textContent = 'Conectada · Notas privadas';
  document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.disabled = false);
  byId<HTMLButtonElement>('previous').disabled = state.index === 0;
  byId<HTMLButtonElement>('next').disabled = state.index === state.total - 1;
  byId('counter').textContent = `${state.index + 1} / ${state.total}`;
  byId('notes-title').textContent = state.title;
  byId('note-timing').textContent = state.timing;
  if (byId('note-content').textContent !== state.notes) byId('note-content').textContent = state.notes;
  byId('next-title').textContent = state.nextTitle || 'Fin de la presentación';
  byId('timer-toggle').textContent = state.running ? 'Pausar' : 'Iniciar';
  byId('timer-toggle').setAttribute('aria-pressed', String(state.running));
  if (changed) {
    byId<HTMLIFrameElement>('preview').src = `../?view=preview#/${state.index + 1}`;
    byId('note-content').scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  updateTimer();
});

document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => {
  button.addEventListener('click', () => send(button.dataset.action as PresenterAction));
});
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement).closest('input, textarea, select, [contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const action = ({ arrowright: 'next', arrowdown: 'next', pagedown: 'next', arrowleft: 'previous', arrowup: 'previous', pageup: 'previous', home: 'first', end: 'last', t: 'timer' } as Record<string, PresenterAction>)[key];
  if (action) { event.preventDefault(); send(action); }
  else if (key === ' ' && !(event.target as HTMLElement).closest('button, a')) {
    event.preventDefault(); send(event.shiftKey ? 'previous' : 'next');
  }
});

function requestState() {
  if (!host || host.closed || !token || (lastResponse && Date.now() - lastResponse > 4000)) {
    byId('connection').textContent = 'Sin conexión. Abre «Vista del presentador» desde la presentación.';
    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.disabled = true);
  }
  if (host && !host.closed && token) host.postMessage({ type: 'presenter-ready', token }, location.origin);
}
requestState();
setInterval(requestState, 1000);
setInterval(updateTimer, 250);
