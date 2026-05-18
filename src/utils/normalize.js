export function normalizeName(name) {
  let s = (name ?? '').toLowerCase().trim().replace(/\s+/g, ' ');
  if (s.length > 2) {
    if (s.endsWith('ies')) s = s.slice(0, -3) + 'y';
    else if (s.endsWith('ves')) s = s.slice(0, -3) + 'f';
    else if (s.endsWith('es') && !s.endsWith('uses') && !s.endsWith('oses') && !s.endsWith('ases')) s = s.slice(0, -2);
    else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  }
  return s;
}
