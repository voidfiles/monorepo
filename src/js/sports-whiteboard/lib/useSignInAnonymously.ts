import {
  Auth,
  UserCredential,
  signInAnonymously as firebaseSignInAnonymously,
  AuthError,
} from "firebase/auth";
import { useState, useMemo } from "react";

type AnonymousActionHook = [
  () => Promise<void>,
  UserCredential | undefined,
  boolean,
  AuthError | undefined
];

export default (auth: Auth): AnonymousActionHook => {
  const [error, setError] = useState<AuthError>();
  const [loggedInUser, setLoggedInUser] = useState<UserCredential>();
  const [loading, setLoading] = useState<boolean>(false);

  const signInAnonymously = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const user = await firebaseSignInAnonymously(auth);
      setLoggedInUser(user);
    } catch (err) {
      setError(err as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const resArray: AnonymousActionHook = [
    signInAnonymously,
    loggedInUser,
    loading,
    error,
  ];
  return useMemo<AnonymousActionHook>(() => resArray, resArray);
};
