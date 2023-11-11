import { getAuth, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import getApp from "./firebase";
import useSignInAnonumously from "./useSignInAnonymously";

type UserStateRes = [User | null | undefined, Boolean, Error | null];

const useUserState = (): UserStateRes => {
  const [ul, setUL] = useState(true);
  const [ue, setUE] = useState<Error | null>(null);
  const auth = getAuth(getApp());
  const [user, loading, error] = useAuthState(auth);
  const [signInAnonymously, ...others] = useSignInAnonumously(auth);

  useEffect(() => {
    if (!user) {
      signInAnonymously();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setUL(false);
    } else {
      setUL(loading);
    }
  }, [user, loading]);

  useEffect(() => {
    if (error) {
      setUE(error);
    } else {
      setUE(null);
    }
  }, [error]);

  return [user, ul, ue];
};

export default useUserState;
