import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContextt";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Sidebar from "../../../components/Sidebar";
import api from "../../../services/api";
import { Pencil } from "react-bootstrap-icons";

function EditPengumuman() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    attachment: "",
    category: "umum",
  });

  const categories = [
    { value: "umum", label: "Umum" },
    { value: "keamanan", label: "Keamanan" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "iuran", label: "Iuran" },
  ];

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get(`/announcements/${id}`);
      const data = response.data;
      setFormData({
        title: data.title,
        description: data.description || "",
        date: data.date.split("T")[0],
        location: data.location || "",
        attachment: data.attachment || "",
        category: data.category,
      });
    } catch (error) {
      console.error("Error fetching announcement:", error);
      setError("Gagal memuat data pengumuman");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await api.put(`/announcements/${id}`, formData);
      router.push("/pengumuman/semua");
    } catch (error) {
      console.error("Error updating announcement:", error);
      setError("Gagal mengupdate pengumuman. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar activeMenu="announcements" />
        <div className="w-100 d-flex justify-content-center align-items-center vh-100">
          <Spinner animation="border" variant="success" />
        </div>
      </div>
    );
  }

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
          <Button
            variant="link"
            className="text-success p-0 mb-4"
            onClick={() => router.back()}
          >
            ← Kembali
          </Button>

          <Card className="border-0 shadow-sm">
            <Card.Header
              className="bg-white py-3"
              style={{ borderBottom: "2px solid #2e7d32" }}
            >
              <h5 className="mb-0">
                <Pencil className="me-2 text-success" size={24} />
                Edit Pengumuman
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Judul Pengumuman <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan judul pengumuman"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Kategori</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Tanggal <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tuliskan detail pengumuman..."
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lokasi</Form.Label>
                      <Form.Control
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Contoh: Balai Warga"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Lampiran (URL)</Form.Label>
                      <Form.Control
                        type="text"
                        name="attachment"
                        value={formData.attachment}
                        onChange={handleChange}
                        placeholder="https://example.com/file.pdf"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-2 mt-4">
                  <Button variant="success" type="submit" disabled={saving}>
                    {saving ? "Menyimpan..." : "Update Pengumuman"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => router.back()}
                  >
                    Batal
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}

export default function EditPengumumanPage() {
  return (
    <ProtectedRoute>
      <EditPengumuman />
    </ProtectedRoute>
  );
}
