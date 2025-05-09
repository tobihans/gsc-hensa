import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  layout("layouts/app.tsx", [
    index("routes/home.tsx"),
    route("test", "routes/test.tsx"),
    route("clients", "routes/clients.tsx")
  ]),

] satisfies RouteConfig;
