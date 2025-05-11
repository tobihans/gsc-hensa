import { collection, getDocs } from "firebase/firestore";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { clientConverter } from "~/data/models/client";
import { db } from "~/firebase.config";
import type { Route } from "./+types/clients";

export const clientLoader = async () => {
  const clientsRef = collection(db, "clients").withConverter(clientConverter);
  const querySnapshot = await getDocs(clientsRef);
  const clients = querySnapshot.docs.map((doc) => doc.data());

  return { clients };
};

export default function Clients({ loaderData }: Route.ComponentProps) {
  const clients = loaderData.clients;

  return (
    <>
      <Row className="w-100 d-flex justify-content-between mb-5">
        <Col xs={6} md={11}>
          <h2>Liste des clients</h2>
        </Col>
        <Col xs={6} md={1}>
          <Button variant="primary" className="w-auto">
            Ajouter
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Ajouté le</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.uid} style={{ cursor: "pointer" }}>
                  <td>{client.fullname}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{String(client.address)}</td>
                  <td>{String(client.createdAt.toLocaleString())}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  );
}
