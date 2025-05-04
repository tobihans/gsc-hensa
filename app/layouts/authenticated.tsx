import { useEffect } from "react";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";
import { redirect } from "react-router";
import { AuthProvider } from "~/contexts/auth";
import { auth } from "~/firebase.config";
import { isAuthenticated } from "~/utilities/auth";

export const clientLoader = async () => {
  if (!(await isAuthenticated())) {
    return redirect("/login");
  }
};

export default function Authenticated() {
  const navigate = useNavigate();

  // Ensure authentication is still on when navigating.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) navigate("/login");
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
