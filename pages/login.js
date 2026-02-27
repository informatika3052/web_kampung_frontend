import { useState } from "react";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContextt";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jika sudah login, redirect ke dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
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
      }}
    >
      <Container className="d-flex justify-content-center">
        <Card style={{ width: "400px" }} className="p-4 shadow">
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
            <p className="text-muted">Silakan login untuk melanjutkan</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Masukkan email"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
              />
            </Form.Group>

            <Button
              variant="success"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </Button>

            <div className="text-center">
              <Link href="/" className="text-success text-decoration-none">
                ← Kembali ke Beranda
              </Link>
            </div>
          </Form>
        </Card>
      </Container>
    </div>
  );
}
