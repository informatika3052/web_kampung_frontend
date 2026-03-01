import { useRouter } from "next/router";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContextt";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { Megaphone, Calendar, FileText, Tag } from "react-bootstrap-icons";

function PengumumanIndex() {
  const router = useRouter();
  const { user } = useAuth();

  const menuCards = [
    {
      title: "Semua Pengumuman",
      icon: <Megaphone size={40} className="text-success" />,
      description: "Lihat semua pengumuman dan informasi terbaru",
      link: "/announcements/semua",
      color: "success",
      roles: ["admin", "warga"],
    },
    {
      title: "Kegiatan Warga",
      icon: <Calendar size={40} className="text-primary" />,
      description: "Informasi kegiatan dan acara warga",
      link: "/announcements/kegiatan",
      color: "primary",
      roles: ["admin", "warga"],
    },
    {
      title: "Pengumuman Umum",
      icon: <FileText size={40} className="text-info" />,
      description: "Pengumuman umum dan informasi penting",
      link: "/announcements/umum",
      color: "info",
      roles: ["admin", "warga"],
    },
    {
      title: "Kategori",
      icon: <Tag size={40} className="text-warning" />,
      description: "Filter pengumuman berdasarkan kategori",
      link: "/announcements/kategori",
      color: "warning",
      roles: ["admin", "warga"],
    },
  ];

  // Filter menu berdasarkan role
  const filteredMenu = menuCards.filter((menu) =>
    menu.roles.includes(user?.role),
  );

  return (
    <div className="d-flex">
      <Sidebar activeMenu="announcements" />

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start mb-4">
            <div>
              <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
                📢 Pengumuman
              </h3>
              <p className="text-muted">Informasi dan pengumuman untuk warga</p>
            </div>
            {user?.role === "admin" && (
              <Button
                variant="success"
                onClick={() => router.push("/announcements/tambah")}
                className="mt-3 mt-md-0"
              >
                + Buat Pengumuman Baru
              </Button>
            )}
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
                      Lihat →
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Preview Pengumuman Terbaru */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">📋 Pengumuman Terbaru</h5>
                  <Row>
                    <Col md={4}>
                      <div className="d-flex align-items-center p-3 border rounded mb-3 mb-md-0">
                        <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                          <Megaphone className="text-success" size={20} />
                        </div>
                        <div>
                          <small className="text-muted d-block">Hari Ini</small>
                          <span className="fw-bold">Rapat Warga Bulanan</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center p-3 border rounded mb-3 mb-md-0">
                        <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                          <Calendar className="text-primary" size={20} />
                        </div>
                        <div>
                          <small className="text-muted d-block">Besok</small>
                          <span className="fw-bold">Kerja Bakti</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="d-flex align-items-center p-3 border rounded">
                        <div className="bg-warning bg-opacity-10 p-2 rounded-circle me-3">
                          <Tag className="text-warning" size={20} />
                        </div>
                        <div>
                          <small className="text-muted d-block">
                            Pengumuman
                          </small>
                          <span className="fw-bold">Pembayaran Iuran</span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <div className="text-center mt-3">
                    <Button
                      variant="link"
                      className="text-success"
                      onClick={() => router.push("/pengumuman/semua")}
                    >
                      Lihat Semua Pengumuman →
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default function PengumumanPage() {
  return (
    <ProtectedRoute>
      <PengumumanIndex />
    </ProtectedRoute>
  );
}
