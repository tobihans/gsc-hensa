import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
export default function Clients() {
    return(
        <Row className="row w-100 d-flex justify-content-between align-items-center">
            <Col xs="6" md="11">
                <h2>Liste des clients</h2>
            </Col>
            <Col xs={6} md="1">
                <Button variant="primary" className="w-auto">Ajouter</Button>
            </Col>
        </Row>
    );
}