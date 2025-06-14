import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import Row from "react-bootstrap/Row";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import InputGroup from "react-bootstrap/InputGroup";
import { type SubmitTarget, data, useFetcher } from "react-router";
import {
  type Address,
  type Client,
  clientConverter,
} from "~/data/models/client";
import { analytics, db } from "~/firebase.config";
import type { Route } from "./+types/clients";
import { logEvent } from "firebase/analytics";

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
  const url = new URL(request.url);
  const phone = url.searchParams.get("phone") || "";
  const pageSize = Number(url.searchParams.get("pageSize")) || 10;
  const page = Number(url.searchParams.get("page")) || 1;


  let q = query(
      collection(db, "clients").withConverter(clientConverter),
      orderBy("fullname")
  );


  if (phone) {
    q = query(
        collection(db, "clients").withConverter(clientConverter),
        where("phone", "==", phone),
        orderBy("fullname")
    );
  }

  // Pagination
  let paginatedQuery;
  if (page === 1) {
    paginatedQuery = query(q, limit(pageSize));
  } else {

    const previousQuery = query(q, limit((page - 1) * pageSize));
    const previousSnapshot = await getDocs(previousQuery);
    const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];
    paginatedQuery = query(q, startAfter(lastVisible), limit(pageSize));
  }

  const querySnapshot = await getDocs(paginatedQuery);
  const clients = querySnapshot.docs.map((doc) => doc.data());


  const countSnapshot = await getCountFromServer(q);
  const total = countSnapshot.data().count;

  return { clients, total, page, pageSize, phone };
};

export const clientAction = async ({ request }: Route.ClientActionArgs) => {
  const formData = await request.formData();

  if (request.method === "DELETE") {
    const uid = formData.get("uid");
    if (uid) {
      await deleteDoc(doc(db, "clients", uid as string));
      logEvent(analytics, "clients:deleted", {
        uid,
      });
    }
    return data({}, { status: 204 });
  }

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
      logEvent(analytics, "clients:added", {
        uid: docRef.id,
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
    logEvent(analytics, "clients:updated", {
      uid,
    });
    return data({}, { status: 204 });
  } catch (e) {
    console.error("Error adding/updating document: ", e);
    return data({ uid: null, error: String(e) }, { status: 400 });
  }
};

export default function Clients({ loaderData }: Route.ComponentProps) {
  const { clients, total, page, pageSize, phone } = loaderData;
  const form = useRef<HTMLFormElement | null>(null);
  const fetcher = useFetcher<Awaited<ReturnType<typeof clientAction>>>();
  const isLoading = useMemo(() => fetcher.state !== "idle", [fetcher]);
  const [showOffCanvas, setShowOffCanvas] = useState(false);
  const [currentClient, setCurrentClient] = useState<
      (Client & { address: Address }) | null
  >(null);


  const [searchPhone, setSearchPhone] = useState(phone || "");
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);


  const updateURL = (newPhone: string, newPage: number, newPageSize: number) => {
    const params = new URLSearchParams();
    if (newPhone) params.set("phone", newPhone);
    params.set("page", newPage.toString());
    params.set("pageSize", newPageSize.toString());
    window.location.href = `${window.location.pathname}?${params.toString()}`;
  };

  const handleSearch = () => {
    updateURL(searchPhone, 1, currentPageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setCurrentPageSize(newPageSize);
    updateURL(searchPhone, 1, newPageSize);
  };

  const handlePageChange = (newPage: number) => {
    updateURL(searchPhone, newPage, currentPageSize);
  };

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

  // Calcul de la pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
      <>

        <Row className="mb-4">
          <Col>
            <h2 className="fw-bold text-start">Liste des clients</h2>
          </Col>
        </Row>

        <Row className="mb-5 align-items-center g-2">
          <Col xs={12} md={7} lg={6}>
            <InputGroup>
              <Form.Control
                  type="text"
                  placeholder="Recherche par téléphone"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ minWidth: 220, maxWidth: 400 }}
              />
              <Button variant="outline-primary" onClick={handleSearch}>
                Rechercher
              </Button>
            </InputGroup>
          </Col>
          <Col xs={6} md="auto">
            <Form.Select
                value={currentPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                style={{ minWidth: 80 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </Col>
          <Col xs={6} md="auto">
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
                  <tr
                      key={client.uid}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setCurrentClient(client);
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
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
              >
                Précédent
              </Button>
              <span>
              Page {page} sur {totalPages} - Total: {total} clients
            </span>
              <Button
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </Col>
        </Row>


        <Offcanvas
            show={showOffCanvas}
            onHide={() => {
              setShowOffCanvas(false);
              setCurrentClient(null);
            }}
            placement="end"
        >
          <Offcanvas.Header closeButton>
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
                    defaultValue={currentClient?.address?.city ?? "Calavi"}
                    required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="country">
                <Form.Label>Pays</Form.Label>
                <Form.Control
                    name="country"
                    type="text"
                    placeholder="BJ"
                    defaultValue={currentClient?.address?.country ?? "BJ"}
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
