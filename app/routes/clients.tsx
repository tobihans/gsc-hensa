import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { collection, getDocs } from "firebase/firestore";
import { db } from "~/firebase.config";

export default function Clients() {
    // TDDO:Utiliser un cliient Loader pour charger les clients
    getDocs(collection(db, "clients"))
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(`${doc.id} => ${doc.data()}`)
                ;
            })
        })
   /* */

    return (
        <Row className=" w-100 d-flex justify-content-between mb-3 ">
            <Col xs={6} md={11}>
                <h2>Liste des clients</h2>
            </Col>
            <Col xs={6} md={1}>
                <Button variant="primary" className="w-auto">Ajouter</Button>
            </Col>
        </Row>
    );
}