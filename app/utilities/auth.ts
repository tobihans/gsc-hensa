import { onAuthStateChanged } from "firebase/auth";
import { auth } from "~/firebase.config";

export const isAuthenticated = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};
