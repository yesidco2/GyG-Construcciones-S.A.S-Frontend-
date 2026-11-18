import getFirebaseActionParams from './firebaseActionParams';

export default function getAppRouteKey(location = window.location) {
  const { mode } = getFirebaseActionParams(location);
  if (mode === 'verifyEmail') return 'verify-email';

  return location.hash.replace(/^#/, '').split(/[/?]/)[0] || '';
}
