import Button from "react-bootstrap/Button";
import { useAuth } from "~/contexts/auth";

export default function Test() {
  const { user } = useAuth();

  return (
    <div>
      <h1>{user?.email}</h1>
      <Button>Click me !</Button>
    </div>
  );
}
