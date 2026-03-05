import { Container, Row, Col, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useAuth } from "../context/AuthContextt";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Megaphone, Calendar, GeoAlt, Clock } from "react-bootstrap-icons";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [latestAnnouncements, setLatestAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    // Jika sudah login, redirect ke dashboard
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Fetch pengumuman terbaru
  useEffect(() => {
    const fetchLatestAnnouncements = async () => {
      try {
        const response = await axios.get("/announcements/recent?limit=3");
        setLatestAnnouncements(response.data);
        // console.log("Fetched announcements:", response.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };

    if (!user) {
      fetchLatestAnnouncements();
    }
  }, [user]);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    return `${API_URL}${path}`;
  };

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Format waktu relatif (hari ini, kemarin, dll)
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays <= 7) return `${diffDays} hari lalu`;
    return formatDate(dateString);
  };

  // Dapatkan badge warna untuk kategori
  const getCategoryBadge = (category) => {
    const colors = {
      umum: "secondary",
      keamanan: "danger",
      kegiatan: "success",
      iuran: "primary",
    };
    const labels = {
      umum: "Umum",
      keamanan: "Keamanan",
      kegiatan: "Kegiatan",
      iuran: "Iuran",
    };
    return {
      color: colors[category] || "secondary",
      label: labels[category] || category,
    };
  };

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
        <Row className="align-items-center">
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
          <Col lg={6} className="d-flex justify-content-center">
            {/* Bisa tambahkan ilustrasi di sini */}
          </Col>
        </Row>
      </Container>

      {/* SECTION PENGUMUMAN TERBARU - TAMBAHAN BARU */}
      <Container className="py-5">
        <Row>
          <Col md={12}>
            <div className="d-flex align-items-center mb-4">
              <Megaphone size={32} className="text-success me-3" />
              <h2 className="h3 mb-0" style={{ color: "#1b5e20" }}>
                Pengumuman Terbaru
              </h2>
            </div>
          </Col>
        </Row>

        {loadingAnnouncements ? (
          <Row>
            <Col md={12} className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Memuat pengumuman...</p>
            </Col>
          </Row>
        ) : latestAnnouncements.length === 0 ? (
          <Row>
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body className="text-center py-5">
                  <Megaphone size={48} className="text-muted mb-3" />
                  <h5>Belum ada pengumuman</h5>
                  <p className="text-muted mb-0">
                    Pengumuman akan muncul di sini
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            {latestAnnouncements.map((item) => {
              const category = getCategoryBadge(item.category);
              return (
                <Col md={4} key={item.id} className="mb-4">
                  <Card className="h-100 border-0 shadow-sm hover-effect">
                    {item.attachment && (
                      <div
                        style={{
                          height: "180px",
                          overflow: "hidden",
                          borderTopLeftRadius: "calc(0.375rem - 1px)",
                          borderTopRightRadius: "calc(0.375rem - 1px)",
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={getImageUrl(item.attachment)}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.onerror = null; // Mencegah infinite loop
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-size='14' text-anchor='middle' dy='.3em' fill='%23999'%3EGambar%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span
                          className={`badge bg-${category.color} bg-opacity-10 text-${category.color} px-3 py-2 rounded-pill`}
                        >
                          {category.label}
                        </span>
                        <small className="text-muted d-flex align-items-center">
                          <Clock size={12} className="me-1" />
                          {getRelativeTime(item.date)}
                        </small>
                      </div>
                      <Card.Title className="h5 mb-2">{item.title}</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        {item.description && item.description.length > 100
                          ? item.description.substring(0, 100) + "..."
                          : item.description || "Tidak ada deskripsi"}
                      </Card.Text>
                      {item.location && (
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <GeoAlt size={12} className="me-1" />
                          {item.location}
                        </div>
                      )}
                      <div className="d-flex align-items-center text-muted small">
                        <Calendar size={12} className="me-1" />
                        {formatDate(item.date)}
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 pt-0 pb-3">
                      <Link
                        href={`/announcements/${item.id}`}
                        className="btn btn-outline-success btn-sm w-100"
                      >
                        Baca Selengkapnya
                      </Link>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {latestAnnouncements.length > 0 && (
          <Row className="mt-3">
            <Col md={12} className="text-center">
              <Link href="/announcements" className="btn btn-outline-success">
                Lihat Semua Pengumuman →
              </Link>
            </Col>
          </Row>
        )}
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
            © {new Date().getFullYear()} Aplikasi Website Pengelolaan Kampung.
          </p>
        </Container>
      </footer>

      {/* Tambahkan CSS untuk efek hover */}
      <style jsx>{`
        .hover-effect {
          transition:
            transform 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        }
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
