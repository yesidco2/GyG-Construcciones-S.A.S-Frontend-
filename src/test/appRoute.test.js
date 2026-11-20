import { describe, expect, it } from 'vitest';
import getAppRouteKey from '../utils/appRoute';
import getFirebaseActionParams from '../utils/firebaseActionParams';

describe('app action routing', () => {
  it('leaves password resets on Firebase default handler and parses action parameters', () => {
    const location = {
      search: '?mode=resetPassword&oobCode=private-code',
      hash: '',
    };
    expect(getAppRouteKey(location)).toBe('');
    expect(getFirebaseActionParams(location)).toMatchObject({
      mode: 'resetPassword',
      oobCode: 'private-code',
    });
  });

  it('supports Firebase action parameters after a hash route and retains existing hash routes', () => {
    expect(getAppRouteKey({
      search: '',
      hash: '#anything?mode=verifyEmail&oobCode=private-code',
    })).toBe('verify-email');
    expect(getAppRouteKey({ search: '', hash: '#consultar-proyecto' })).toBe('consultar-proyecto');
    expect(getAppRouteKey({ search: '', hash: '#login' })).toBe('login');
  });
});
