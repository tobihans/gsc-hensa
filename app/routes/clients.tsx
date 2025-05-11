import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/firebase.config";
import type { Route } from '../+types/root';
import { useLoaderData } from 'react-router';

export async function clientLoader({
    params,
}:Route.ClientLoaderArgs) {
    const clients = await getDocs(collection(db, "clients"))
        .then((querySnapshot) => 
            querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
        );
    return clients;        
}

/* export default function Clients({
    loaderData,
}:Route.ComponentProps) {
    // TDDO:Utiliser un client Loader pour charger les clients
    const clients: [] = loaderData || []; */
    export default function Clients() {
    // TDDO:Utiliser un client Loader pour charger les clients
    const clients = useLoaderData();
    return (
        <Row className=" w-100 d-flex justify-content-between mb-3 ">
            <Col xs={6} md={11}>
                <h2>Liste des clients</h2>
            </Col>
            <Col xs={6} md={1}>
                <Button variant="primary" className="w-auto">Ajouter</Button>
            </Col>
            <Col xs={12} md={12}>
                <ul>
                    {clients.map((client:any) => (
                        <li key={client.id}>
                            <div>Email: {client.email}</div>
                            <div>Nom complet: {client.fullname}</div>
                            <div>Téléphone: {client.phone}</div>
                        </li>
                    ))}
                </ul>
            </Col>
        </Row>
    );
}


/* import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/firebase.config";
import type { Route } from '../+types/root';
import { useLoaderData } from 'react-router';

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs) {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }));
    return clients;
}

export default function Clients() {
    const clients = useLoaderData();
    return (
        <Row className="w-100 d-flex justify-content-between mb-3">
            <Col xs={6} md={11}>
                <h2>Liste des clients</h2>
            </Col>
            <Col xs={6} md={1}>
                <Button variant="primary" className="w-auto">Ajouter</Button>
            </Col>
            <Col xs={12} md={12}>
                <ul>
                    {clients.map((client:any) => (
                        <li key={client.id}>
                            <div>Email: {client.email}</div>
                            <div>Nom complet: {client.fullname}</div>
                            <div>Téléphone: {client.phone}</div>
                        </li>
                    ))}
                </ul>
            </Col>
        </Row>
    );
}
 */