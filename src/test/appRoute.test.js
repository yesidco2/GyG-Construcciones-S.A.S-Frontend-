import { describe, expect, it } from 'vitest';
import getAppRouteKey from '../utils/appRoute';

describe('app action routing', () => {
  it.each(['verify-email', 'reset-password', 'login', 'consultar-proyecto'])('routes %s', (route) => {
    expect(getAppRouteKey({ search: '?token_hash=token', hash: '#' + route })).toBe(route);
  });
});
