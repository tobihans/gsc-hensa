import { useState } from "react";
import { auth } from "../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import Button from "react-bootstrap/Button";
import { Navigate, redirect, useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Rediriger l'utilisateur ou effectuer une autre action après la connexion
      navigate("/test");
    } catch (err: any) {
      setError(err.message);
    }

    // Réinitialiser les champs de saisie
    setEmail("");
    setPassword("");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh", backgroundColor: "#f8f9fa" }}
    >
      <form
        className="d-flex flex-column"
        style={{
          width: "400px",
          margin: "auto",
          paddingTop: "50px",
          border: "1px solid black",
          borderRadius: "5px",
          padding: "20px",
        }}
        onSubmit={handleLogin}
      >
        <h2>Page de connexion</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Entrez votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Mot de passe
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="btn btn-primary">
          Se connecter
        </Button>
        <Button
          type="button"
          className="btn btn-secondary mt-3"
          onClick={() => {
            setEmail("");
            setPassword("");
            setError(null);
          }}
        >
          Annuler
        </Button>
      </form>
    </div>
  );
}
