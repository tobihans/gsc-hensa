import { Outlet } from "react-router";
import { AppNavbar } from "~/components/app-navbar";
import Container from "react-bootstrap/Container";

export default function App() {
  return (
    <Container fluid="xl">
      <AppNavbar />
      <Outlet />
    </Container>
  );
}
