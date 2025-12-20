import { useState, useEffect } from 'react';
import { auth } from './config';

export const useUserClaims = () => {
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        user.getIdTokenResult(true).then((idTokenResult) => {
          setClaims(idTokenResult.claims);
        });
      } else {
        setClaims(null);
      }
    });
    return unsubscribe;
  }, [auth]);

  return claims;
};
