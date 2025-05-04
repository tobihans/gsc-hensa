import { Outlet } from "react-router";
import { redirect } from "react-router";
import { isAuthenticated } from "~/utilities/auth";

export const clientLoader = async () => {
  if (!(await isAuthenticated())) {
    return redirect("/login");
  }
};

export default function Authenticated() {
  return <Outlet />;
}
