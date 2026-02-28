import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContextt";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import GrafikKeuangan from "../components/GrafikKeuangan";
import { useRouter } from "next/router";

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    saldoSaatIni: 0,
    pemasukanBulanIni: 0,
    pengeluaranBulanIni: 0,
  });
  const [grafikData, setGrafikData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Ambil data ringkasan
      console.log("Fetching summary...");
      const summaryRes = await axios.get("/dashboard/summary");
      console.log("Summary response:", summaryRes.data);
      setSummary(summaryRes.data);

      // Ambil data grafik 6 bulan
      console.log("Fetching grafik...");
      const grafikRes = await axios.get("/dashboard/grafik-6-bulan");
      console.log("Grafik response:", grafikRes.data);
      setGrafikData(grafikRes.data);

      // Ambil 5 transaksi terbaru - dengan error handling khusus
      console.log("Fetching recent transactions...");
      try {
        const recentRes = await axios.get(
          "/dashboard/recent-transactions?limit=5",
        );
        console.log("Recent response:", recentRes.data);
        setRecentTransactions(recentRes.data);
      } catch (recentErr) {
        console.warn(
          "Gagal mengambil transaksi terbaru, menggunakan data dummy:",
          recentErr.message,
        );
        // Set data dummy jika endpoint belum tersedia
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error("❌ Error detail:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      // Set data default jika error
      setSummary({
        saldoSaatIni: 0,
        pemasukanBulanIni: 0,
        pengeluaranBulanIni: 0,
      });
      setGrafikData([]);
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Format rupiah
  const formatRupiah = (angka) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  return (
    <div className="d-flex">
      <Sidebar activeMenu="dashboard" />

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
          <div className="mb-4">
            <h3
              style={{
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              Dashboard Kas
            </h3>
            <p className="text-muted">
              Selamat datang, {user?.name} |{" "}
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Statistik Cards */}
          <Row className="mb-4">
            <Col md={4} className="p-1">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <span className="fs-2">💰</span>
                    </div>
                    <div>
                      <p className="text-muted mb-1">Saldo Saat Ini</p>
                      <h4 className="mb-0 fw-bold" style={{ color: "#2e7d32" }}>
                        {formatRupiah(summary.saldoSaatIni)}
                      </h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="p-1">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <span className="fs-2">📈</span>
                    </div>
                    <div>
                      <p className="text-muted mb-1">Pemasukan Bulan Ini</p>
                      <h4 className="mb-0 fw-bold text-success">
                        {formatRupiah(summary.pemasukanBulanIni)}
                      </h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="p-1">
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <span className="fs-2">📉</span>
                    </div>
                    <div>
                      <p className="text-muted mb-1">Pengeluaran Bulan Ini</p>
                      <h4 className="mb-0 fw-bold text-danger">
                        {formatRupiah(summary.pengeluaranBulanIni)}
                      </h4>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Grafik */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <GrafikKeuangan data={grafikData} />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Transaksi Terbaru */}
          <Row>
            <Col md={12}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Transaksi Terbaru</h5>
                    <Button
                      variant="link"
                      className="text-success text-decoration-none"
                      onClick={() => router.push("/kas")}
                    >
                      Lihat Semua →
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Tanggal</th>
                        <th>Jenis Iuran</th>
                        <th>Nama Warga</th>
                        <th>Nominal</th>
                        <th>Tipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>
                            {new Date(t.date).toLocaleDateString("id-ID")}
                          </td>
                          <td>{t.jenis_iuran.replace("_", " ")}</td>
                          <td>{t.nama_warga}</td>
                          <td
                            className={
                              t.type === "income"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {formatRupiah(t.amount)}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${t.type === "income" ? "success" : "danger"}`}
                            >
                              {t.type === "income"
                                ? "Pemasukan"
                                : "Pengeluaran"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
