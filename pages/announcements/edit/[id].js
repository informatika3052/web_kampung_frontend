import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Image,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../../context/AuthContextt";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Sidebar from "../../../components/Sidebar";
import { ArrowLeft, Pencil, X, Upload } from "react-bootstrap-icons";

function EditPengumuman() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentImage, setCurrentImage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "umum",
    // attachment akan diisi dengan path file dari server
  });

  const categories = [
    { value: "umum", label: "Umum" },
    { value: "keamanan", label: "Keamanan" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "iuran", label: "Iuran" },
  ];

  // Fungsi untuk mendapatkan URL gambar
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl =
      process.env.NEXT_PUBLIC_UPLOAD_URL || "http://localhost:5000/uploads";
    const cleanPath = path.replace("/uploads", "");
    return `${baseUrl}${cleanPath}`;
  };

  useEffect(() => {
    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/announcements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = res.data;
      setFormData({
        title: data.title,
        description: data.description || "",
        date: data.date.split("T")[0],
        location: data.location || "",
        category: data.category,
      });
      // Simpan gambar saat ini jika ada
      if (data.attachment) {
        setCurrentImage(data.attachment);
      }
    } catch (err) {
      console.error("Error fetching announcement:", err);
      setError("Gagal mengambil data pengumuman");
    } finally {
      setLoading(false);
    }
  };

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

  // Hapus gambar saat ini
  const handleRemoveCurrentImage = () => {
    if (confirm("Apakah Anda yakin ingin menghapus gambar ini?")) {
      setCurrentImage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("date", formData.date);
      formDataToSend.append("location", formData.location || "");
      formDataToSend.append("category", formData.category);

      if (selectedFile) {
        formDataToSend.append("attachment", selectedFile);
      } else {
        formDataToSend.append("existingAttachment", currentImage || "");
      }

      await axios.put(`/announcements/${id}`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Data pengumuman berhasil diupdate!");
      setTimeout(() => {
        router.push("/announcements/semua");
      }, 1500);
    } catch (err) {
      console.error("Error updating announcement:", err);
      setError(err.response?.data?.message || "Gagal mengupdate data");
    } finally {
      setSaving(false);
    }
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
          }}
        >
          <div className="text-center mt-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
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
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center text-center text-md-start mb-4">
            <Button
              variant="link"
              className="text-success p-0 me-3"
              onClick={() => router.back()}
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
                <Pencil className="me-2" size={28} />
                Edit Pengumuman
              </h3>
              <p className="text-muted">Ubah data pengumuman</p>
            </div>
          </div>

          <Row>
            <Col md={8} className="mx-auto">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  <Form onSubmit={handleSubmit} encType="multipart/form-data">
                    <Form.Group className="mb-3">
                      <Form.Label>Judul Pengumuman</Form.Label>
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
                            required
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
                          <Form.Label>Tanggal</Form.Label>
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
                          <Form.Label>Lokasi (Opsional)</Form.Label>
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

                    {/* Preview Gambar Saat Ini */}
                    {currentImage && !selectedFile && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Label>Gambar Saat Ini</Form.Label>
                          <div className="border rounded p-3 bg-light position-relative">
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="position-absolute top-0 end-0 m-2"
                              onClick={handleRemoveCurrentImage}
                              style={{ zIndex: 1 }}
                            >
                              <X size={16} />
                            </Button>
                            <div className="text-center">
                              <Image
                                src={getImageUrl(currentImage)}
                                alt="Current"
                                style={{
                                  maxHeight: "200px",
                                  objectFit: "contain",
                                }}
                                fluid
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    )}

                    {/* Preview Gambar Baru */}
                    {previewUrl && (
                      <Row className="mb-3">
                        <Col md={12}>
                          <Form.Label>Preview Gambar Baru</Form.Label>
                          <div className="border rounded p-3 text-center bg-light">
                            <Image
                              src={previewUrl}
                              alt="Preview"
                              style={{
                                maxHeight: "200px",
                                objectFit: "contain",
                              }}
                              fluid
                            />
                          </div>
                        </Col>
                      </Row>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button variant="secondary" onClick={() => router.back()}>
                        Batal
                      </Button>
                      <Button variant="success" type="submit" disabled={saving}>
                        {saving ? "Menyimpan..." : "Update Pengumuman"}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default function EditPengumumanPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <EditPengumuman />
    </ProtectedRoute>
  );
}
