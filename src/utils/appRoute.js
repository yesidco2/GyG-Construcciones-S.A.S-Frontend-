export default function getAppRouteKey(location = window.location) {
  return location.hash.replace(/^#/, '').split(/[/?]/)[0] || '';
}
