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
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../../../context/AuthContextt";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import Sidebar from "../../../../components/Sidebar";
import { ArrowLeft } from "react-bootstrap-icons";

function EditPengeluaran() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    date: "",
    jenis_iuran: "kas_bulanan",
    nama_warga: "",
    amount: "",
    keterangan: "",
  });

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/transactions/${id}`);
      const data = res.data;
      setFormData({
        date: data.date,
        jenis_iuran: data.jenis_iuran,
        nama_warga: data.nama_warga,
        amount: data.amount,
        keterangan: data.keterangan || "",
      });
    } catch (err) {
      console.error("Error fetching transaction:", err);
      setError("Gagal mengambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await axios.put(`/transactions/${id}`, {
        ...formData,
        amount: parseInt(formData.amount),
      });

      setSuccess("Data pengeluaran berhasil diupdate!");
      setTimeout(() => {
        router.push("/kas/pengeluaran");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengupdate data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar activeMenu="pengeluaran" />
        <div
          style={{
            marginLeft: "280px",
            width: "calc(100% - 280px)",
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
      <Sidebar activeMenu="pengeluaran" />

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
                Edit Pengeluaran
              </h3>
              <p className="text-muted">Ubah data pengeluaran kas kampung</p>
            </div>
          </div>

          <Row>
            <Col md={8} className="mx-auto">
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  {error && <Alert variant="danger">{error}</Alert>}
                  {success && <Alert variant="success">{success}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <Row>
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
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Jenis Iuran</Form.Label>
                          <Form.Select
                            name="jenis_iuran"
                            value={formData.jenis_iuran}
                            onChange={handleChange}
                            required
                          >
                            <option value="kas_bulanan">Kas Bulanan</option>
                            <option value="kas_kematian">Kas Kematian</option>
                            <option value="kas_sosial">Kas Sosial</option>
                            <option value="dana_bangunan">Dana Bangunan</option>
                            <option value="lainnya">Lainnya</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nama Warga</Form.Label>
                          <Form.Control
                            type="text"
                            name="nama_warga"
                            value={formData.nama_warga}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nominal (Rp)</Form.Label>
                          <Form.Control
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Keterangan (Opsional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="keterangan"
                        value={formData.keterangan}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="secondary" onClick={() => router.back()}>
                        Batal
                      </Button>
                      <Button variant="success" type="submit" disabled={saving}>
                        {saving ? "Menyimpan..." : "Update Pengeluaran"}
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

export default function EditPengeluaranPage() {
  return (
    <ProtectedRoute adminOnly={true}>
      <EditPengeluaran />
    </ProtectedRoute>
  );
}
