import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../../context/AuthContextt";
import ProtectedRoute from "../../../components/ProtectedRoute";
import Sidebar from "../../../components/Sidebar";
import { useRouter } from "next/router";
import { Download, Plus, Pencil, Trash2 } from "react-bootstrap-icons";

function PemasukanIndex() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    warga: "",
    jenis: "",
  });
  const [totalPemasukan, setTotalPemasukan] = useState(0);
  const [wargaList, setWargaList] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch data pemasukan
  const fetchPemasukan = async () => {
    setLoading(true);
    try {
      let url = `/transactions/pemasukan?bulan=${filter.bulan}&tahun=${filter.tahun}`;
      if (filter.warga) url += `&warga=${filter.warga}`;
      if (filter.jenis) url += `&jenis=${filter.jenis}`;

      const res = await axios.get(url);
      setTransactions(res.data);

      // Hitung total pemasukan
      const total = res.data.reduce((sum, t) => sum + t.amount, 0);
      setTotalPemasukan(total);
    } catch (err) {
      console.error("Error fetching pemasukan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch total pemasukan
  const fetchTotal = async () => {
    try {
      const res = await axios.get(
        `/transactions/pemasukan/total?bulan=${filter.bulan}&tahun=${filter.tahun}`,
      );
      setTotalPemasukan(res.data.total);
    } catch (err) {
      console.error("Error fetching total:", err);
    }
  };

  // Fetch daftar warga
  const fetchWargaList = async () => {
    try {
      const res = await axios.get("/transactions/warga-list");
      setWargaList(res.data);
    } catch (err) {
      console.error("Error fetching warga list:", err);
    }
  };

  // Fetch tahun yang tersedia
  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get("/transactions/years");
      setAvailableYears(res.data);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  useEffect(() => {
    fetchPemasukan();
    fetchTotal();
    fetchWargaList();
    fetchAvailableYears();
  }, [filter.bulan, filter.tahun, filter.warga, filter.jenis]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const resetFilter = () => {
    setFilter({
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      warga: "",
      jenis: "",
    });
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const getJenisIuranLabel = (jenis) => {
    const labels = {
      kas_bulanan: "Kas Bulanan",
      kas_kematian: "Kas Kematian",
      kas_sosial: "Kas Sosial",
      dana_bangunan: "Dana Bangunan",
      lainnya: "Lainnya",
    };
    return labels[jenis] || jenis;
  };

  const handleTambah = () => {
    router.push("/kas/pemasukan/tambah");
  };

  const handleEdit = (id) => {
    router.push(`/kas/pemasukan/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await axios.delete(`/transactions/${id}`);
        fetchPemasukan();
        fetchTotal();
      } catch (err) {
        alert("Gagal menghapus data");
      }
    }
  };

  return (
    <div className="d-flex">
      <Sidebar activeMenu="pemasukan" />

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
            <div>
              <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
                💰 Pemasukan Kas
              </h3>
              <p className="text-muted">Kelola data pemasukan kas kampung</p>
            </div>
            {user?.role === "admin" && (
              <Button variant="success" onClick={handleTambah}>
                <Plus className="me-2" /> Tambah Pemasukan
              </Button>
            )}
          </div>

          {/* Filter Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Filter Pemasukan</h5>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bulan</Form.Label>
                    <Form.Select
                      name="bulan"
                      value={filter.bulan}
                      onChange={handleFilterChange}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {new Date(2000, m - 1, 1).toLocaleString("id-ID", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tahun</Form.Label>
                    <Form.Select
                      name="tahun"
                      value={filter.tahun}
                      onChange={handleFilterChange}
                    >
                      {availableYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nama Warga</Form.Label>
                    <Form.Select
                      name="warga"
                      value={filter.warga}
                      onChange={handleFilterChange}
                    >
                      <option value="">Semua Warga</option>
                      {wargaList.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Jenis Iuran</Form.Label>
                    <Form.Select
                      name="jenis"
                      value={filter.jenis}
                      onChange={handleFilterChange}
                    >
                      <option value="">Semua Jenis</option>
                      <option value="kas_bulanan">Kas Bulanan</option>
                      <option value="kas_kematian">Kas Kematian</option>
                      <option value="kas_sosial">Kas Sosial</option>
                      <option value="dana_bangunan">Dana Bangunan</option>
                      <option value="lainnya">Lainnya</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={12}>
                  <Button variant="link" onClick={resetFilter}>
                    Reset Filter
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Summary Card */}
          <Card className="border-0 shadow-sm mb-4 bg-success text-white">
            <Card.Body>
              <Row className="text-center text-md-start">
                <Col xs={12} md={6} className="mb-4 mb-md-0">
                  <div>
                    <h5 className="fs-6 fs-md-6 text-white-50">
                      Total Pemasukan
                    </h5>
                    <h3 className="fw-bold">{formatRupiah(totalPemasukan)}</h3>
                  </div>
                </Col>

                <Col xs={12} md={6}>
                  <div>
                    <h5 className="fs-6 fs-md-5 text-white-50">
                      Jumlah Transaksi
                    </h5>
                    <h3 className="fw-bold">{transactions.length} Transaksi</h3>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Jenis Iuran</th>
                    <th>Nama Warga</th>
                    <th>Nominal</th>
                    <th>Keterangan</th>
                    {user?.role === "admin" && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <div
                          className="spinner-border text-success"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Tidak ada data pemasukan
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{new Date(t.date).toLocaleDateString("id-ID")}</td>
                        <td>{getJenisIuranLabel(t.jenis_iuran)}</td>
                        <td>{t.nama_warga}</td>
                        <td className="text-success fw-bold">
                          {formatRupiah(t.amount)}
                        </td>
                        <td>{t.keterangan || "-"}</td>
                        {user?.role === "admin" ? (
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(t.id)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        ) : (
                          <td>
                            <Badge bg="secondary">View Only</Badge>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}

export default function PemasukanPage() {
  return (
    <ProtectedRoute>
      <PemasukanIndex />
    </ProtectedRoute>
  );
}
