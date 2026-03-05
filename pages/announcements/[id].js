import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Image,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContextt";
import Sidebar from "../../components/Sidebar";
import {
  Megaphone,
  Calendar,
  GeoAlt,
  Person,
  ArrowLeft,
  Pencil,
  Trash2,
  Clock,
  Tag,
} from "react-bootstrap-icons";
import Link from "next/link";

function DetailPengumuman() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch detail pengumuman
  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/announcements/${id}`);
      setAnnouncement(response.data);
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setError("Gagal memuat data pengumuman");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;

    try {
      await axios.delete(`/announcements/${id}`);
      router.push("/announcements");
    } catch (err) {
      alert("Gagal menghapus pengumuman");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl =
      process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:5000/uploads";
    const cleanPath = path.replace("/uploads", "");
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar activeMenu="announcements" />
        <div
          style={{
            width: "100%",
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            padding: "20px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="success" />
            <p className="mt-3">Memuat pengumuman...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
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
          <Container>
            <Button
              variant="link"
              className="text-success p-0 mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} /> Kembali
            </Button>
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <Megaphone size={48} className="text-muted mb-3" />
                <h5>Pengumuman tidak ditemukan</h5>
                <p className="text-muted">
                  Pengumuman yang Anda cari mungkin telah dihapus
                </p>
                <Button
                  variant="success"
                  onClick={() => router.push("/announcements")}
                  className="mt-3"
                >
                  Lihat Semua Pengumuman
                </Button>
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    );
  }

  const category = getCategoryBadge(announcement.category);

  return (
    <div className="d-flex">
      {/* <Sidebar activeMenu="announcements" /> */}

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <Container>
          {/* Header dengan tombol back dan aksi */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button
              variant="link"
              className="text-success p-0"
              onClick={() => router.back()}
            >
              {/* <ArrowLeft size={20} /> Kembali */}
            </Button>

            {user?.role === "admin" && (
              <div>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => router.push(`/announcements/edit/${id}`)}
                >
                  <Pencil size={16} className="me-1" />
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={16} className="me-1" />
                  Hapus
                </Button>
              </div>
            )}
          </div>

          {/* Card Detail Pengumuman */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
              {/* Header dengan kategori dan tanggal */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                  <Badge bg={category.color} className="px-3 py-2">
                    <Tag className="me-1" size={14} />
                    {category.label}
                  </Badge>
                  <Badge bg="light" text="dark" className="px-3 py-2">
                    <Clock className="me-1" size={14} />
                    Dipublikasikan {formatDateTime(announcement.createdAt)}
                  </Badge>
                </div>
                <div className="text-muted small">
                  <Calendar className="me-1" size={14} />
                  {formatDate(announcement.date)}
                </div>
              </div>

              {/* Judul */}
              <h1
                className="display-5 fw-bold mb-4"
                style={{ color: "#1b5e20" }}
              >
                {announcement.title}
              </h1>

              {/* Gambar (jika ada) */}
              {announcement.attachment && (
                <div className="mb-4 text-center">
                  <Image
                    src={getImageUrl(announcement.attachment)}
                    alt={announcement.title}
                    fluid
                    style={{
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Informasi Lokasi (jika ada) */}
              {announcement.location && (
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex align-items-center text-success">
                    <GeoAlt size={20} className="me-2" />
                    <span className="fw-bold">
                      Lokasi: {announcement.location}
                    </span>
                  </div>
                </div>
              )}

              {/* Deskripsi */}
              <div className="mb-5">
                <h5 className="fw-bold mb-3">Deskripsi</h5>
                <div
                  className="text-muted"
                  style={{ fontSize: "1.1rem", lineHeight: "1.8" }}
                >
                  {announcement.description || "Tidak ada deskripsi"}
                </div>
              </div>

              {/* Footer Info */}
              <div className="border-top pt-4 mt-4">
                <Row>
                  <Col md={6}>
                    <div className="d-flex align-items-center text-muted">
                      <Person size={18} className="me-2" />
                      <div>
                        <small className="d-block">Dibuat oleh</small>
                        <span className="fw-bold">
                          {announcement.creator?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-md-end mt-3 mt-md-0">
                    <div className="text-muted">
                      <small>Terakhir diperbarui</small>
                      <div>{formatDateTime(announcement.updatedAt)}</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Tombol navigasi */}
          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-success" onClick={() => router.back()}>
              ← Kembali
            </Button>
            <Link href="/announcements" passHref>
              <Button variant="success">Lihat Semua Pengumuman →</Button>
            </Link>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default function DetailPengumumanPage() {
  return <DetailPengumuman />;
}
