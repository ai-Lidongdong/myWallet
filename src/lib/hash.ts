export function parseHash() {
  const raw = window.location.hash || '';
  const [pathPart, queryPart] = raw.replace(/^#/, '').split('?', 2);
  const path = pathPart || '/';
  const query = new URLSearchParams(queryPart || '');
  return { path, query };
}

