import { useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContextt";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { Megaphone, Upload, X } from "react-bootstrap-icons";

function BuatPengumuman() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    category: "umum",
    // attachment akan diisi dengan path file setelah upload
  });

  const categories = [
    { value: "umum", label: "Umum" },
    { value: "keamanan", label: "Keamanan" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "iuran", label: "Iuran" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar (jpg, png, jpeg, gif)");
        return;
      }

      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError("Ukuran file maksimal 2MB");
        return;
      }

      setSelectedFile(file);
      setError("");

      // Buat preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hapus file yang dipilih
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    document.getElementById("file-upload").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Buat FormData untuk mengirim file
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("date", formData.date);
      formDataToSend.append("location", formData.location || "");
      formDataToSend.append("category", formData.category);

      // Tambahkan file jika ada (akan disimpan di field attachment)
      if (selectedFile) {
        formDataToSend.append("attachment", selectedFile);
      }

      // Kirim data dengan header multipart/form-data
      await axios.post("/announcements", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Data pengumuman berhasil disimpan!");
      setTimeout(() => {
        router.push("/announcements");
      }, 1500);
    } catch (err) {
      console.error("Error details:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setLoading(false);
    }
  };

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
                <Megaphone className="me-2 text-success" size={24} />
                Buat Pengumuman Baru
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} encType="multipart/form-data">
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
                      <Form.Label>Upload Foto (Opsional)</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="me-2"
                        />
                        {selectedFile && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRemoveFile}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <Form.Text className="text-muted">
                        Format: JPG, PNG, GIF. Maksimal 2MB.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Preview Gambar */}
                {previewUrl && (
                  <Row className="mb-3">
                    <Col md={12}>
                      <Form.Label>Preview Foto</Form.Label>
                      <div className="border rounded p-3 text-center bg-light">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          style={{ maxHeight: "200px", objectFit: "contain" }}
                          fluid
                        />
                      </div>
                    </Col>
                  </Row>
                )}

                <div className="d-flex gap-2 mt-4">
                  <Button variant="success" type="submit" disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan Pengumuman"}
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

export default function BuatPengumumanPage() {
  return (
    <ProtectedRoute>
      <BuatPengumuman />
    </ProtectedRoute>
  );
}
