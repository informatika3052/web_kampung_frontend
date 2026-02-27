import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "../context/AuthContextt";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login, redirect ke dashboard
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Jangan tampilkan konten jika sedang loading atau sudah login
  if (loading || user) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Navbar sederhana */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <Container>
          <Link
            href="/"
            className="navbar-brand"
            style={{ color: "#2e7d32", fontWeight: "bold" }}
          >
            🌳 Kas Kampung
          </Link>
          <div className="ms-auto">
            <Link href="/login" className="btn btn-outline-success me-2">
              Login
            </Link>
            <Link href="/register" className="btn btn-success">
              Daftar
            </Link>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <Container className="py-5">
        <Row className="align-items-center min-vh-75">
          <Col lg={6} className="mb-5 mb-lg-0">
            <h1 className="display-4 fw-bold mb-4" style={{ color: "#1b5e20" }}>
              Kelola Kas Kampung dengan Mudah
            </h1>
            <p className="lead mb-4" style={{ color: "#2e7d32" }}>
              Aplikasi pencatatan keuangan untuk kampung yang transparan,
              akuntabel, dan mudah digunakan oleh semua warga.
            </p>
            <div className="d-flex gap-3">
              <Link href="/register" className="btn btn-success btn-lg px-4">
                Daftar Sekarang
              </Link>
              <Link
                href="#fitur"
                className="btn btn-outline-success btn-lg px-4"
              >
                Lihat Fitur
              </Link>
            </div>
          </Col>
          <Col lg={6}>
            <img
              src="/images/illustration.svg"
              alt="Ilustrasi Kas Kampung"
              className="img-fluid"
              style={{ maxHeight: "400px" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/600x400/2e7d32/ffffff?text=Kas+Kampung";
              }}
            />
          </Col>
        </Row>
      </Container>

      {/* Fitur Section */}
      <div id="fitur" className="bg-white py-5">
        <Container>
          <h2 className="text-center mb-5" style={{ color: "#1b5e20" }}>
            Fitur Unggulan
          </h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-1 mb-3">💰</div>
                  <Card.Title className="h4 mb-3">
                    Pencatatan Transaksi
                  </Card.Title>
                  <Card.Text>
                    Catat setiap pemasukan dan pengeluaran kas kampung dengan
                    mudah dan cepat.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-1 mb-3">📊</div>
                  <Card.Title className="h4 mb-3">Laporan Bulanan</Card.Title>
                  <Card.Text>
                    Download laporan keuangan bulanan dalam format PDF untuk
                    arsip.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="display-1 mb-3">📱</div>
                  <Card.Title className="h4 mb-3">Akses untuk Semua</Card.Title>
                  <Card.Text>
                    Warga bisa melihat laporan, admin bisa mengelola data dengan
                    hak akses berbeda.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container className="text-center">
          <p className="mb-0">
            © 2024 Kas Kampung. Aplikasi pengelolaan keuangan kampung.
          </p>
        </Container>
      </footer>
    </div>
  );
}
