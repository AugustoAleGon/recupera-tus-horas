export type PresenterAction = 'next' | 'previous' | 'first' | 'last' | 'timer' | 'reset';

export interface PresenterState {
  index: number;
  total: number;
  title: string;
  notes: string;
  timing: string;
  nextTitle: string;
  elapsed: number;
  running: boolean;
  capturedAt: number;
}

const actions: PresenterAction[] = ['next', 'previous', 'first', 'last', 'timer', 'reset'];

// Each deck owns one private presenter window. Messages cannot cross between decks.
export function createPresenterChannel(getState: () => PresenterState, act: (action: PresenterAction) => void, connected: () => void) {
  const token = sessionStorage.getItem('presenter-token') ?? crypto.randomUUID();
  sessionStorage.setItem('presenter-token', token);
  let presenter: Window | null = null;

  function publish() {
    if (presenter && !presenter.closed) {
      presenter.postMessage({ type: 'presenter-state', token, state: getState() }, location.origin);
    }
  }

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.token !== token || !event.source || event.source === window) return;
    // The token survives a deck reload so the already-open presenter can reconnect.
    if (event.data.type === 'presenter-ready') {
      if (presenter && !presenter.closed && event.source !== presenter) return;
      presenter = event.source as Window;
      connected();
      publish();
    } else if (event.source === presenter && event.data.type === 'presenter-action' && actions.includes(event.data.action)) {
      act(event.data.action);
    }
  });

  return {
    publish,
    open() {
      if (presenter && !presenter.closed) { presenter.focus(); publish(); return true; }
      const url = new URL('presenter/', location.href);
      url.searchParams.set('session', token);
      presenter = window.open(url, `presenter-${token}`, 'popup,width=1200,height=850');
      if (!presenter) return false;
      connected();
      presenter.focus();
      return true;
    },
  };
}
