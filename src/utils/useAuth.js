import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProfile, subscribeAuth } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

export default function useAuth() {
  const requestIdRef = useRef(0);
  const [state, setState] = useState({
    loading: true,
    firebaseUser: null,
    profile: null,
    error: '',
  });

  const refreshProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      throw new Error('No hay una sesión autenticada para consultar el perfil.');
    }

    const requestId = ++requestIdRef.current;
    setState((previous) => ({
      ...previous,
      loading: true,
      firebaseUser,
      error: '',
    }));

    try {
      const profile = await fetchProfile(firebaseUser);
      if (requestIdRef.current === requestId) {
        setState({ loading: false, firebaseUser, profile, error: '' });
      }
      return profile;
    } catch (error) {
      if (requestIdRef.current === requestId) {
        setState({
          loading: false,
          firebaseUser,
          profile: null,
          error: error?.message || 'No se pudo consultar el perfil en el servidor.',
        });
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeAuth(async (firebaseUser) => {
      const currentRequestId = ++requestIdRef.current;
      if (!firebaseUser) {
        if (active) {
          setState({
            loading: false,
            firebaseUser: null,
            profile: null,
            error: isFirebaseConfigured ? '' : 'Firebase no está configurado.',
          });
        }
        return;
      }

      if (active) {
        setState({ loading: true, firebaseUser, profile: null, error: '' });
      }

      try {
        const profile = await fetchProfile(firebaseUser);
        if (active && requestIdRef.current === currentRequestId) {
          setState({ loading: false, firebaseUser, profile, error: '' });
        }
      } catch (error) {
        if (active && requestIdRef.current === currentRequestId) {
          setState({
            loading: false,
            firebaseUser,
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
