export default function getAppRouteKey(location = window.location) {
  if (/^#induccion\/[0-9a-f-]{36}$/i.test(location.hash)) return location.hash.slice(1);
  return location.hash.replace(/^#/, '').split(/[/?]/)[0] || '';
}
