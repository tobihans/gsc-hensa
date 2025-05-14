import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { data, useFetcher } from "react-router";
import { clientConverter } from "~/data/models/client";
import { db } from "~/firebase.config";
import type { Route } from "./+types/clients";

export const clientLoader = async () => {
  const clientsRef = collection(db, "clients").withConverter(clientConverter);
  const queryRef = query(clientsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(queryRef);
  const clients = querySnapshot.docs.map((doc) => doc.data());

  return { clients };
};

// TODO: Implement Create/Update/Delete with client action.
export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const formData = await request.formData();
  // console.log(formData.get("fullname"), formData.get("email"));
  // TODO: Add data validation layer with a lib like Zod...
  const fullname = formData.get("fullname") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const postalCode = formData.get("postalCode") as string;
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;

  const clientsRef = collection(db, "clients").withConverter(clientConverter);
  try {
    const docRef = await addDoc(clientsRef, {
      fullname,
      email,
      phone,
      address: {
        postalCode,
        street,
        city,
        country,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return data({ uid: docRef.id, error: null }, { status: 201 });
  } catch (e) {
    console.error("Error adding document: ", e);
    // TODO: Handle errors and provide approrpiate responses.
    return data({ uid: null, error: String(e) }, { status: 400 });
  }
};

export default function Clients({ loaderData }: Route.ComponentProps) {
  const clients = loaderData.clients;
  const fetcher = useFetcher<Awaited<ReturnType<typeof clientAction>>>();
  const isLoading = useMemo(() => fetcher.state !== "idle", [fetcher]);
  const [showOffCanvas, setShowOffCanvas] = useState(false);

  useEffect(() => {
    if (fetcher.data?.data?.uid) setShowOffCanvas(false);
  }, [fetcher]);

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
            onClick={() => setShowOffCanvas(true)}
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
                  <td>{String(client.createdAt?.toLocaleString())}</td>
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
          <Form as={fetcher.Form} method="post">
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

            <Button variant="primary" type="submit" disabled={isLoading}>
              <span>Enregistrer</span>
              {isLoading && (
                <Spinner className="ms-1" animation="border" size="sm" />
              )}
            </Button>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
