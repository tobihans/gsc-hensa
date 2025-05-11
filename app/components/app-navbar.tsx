import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link, useNavigate } from "react-router";
import { useAuth } from "~/contexts/auth";
import { signOut } from "firebase/auth";
import { auth } from "~/firebase.config";

export function AppNavbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      // TODO: Handle logout errors
    }
  };

  return (
    <>
      <Navbar expand="sm" className="bg-body-tertiary mb-3">
        <Container fluid>
          <Navbar.Brand>
            <Link to="/" className="navbar-brand">
              GSC
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="offcanvasNavbar" />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="start"
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav className="justify-content-start flex-grow-1 pe-3">
                <Link to="/" className="nav-link">
                  Accueil
                </Link>
                <Link to="/clients" className="nav-link">
                  Clients
                </Link>
                <NavDropdown
                  title={user?.displayName ?? user?.email ?? "Lambda"}
                  id="offcanvasNavbarDropdown"
                  className="ms-auto"
                >
                  <NavDropdown.Item
                    className="text-danger"
                    onClick={() => logout()}
                  >
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </>
  );
}
