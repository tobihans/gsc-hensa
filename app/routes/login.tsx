import {
  type AuthError,
  AuthErrorCodes,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { redirect, useNavigate } from "react-router";
import { isAuthenticated } from "~/utilities/auth";
import { auth, analytics } from "../firebase.config";
import { logEvent } from "firebase/analytics";

export const clientLoader = async () => {
  if (await isAuthenticated()) {
    return redirect("/");
  }
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // NOTE: This is an example of how to set how long you want the user to stay connected.
      // await setPersistence(auth, inMemoryPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      logEvent(analytics, "login", {
        method: "email",
      });
      navigate("/");
      // biome-ignore lint/suspicious/noExplicitAny: only any/unknown allowed
    } catch (err: any) {
      const error = err as AuthError;

      if (error.code === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
        setError("Identifiants invalides.");
        // TODO: Gérer d'autres cas d'erreur liés à la connexion.
      } else {
        setError("Une erreur est survenue.");
        setPassword("");
      }
    }
  };

  return (
    <Container className="vh-100 d-flex justify-content-center align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={4}>
          <Form className="d-flex flex-column w-100" onSubmit={handleLogin}>
            <h2 className="mb-3">Connexion</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="admin@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button type="submit" variant="primary">
              Se connecter
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
