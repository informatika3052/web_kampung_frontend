import { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      // Register sebagai warga (role default)
      await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "warga", // Default warga
      });

      setSuccess("Pendaftaran berhasil! Silakan login.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Pendaftaran gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "20px 0",
      }}
    >
      <Container className="d-flex justify-content-center">
        <Card style={{ width: "450px" }} className="p-4 shadow">
          <div className="text-center mb-4">
            <Link href="/" style={{ textDecoration: "none" }}>
              <h2
                style={{
                  color: "#2e7d32",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                🌳 Kas Kampung
              </h2>
            </Link>
            <p className="text-muted">Daftar sebagai warga</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Lengkap</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Masukkan email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimal 6 karakter"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Konfirmasi Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi password"
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Loading..." : "Daftar"}
            </Button>

            <div className="text-center">
              <span className="text-muted">Sudah punya akun? </span>
              <Link href="/login" className="text-success text-decoration-none">
                Login
              </Link>
              <br />
              <Link
                href="/"
                className="text-success text-decoration-none small"
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}
