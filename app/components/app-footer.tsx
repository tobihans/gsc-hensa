import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export function AppFooter() {
    return(
        <>
            <Row className=" bg-body-secondary pb-2 pt-2 position-absolute bottom-0 w-100 m-auto">
                <Col xs={12} md={12} className="d-flex justify-content-center align-items-center">
                    @copyright 2025
                </Col>
            </Row>
        </>
    )
}