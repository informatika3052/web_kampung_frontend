import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContextt";
import ProtectedRoute from "../components/ProtectedRoute";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/router";

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    amount: "",
    type: "income",
  });
  const [error, setError] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

  // Set active menu from URL query
  useEffect(() => {
    if (router.query.menu) {
      setActiveMenu(router.query.menu);
    }
  }, [router.query]);

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/transactions?month=${month}&year=${year}`);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available years
  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get("/transactions/years");
      setAvailableYears(res.data);
    } catch (err) {
      console.error("Gagal mengambil data tahun:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchAvailableYears();
  }, [month, year]);

  // Get year options (combine DB years with current year)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = new Set();

    availableYears.forEach((y) => years.add(y));
    years.add(currentYear);
    years.add(currentYear - 1);
    years.add(currentYear - 2);

    return Array.from(years).sort((a, b) => b - a);
  };

  // Handle modal
  const handleShowModal = (transaction = null) => {
    if (transaction) {
      setCurrentTransaction(transaction);
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
      });
    } else {
      setCurrentTransaction(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "income",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTransaction) {
        await axios.put(`/transactions/${currentTransaction.id}`, formData);
      } else {
        await axios.post("/transactions", formData);
      }
      fetchTransactions();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan");
    }
  };

  // Delete transaction
  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      try {
        await axios.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        alert("Gagal menghapus transaksi");
      }
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    try {
      const response = await axios.get(
        `/reports/monthly?month=${month}&year=${year}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `laporan-kas-${month}-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal download PDF");
    }
  };

  // Upload Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/import/excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Import data berhasil");
      fetchTransactions();
      fetchAvailableYears(); // Refresh tahun setelah import
    } catch (err) {
      alert(err.response?.data?.message || "Import gagal");
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <>
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="text-white bg-success">
                  <Card.Body>
                    <Card.Title>Total Pemasukan</Card.Title>
                    <h3>Rp {totalIncome.toLocaleString("id-ID")}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-white bg-danger">
                  <Card.Body>
                    <Card.Title>Total Pengeluaran</Card.Title>
                    <h3>Rp {totalExpense.toLocaleString("id-ID")}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-white bg-primary">
                  <Card.Body>
                    <Card.Title>Saldo Akhir</Card.Title>
                    <h3>Rp {balance.toLocaleString("id-ID")}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filter and Actions */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex gap-2">
                <Form.Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{ width: "120px" }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      Bulan {m}
                    </option>
                  ))}
                </Form.Select>

                <Form.Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ width: "100px" }}
                >
                  {getYearOptions().map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Select>
              </div>

              {user?.role === "admin" && (
                <div className="d-flex gap-2">
                  <Button variant="success" onClick={() => handleShowModal()}>
                    + Tambah Transaksi
                  </Button>
                  <Button variant="info" onClick={handleDownloadPDF}>
                    Download PDF
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                      id="excel-upload"
                    />
                    <Button
                      variant="warning"
                      onClick={() =>
                        document.getElementById("excel-upload").click()
                      }
                    >
                      Import Excel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Transactions Table */}
            <Card>
              <Card.Body>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Deskripsi</th>
                      <th>Jumlah</th>
                      <th>Tipe</th>
                      {user?.role === "admin" && <th>Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={user?.role === "admin" ? 5 : 4}
                          className="text-center"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={user?.role === "admin" ? 5 : 4}
                          className="text-center"
                        >
                          Tidak ada transaksi
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t.id}>
                          <td>{t.date}</td>
                          <td>{t.description}</td>
                          <td>Rp {t.amount.toLocaleString("id-ID")}</td>
                          <td>
                            <Badge
                              bg={t.type === "income" ? "success" : "danger"}
                            >
                              {t.type === "income"
                                ? "Pemasukan"
                                : "Pengeluaran"}
                            </Badge>
                          </td>
                          {user?.role === "admin" && (
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleShowModal(t)}
                                className="me-2"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(t.id)}
                              >
                                Hapus
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        );

      case "transactions":
        return (
          <Card>
            <Card.Body>
              <h4>Halaman Transaksi</h4>
              <p>
                Menampilkan semua riwayat transaksi dengan tampilan lebih
                detail.
              </p>
              {/* Bisa tambahkan fitur pencarian, filter lebih lanjut, dll */}
            </Card.Body>
          </Card>
        );

      case "reports":
        return (
          <Card>
            <Card.Body>
              <h4>Laporan Keuangan</h4>
              <p>Generate laporan keuangan dalam berbagai format.</p>
              <Button
                variant="success"
                onClick={handleDownloadPDF}
                className="me-2"
              >
                Download PDF Bulan Ini
              </Button>
            </Card.Body>
          </Card>
        );

      case "statistics":
        return (
          <Card>
            <Card.Body>
              <h4>Statistik Keuangan</h4>
              <p>Grafik dan analisis keuangan kas kampung.</p>
              {/* Nanti bisa tambah chart.js */}
            </Card.Body>
          </Card>
        );

      case "calendar":
        return (
          <Card>
            <Card.Body>
              <h4>Kalender Keuangan</h4>
              <p>Lihat transaksi berdasarkan tanggal.</p>
            </Card.Body>
          </Card>
        );

      case "import":
        return (
          <Card>
            <Card.Body>
              <h4>Import Data Excel</h4>
              <p>
                Upload file Excel untuk menambahkan banyak transaksi sekaligus.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
            </Card.Body>
          </Card>
        );

      case "users":
        return (
          <Card>
            <Card.Body>
              <h4>Kelola Pengguna</h4>
              <p>Tambah, edit, atau hapus pengguna aplikasi.</p>
              <Button variant="success">Tambah Pengguna Baru</Button>
            </Card.Body>
          </Card>
        );

      case "settings":
        return (
          <Card>
            <Card.Body>
              <h4>Pengaturan Aplikasi</h4>
              <p>Konfigurasi aplikasi kas kampung.</p>
            </Card.Body>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="d-flex">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      {/* Main Content */}
      <div
        style={{
          marginLeft: "280px",
          width: "calc(100% - 280px)",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "20px",
        }}
      >
        <Container fluid>
          {/* Header dengan breadcrumb */}
          <div className="mb-4">
            <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
              {activeMenu === "dashboard" && "Dashboard"}
              {activeMenu === "transactions" && "Transaksi"}
              {activeMenu === "reports" && "Laporan Bulanan"}
              {activeMenu === "statistics" && "Statistik"}
              {activeMenu === "calendar" && "Kalender Keuangan"}
              {activeMenu === "import" && "Import Excel"}
              {activeMenu === "users" && "Kelola Pengguna"}
              {activeMenu === "settings" && "Pengaturan"}
            </h3>
            <p className="text-muted">
              Selamat datang, {user?.name} (
              {user?.role === "admin" ? "Administrator" : "Warga"})
            </p>
          </div>

          {renderContent()}
        </Container>
      </div>

      {/* Modal Form (sama seperti sebelumnya) */}
      <Modal show={showModal} onHide={handleCloseModal}>
        {/* ... modal content sama seperti sebelumnya ... */}
        <Modal.Header closeButton>
          <Modal.Title>
            {currentTransaction ? "Edit Transaksi" : "Tambah Transaksi"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

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

            <Form.Group className="mb-3">
              <Form.Label>Deskripsi</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Masukkan deskripsi"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Jumlah (Rp)</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="Masukkan jumlah"
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tipe</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="income">Pemasukan</option>
                <option value="expense">Pengeluaran</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
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
