import { useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContextt";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { Cash, Wallet2, FileEarmarkPdf, GraphUp } from "react-bootstrap-icons";

function KasIndex() {
  const router = useRouter();
  const { user } = useAuth();

  const menuCards = [
    {
      title: "Pemasukan",
      icon: <Cash size={40} className="text-success" />,
      description: "Kelola data pemasukan kas kampung",
      link: "/kas/pemasukan",
      color: "success",
      roles: ["admin", "warga"],
    },
    {
      title: "Pengeluaran",
      icon: <Wallet2 size={40} className="text-danger" />,
      description: "Kelola data pengeluaran kas kampung",
      link: "/kas/pengeluaran",
      color: "danger",
      roles: ["admin", "warga"],
    },
    {
      title: "Laporan Bulanan",
      icon: <FileEarmarkPdf size={40} className="text-primary" />,
      description: "Download laporan keuangan bulanan",
      link: "/kas/laporan",
      color: "primary",
      roles: ["admin", "warga"],
    },
    {
      title: "Statistik",
      icon: <GraphUp size={40} className="text-info" />,
      description: "Lihat grafik dan analisis keuangan",
      link: "/kas/statistik",
      color: "info",
      roles: ["admin", "warga"],
    },
  ];

  // Filter menu berdasarkan role
  const filteredMenu = menuCards.filter((menu) =>
    menu.roles.includes(user?.role),
  );

  return (
    <div className="d-flex">
      <Sidebar activeMenu="kas" />

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <Container fluid>
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center text-center text-md-start mb-4">
            <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
              Manajemen Kas Kampung
            </h3>
            <p className="text-muted">
              Pilih menu untuk mengelola keuangan kas kampung
            </p>
          </div>

          {/* Menu Cards */}
          <Row>
            {filteredMenu.map((menu, index) => (
              <Col md={6} lg={3} className="mb-4" key={index}>
                <Card
                  className={`border-0 shadow-sm h-100 cursor-pointer`}
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push(menu.link)}
                >
                  <Card.Body className="text-center p-4">
                    <div className={`mb-3`}>{menu.icon}</div>
                    <Card.Title className={`fw-bold text-${menu.color}`}>
                      {menu.title}
                    </Card.Title>
                    <Card.Text className="text-muted small">
                      {menu.description}
                    </Card.Text>
                    <Button
                      variant={`outline-${menu.color}`}
                      size="sm"
                      className="mt-2"
                    >
                      Lihat Detail →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Info Ringkasan */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body>
                  <h5 className="mb-3">📊 Ringkasan Cepat</h5>
                  <Row>
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                          <Cash className="text-success" />
                        </div>
                        <div>
                          <small className="text-muted">Total Pemasukan</small>
                          <h6 className="mb-0">Rp 0</h6>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                          <Wallet2 className="text-danger" />
                        </div>
                        <div>
                          <small className="text-muted">
                            Total Pengeluaran
                          </small>
                          <h6 className="mb-0">Rp 0</h6>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                          <GraphUp className="text-primary" />
                        </div>
                        <div>
                          <small className="text-muted">Saldo Akhir</small>
                          <h6 className="mb-0">Rp 0</h6>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default function KasPage() {
  return (
    <ProtectedRoute>
      <KasIndex />
    </ProtectedRoute>
  );
}
