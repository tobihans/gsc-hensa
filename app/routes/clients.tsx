import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import { type SubmitTarget, data, useFetcher } from "react-router";
import {
  type Address,
  type Client,
  clientConverter,
} from "~/data/models/client";
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
  // await new Promise((resolve) => setTimeout(resolve, 10000));
  const formData = await request.formData();

  if (request.method === "DELETE") {
    const uid = formData.get("uid");
    if (uid) {
      await deleteDoc(doc(db, "clients", uid as string));
    }
    return data({}, { status: 204 });
  }

  // TODO: Add data validation layer
  const clientDoc = {
    fullname: formData.get("fullname") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: {
      postalCode: formData.get("postalCode") as string,
      street: formData.get("street") as string,
      city: formData.get("city") as string,
      country: formData.get("country") as string,
    },
  };

  try {
    if (request.method === "POST") {
      const clientsRef = collection(db, "clients").withConverter(
        clientConverter,
      );
      const docRef = await addDoc(clientsRef, {
        ...clientDoc,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return data({ uid: docRef.id, error: null }, { status: 201 });
    }

    // PUT method
    const uid = formData.get("uid");
    if (!uid)
      return data({ uid: null, error: "Missing document id" }, { status: 400 });

    await setDoc(
      doc(db, "clients", uid as string),
      { ...clientDoc, updatedAt: new Date() },
      { merge: true },
    );
    return data({ uid: null, error: null }, { status: 204 });
  } catch (e) {
    console.error("Error adding/updating document: ", e);
    // TODO: Handle errors and provide approrpiate responses.
    return data({ uid: null, error: String(e) }, { status: 400 });
  }
};

export default function Clients({ loaderData }: Route.ComponentProps) {
  const { clients } = loaderData;
  const form = useRef<HTMLFormElement | null>(null);
  const fetcher = useFetcher<Awaited<ReturnType<typeof clientAction>>>();
  const isLoading = useMemo(() => fetcher.state !== "idle", [fetcher]);
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const [currentClient, setCurrentClient] = useState<
    (Client & { address: Address }) | null
  >(null);

  const onCreateOrUpdate = async () => {
    if (form.current)
      await fetcher.submit(form.current as HTMLFormElement, {
        method: currentClient ? "PUT" : "POST",
      });
  };
  const onDelete = async () => {
    if (currentClient)
      await fetcher.submit({ uid: currentClient.uid } as SubmitTarget, {
        method: "DELETE",
      });
  };

  useEffect(() => {
    const status = fetcher.data?.init?.status;
    if (status && status >= 200 && status <= 299) setShowOffCanvas(false);
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
            onClick={() => {
              setShowOffCanvas(true);
              setCurrentClient(null);
            }}
          >
            Ajouter
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table responsive>
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
                // biome-ignore lint/a11y/useKeyWithClickEvents: .
                <tr
                  key={client.uid}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setCurrentClient(client as Client & { address: Address });
                    setShowOffCanvas(true);
                  }}
                >
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
          setCurrentClient(null);
        }}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          {/* TODO: Handle case where record is updated or can be deleted. */}
          <Offcanvas.Title>
            <span>
              {currentClient ? currentClient.fullname : "Ajouter un client"}
            </span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form ref={form}>
            {currentClient && (
              <input type="hidden" name="uid" value={currentClient.uid} />
            )}

            <Form.Group className="mb-3" controlId="fullname">
              <Form.Label>Nom complet</Form.Label>
              <Form.Control
                type="text"
                name="fullname"
                placeholder="Jeanne D'Arc"
                defaultValue={currentClient?.fullname}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="jeannedarc@gmail.com"
                defaultValue={currentClient?.email}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Téléphone</Form.Label>
              <Form.Control
                name="phone"
                type="phone"
                placeholder="+2290190909090"
                defaultValue={currentClient?.phone}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="postalCode">
              <Form.Label>Boîte postale</Form.Label>
              <Form.Control
                name="postalCode"
                type="text"
                placeholder="BP01234"
                defaultValue={currentClient?.address?.postalCode ?? "BP0000"}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="street">
              <Form.Label>Rue</Form.Label>
              <Form.Control
                name="street"
                type="text"
                placeholder="Marché GDM"
                defaultValue={currentClient?.address?.street ?? "Rue"}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="city">
              <Form.Label>Ville</Form.Label>
              <Form.Control
                name="city"
                type="text"
                placeholder="Calavi"
                defaultValue={currentClient?.address?.street ?? "Calavi"}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="country">
              <Form.Label>Pays</Form.Label>
              <Form.Control
                name="country"
                type="text"
                placeholder="BJ"
                defaultValue={currentClient?.address?.street ?? "BJ"}
                required
              />
            </Form.Group>

            <div className="d-flex gap-3 align-items-center justify-content-start">
              {isLoading && <Spinner animation="border" size="sm" />}
              <Button
                variant="primary"
                type="button"
                disabled={isLoading}
                onClick={() => onCreateOrUpdate()}
              >
                <span>Enregistrer</span>
              </Button>
              {currentClient && (
                <Button
                  variant="outline-danger"
                  type="button"
                  onClick={() => onDelete()}
                >
                  <span>Supprimer</span>
                </Button>
              )}
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
