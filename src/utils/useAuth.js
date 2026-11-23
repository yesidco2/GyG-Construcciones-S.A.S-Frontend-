import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProfile, subscribeAuth } from '../services/authService';
import { isAuthConfigured } from '../services/supabase';

export default function useAuth() {
  const requestIdRef = useRef(0);
  const [state, setState] = useState({
    loading: true,
    authUser: null,
    profile: null,
    error: '',
  });

  const refreshProfile = useCallback(async (authUser) => {
    if (!authUser) {
      throw new Error('No hay una sesión autenticada para consultar el perfil.');
    }

    const requestId = ++requestIdRef.current;
    setState((previous) => ({
      ...previous,
      loading: true,
      authUser,
      error: '',
    }));

    try {
      const profile = await fetchProfile();
      if (requestIdRef.current === requestId) {
        setState({ loading: false, authUser, profile, error: '' });
      }
      return profile;
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setState({
          loading: false,
          authUser,
          profile: null,
          error: error?.message || 'No se pudo consultar el perfil en el servidor.',
        });
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeAuth(async (authUser) => {
      const currentRequestId = ++requestIdRef.current;
      if (!authUser) {
        if (active) {
          setState({
            loading: false,
            authUser: null,
            profile: null,
            error: isAuthConfigured ? '' : 'Supabase Auth no está configurado.',
          });
        }
        return;
      }

      if (active) {
        setState({ loading: true, authUser, profile: null, error: '' });
      }

      try {
        const profile = await fetchProfile();
        if (active && requestIdRef.current === currentRequestId) {
          setState({ loading: false, authUser, profile, error: '' });
        }
      } catch (error) {
        if (active && requestIdRef.current === currentRequestId) {
          setState({
            loading: false,
            authUser,
            profile: null,
            error: error?.message || 'No se pudo consultar el perfil en el servidor.',
          });
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const role = state.profile?.rol || '';
  return {
    ...state,
    role,
    canAccessPanel: role === 'ADMIN' || role === 'INGENIERO',
    refreshProfile,
  };
}
