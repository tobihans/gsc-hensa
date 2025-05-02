import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router";

export default function Authenticated() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        console.log("User ID: ", uid);
      } else {
        navigate("/login");
      }
    });

    return unsubscribe;
  }, []);

  return <Outlet />;
}
