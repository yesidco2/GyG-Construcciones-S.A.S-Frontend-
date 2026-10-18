import { useEffect, useState } from 'react';
import { fetchProfile, subscribeAuth } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

export default function useAuth() {
  const [state, setState] = useState({
    loading: true,
    firebaseUser: null,
    profile: null,
    error: '',
  });

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const unsubscribe = subscribeAuth(async (firebaseUser) => {
      const currentRequestId = ++requestId;
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
        if (active && requestId === currentRequestId) {
          setState({ loading: false, firebaseUser, profile, error: '' });
        }
      } catch (error) {
        if (active && requestId === currentRequestId) {
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
  };
}
