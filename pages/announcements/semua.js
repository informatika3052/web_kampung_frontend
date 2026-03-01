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
import { useAuth } from "../../context/AuthContextt";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { useRouter } from "next/router";
import { Plus, Pencil, Trash2, Calendar, GeoAlt } from "react-bootstrap-icons"; // Ganti MapPin dengan GeoAlt

function SemuaPengumuman() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    category: "",
    search: "",
  });
  const [availableYears, setAvailableYears] = useState([]);

  // Fetch data pengumuman
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      let url = `http://localhost:5000/api/announcements?bulan=${filter.bulan}&tahun=${filter.tahun}`;
      if (filter.category) url += `&category=${filter.category}`;
      if (filter.search) url += `&search=${filter.search}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tahun yang tersedia
  const fetchAvailableYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/announcements/years",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAvailableYears(res.data);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchAvailableYears();
  }, [filter.bulan, filter.tahun, filter.category]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    fetchAnnouncements();
  };

  const resetFilter = () => {
    setFilter({
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      category: "",
      search: "",
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleTambah = () => {
    router.push("/announcements/buat");
  };

  const handleEdit = (id) => {
    router.push(`/announcements/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/announcements/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchAnnouncements();
      } catch (err) {
        alert("Gagal menghapus pengumuman");
      }
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
          {/* Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-center text-center text-md-start mb-4">
            <div>
              <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
                📢 Semua Pengumuman
              </h3>
              <p className="text-muted">
                Daftar semua pengumuman dan informasi
              </p>
            </div>
            {user?.role === "admin" && (
              <Button variant="success" onClick={handleTambah}>
                <Plus className="me-2" /> Buat Pengumuman
              </Button>
            )}
          </div>

          {/* Filter Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-3">Filter Pengumuman</h5>
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
                    <Form.Label>Kategori</Form.Label>
                    <Form.Select
                      name="category"
                      value={filter.category}
                      onChange={handleFilterChange}
                    >
                      <option value="">Semua Kategori</option>
                      <option value="umum">Umum</option>
                      <option value="keamanan">Keamanan</option>
                      <option value="kegiatan">Kegiatan</option>
                      <option value="iuran">Iuran</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cari</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        name="search"
                        value={filter.search}
                        onChange={handleFilterChange}
                        placeholder="Cari judul/deskripsi..."
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button
                        variant="success"
                        className="ms-2"
                        onClick={handleSearch}
                      >
                        Cari
                      </Button>
                    </div>
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
                      Total Pengumuman
                    </h5>
                    <h3 className="fw-bold">
                      {announcements.length} Pengumuman
                    </h3>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div>
                    <h5 className="fs-6 fs-md-5 text-white-50">Periode</h5>
                    <h3 className="fw-bold">
                      {new Date(2000, filter.bulan - 1, 1).toLocaleString(
                        "id-ID",
                        { month: "long" },
                      )}{" "}
                      {filter.tahun}
                    </h3>
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
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Lokasi</th>
                    <th>Deskripsi</th>
                    <th>Dibuat Oleh</th>
                    {user?.role === "admin" && <th>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={user?.role === "admin" ? 7 : 6}
                        className="text-center py-4"
                      >
                        <div
                          className="spinner-border text-success"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : announcements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={user?.role === "admin" ? 7 : 6}
                        className="text-center py-4"
                      >
                        Tidak ada data pengumuman
                      </td>
                    </tr>
                  ) : (
                    announcements.map((item) => {
                      const category = getCategoryBadge(item.category);
                      return (
                        <tr key={item.id}>
                          <td>{formatDate(item.date)}</td>
                          <td className="fw-bold">{item.title}</td>
                          <td>
                            <Badge bg={category.color}>{category.label}</Badge>
                          </td>
                          <td>
                            {item.location ? (
                              <span>
                                <GeoAlt size={14} className="me-1 text-muted" />{" "}
                                {/* Ganti MapPin dengan GeoAlt */}
                                {item.location}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {item.description && item.description.length > 50
                              ? item.description.substring(0, 50) + "..."
                              : item.description || "-"}
                          </td>
                          <td>{item.creator?.name || "Unknown"}</td>
                          {user?.role === "admin" ? (
                            <td>
                              <Button
                                variant="warning"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(item.id)}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
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
                      );
                    })
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

export default function SemuaPengumumanPage() {
  return (
    <ProtectedRoute>
      <SemuaPengumuman />
    </ProtectedRoute>
  );
}
