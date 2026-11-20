export default function getFirebaseActionParams(location = window.location) {
  const searchParams = new URLSearchParams(location.search);
  const hashQueryIndex = location.hash.indexOf('?');
  const hashParams = hashQueryIndex >= 0
    ? new URLSearchParams(location.hash.slice(hashQueryIndex + 1))
    : new URLSearchParams();

  return {
    mode: searchParams.get('mode') || hashParams.get('mode') || '',
    oobCode: searchParams.get('oobCode') || hashParams.get('oobCode') || '',
  };
}
