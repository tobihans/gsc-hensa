import { collection, getDocs } from "firebase/firestore";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { Form as RForm } from "react-router";
import { clientConverter } from "~/data/models/client";
import { db } from "~/firebase.config";
import type { Route } from "./+types/clients";

export const clientLoader = async () => {
  const clientsRef = collection(db, "clients").withConverter(clientConverter);
  const querySnapshot = await getDocs(clientsRef);
  const clients = querySnapshot.docs.map((doc) => doc.data());

  return { clients };
};

// TODO: Implement Create/Update/Delete with client action.
export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const formData = await request.formData();
  console.log(formData.get("fullname"), formData.get("email"));
};

export default function Clients({ loaderData }: Route.ComponentProps) {
  const clients = loaderData.clients;
  const [showOffCanvas, setShowOffCanvas] = useState(false);

  const onAdd = () => {
    // TODO: Reset form state before.
    setShowOffCanvas(true);
  };

  return (
    <>
      <Row className="w-100 d-flex justify-content-between mb-5">
        <Col xs={6} md={11}>
          <h2>Liste des clients</h2>
        </Col>
        <Col xs={6} md={1}>
          <Button
            type="button"
            variant="primary"
            className="w-auto"
            onClick={onAdd}
          >
            Ajouter
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table>
            <thead>
              <tr>
                <th>Nom complet</th>
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
      {/* Form */}
      <Offcanvas
        show={showOffCanvas}
        onHide={() => {
          setShowOffCanvas(false);
        }}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          {/* TODO: Handle case where record is updated or can be deleted. */}
          <Offcanvas.Title>Ajouter un client</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form as={RForm} method="post">
            <Form.Group className="mb-3" controlId="fullname">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                placeholder="Jeanne D'Arc"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="jeannedarc@gmail.com"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                name="phone"
                type="phone"
                placeholder="+2290190909090"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="postalCode">
              <Form.Label>Boîte postale</Form.Label>
              <Form.Control
                name="postalCode"
                type="text"
                placeholder="BP01234"
                defaultValue="BP0000"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="street">
              <Form.Label>Rue</Form.Label>
              <Form.Control
                name="street"
                type="text"
                placeholder="Marché GDM"
                defaultValue="Rue"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="city">
              <Form.Label>Ville</Form.Label>
              <Form.Control
                name="city"
                type="text"
                placeholder="Calavi"
                defaultValue="Calavi"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="country">
              <Form.Label>Pays</Form.Label>
              <Form.Control
                name="country"
                type="text"
                placeholder="BJ"
                defaultValue="BJ"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Enregistrer
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
