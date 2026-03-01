import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContextt";
import api from "../../services/api";
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  MapPin,
  Tag,
  FileText,
} from "react-bootstrap-icons";
import { Button, Form, Modal, Alert, Spinner } from "react-bootstrap";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    attachment: "",
    category: "umum",
  });

  const categories = [
    { value: "umum", label: "Umum", color: "secondary" },
    { value: "keamanan", label: "Keamanan", color: "danger" },
    { value: "kegiatan", label: "Kegiatan", color: "success" },
    { value: "iuran", label: "Iuran", color: "primary" },
  ];

  useEffect(() => {
    fetchAnnouncements();
  }, [filters]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.month && filters.year) {
        params.month = filters.month;
        params.year = filters.year;
      }
      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/announcements", { params });
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedAnnouncement(null);
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      attachment: "",
      category: "umum",
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setSelectedAnnouncement(item);
    setFormData({
      title: item.title,
      description: item.description || "",
      date: item.date.split("T")[0],
      location: item.location || "",
      attachment: item.attachment || "",
      category: item.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) {
      try {
        await api.delete(`/announcements/${id}`);
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        alert("Gagal menghapus pengumuman");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAnnouncement) {
        await api.put(`/announcements/${selectedAnnouncement.id}`, formData);
      } else {
        await api.post("/announcements", formData);
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Gagal menyimpan pengumuman");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCategoryColor = (category) => {
    const cat = categories.find((c) => c.value === category);
    return cat ? cat.color : "secondary";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success bg-opacity-10 p-3 rounded-circle">
            <Megaphone size={32} className="text-success" />
          </div>
          <div>
            <h1 className="h3 mb-1">Pengumuman</h1>
            <p className="text-muted mb-0">Informasi dan kegiatan warga</p>
          </div>
        </div>
        {user?.role === "admin" && (
          <Button variant="success" onClick={handleAdd}>
            <Plus className="me-2" />
            Buat Pengumuman
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label>Cari</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    placeholder="Cari judul/deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && fetchAnnouncements()
                    }
                  />
                  <Search
                    className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                    size={18}
                  />
                </div>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Kategori</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Bulan</Form.Label>
                <Form.Select
                  value={filters.month}
                  onChange={(e) =>
                    setFilters({ ...filters, month: parseInt(e.target.value) })
                  }
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString("id-ID", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-2">
              <Form.Group>
                <Form.Label>Tahun</Form.Label>
                <Form.Control
                  type="number"
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: parseInt(e.target.value) })
                  }
                  min="2020"
                  max="2030"
                />
              </Form.Group>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Memuat pengumuman...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-5">
          <Megaphone size={48} className="text-muted mb-3" />
          <h4>Tidak ada pengumuman</h4>
          <p className="text-muted">Belum ada pengumuman yang dibuat</p>
          {user?.role === "admin" && (
            <Button variant="success" onClick={handleAdd}>
              <Plus className="me-2" />
              Buat Pengumuman Sekarang
            </Button>
          )}
        </div>
      ) : (
        <div className="row">
          {announcements.map((item) => (
            <div key={item.id} className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span
                        className={`badge bg-${getCategoryColor(item.category)} bg-opacity-10 text-${getCategoryColor(item.category)} px-3 py-2 rounded-pill mb-2`}
                      >
                        <Tag size={14} className="me-1" />
                        {categories.find((c) => c.value === item.category)
                          ?.label || item.category}
                      </span>
                    </div>
                    {user?.role === "admin" && (
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-warning me-2"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>

                  <h5 className="card-title mb-3">{item.title}</h5>
                  {item.description && (
                    <p className="card-text text-muted mb-3">
                      {item.description}
                    </p>
                  )}

                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <div className="d-flex align-items-center text-muted small">
                      <Calendar className="me-2" size={16} />
                      {formatDate(item.date)}
                    </div>
                    {item.location && (
                      <div className="d-flex align-items-center text-muted small">
                        <MapPin className="me-2" size={16} />
                        {item.location}
                      </div>
                    )}
                  </div>

                  {item.attachment && (
                    <div className="mt-3">
                      <a
                        href={item.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none"
                      >
                        <FileText size={16} className="me-1" />
                        Lihat Lampiran
                      </a>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-top small text-muted">
                    Dibuat oleh: {item.creator?.name || "Unknown"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAnnouncement ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                Judul <span className="text-danger">*</span>
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button variant="success" type="submit">
              {selectedAnnouncement ? "Update" : "Simpan"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
