import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContextt";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import { useRouter } from "next/router";
import {
  FileEarmarkPdf,
  FileEarmarkExcel,
  CalendarMonth,
  Download,
  Printer,
} from "react-bootstrap-icons";

function LaporanIndex() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState({
    periode: "bulanan", // "bulanan" atau "tahunan"
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    type: "semua", // semua, income, expense
  });
  const [summary, setSummary] = useState({
    totalPemasukan: 0,
    totalPengeluaran: 0,
    saldo: 0,
  });
  const [availableYears, setAvailableYears] = useState([]);
  const [downloadLoading, setDownloadLoading] = useState({
    pdf: false,
    excel: false,
  });

  useEffect(() => {
    fetchData();
    fetchAvailableYears();
  }, [filter.periode, filter.bulan, filter.tahun, filter.type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url;
      if (filter.periode === "tahunan") {
        // Untuk tahunan, ambil semua data dalam tahun tersebut
        url = `/transactions?year=${filter.tahun}`;
        if (filter.type !== "semua") {
          url += `&type=${filter.type}`;
        }
      } else {
        // Untuk bulanan
        url = `/transactions?month=${filter.bulan}&year=${filter.tahun}`;
        if (filter.type !== "semua") {
          url += `&type=${filter.type}`;
        }
      }

      const res = await axios.get(url);
      setTransactions(res.data);

      // Hitung summary
      const pemasukan = res.data
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const pengeluaran = res.data
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      setSummary({
        totalPemasukan: pemasukan,
        totalPengeluaran: pengeluaran,
        saldo: pemasukan - pengeluaran,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const res = await axios.get("/transactions/years");
      setAvailableYears(res.data);
    } catch (err) {
      console.error("Error fetching years:", err);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleDownloadPDF = async () => {
    setDownloadLoading({ ...downloadLoading, pdf: true });
    try {
      let url;
      if (filter.periode === "tahunan") {
        url = `/reports/yearly?year=${filter.tahun}`;
      } else {
        url = `/reports/monthly?month=${filter.bulan}&year=${filter.tahun}`;
      }

      const response = await axios.get(url, {
        responseType: "blob",
      });

      // Buat URL untuk file blob
      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;

      // Nama file
      if (filter.periode === "tahunan") {
        link.setAttribute("download", `Laporan-Tahunan-${filter.tahun}.pdf`);
      } else {
        const bulanNama = new Date(
          filter.tahun,
          filter.bulan - 1,
          1,
        ).toLocaleString("id-ID", {
          month: "long",
        });
        link.setAttribute(
          "download",
          `Laporan-${bulanNama}-${filter.tahun}.pdf`,
        );
      }

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error("Error download PDF:", err);
      alert("Gagal download PDF. Silakan coba lagi.");
    } finally {
      setDownloadLoading({ ...downloadLoading, pdf: false });
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadLoading({ ...downloadLoading, excel: true });
    try {
      let url;
      if (filter.periode === "tahunan") {
        url = `/reports/excel?year=${filter.tahun}&periode=tahunan`;
      } else {
        url = `/reports/excel?month=${filter.bulan}&year=${filter.tahun}&periode=bulanan`;
      }

      const response = await axios.get(url, {
        responseType: "blob",
      });

      const fileUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileUrl;

      if (filter.periode === "tahunan") {
        link.setAttribute("download", `Laporan-Tahunan-${filter.tahun}.csv`);
      } else {
        const bulanNama = new Date(
          filter.tahun,
          filter.bulan - 1,
          1,
        ).toLocaleString("id-ID", {
          month: "long",
        });
        link.setAttribute(
          "download",
          `Laporan-${bulanNama}-${filter.tahun}.csv`,
        );
      }

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error("Error download Excel:", err);
      alert("Gagal download Excel. Silakan coba lagi.");
    } finally {
      setDownloadLoading({ ...downloadLoading, excel: false });
    }
  };

  const handlePrint = () => {
    window.print();
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

  // Group transaksi per bulan untuk tampilan tahunan
  const groupByMonth = () => {
    const grouped = {};
    transactions.forEach((t) => {
      const bulan = new Date(t.date).getMonth() + 1;
      if (!grouped[bulan]) {
        grouped[bulan] = {
          pemasukan: 0,
          pengeluaran: 0,
          transactions: [],
        };
      }
      if (t.type === "income") {
        grouped[bulan].pemasukan += t.amount;
      } else {
        grouped[bulan].pengeluaran += t.amount;
      }
      grouped[bulan].transactions.push(t);
    });
    return grouped;
  };

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div className="d-flex">
      <Sidebar activeMenu="reports" />

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
            <h3 style={{ color: "#2e7d32", fontWeight: "bold" }}>
              📄 Laporan Keuangan
            </h3>
            <p className="text-muted">
              Download laporan pemasukan dan pengeluaran kas kampung
            </p>
          </div>

          {/* Filter Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Periode</Form.Label>
                    <Form.Select
                      name="periode"
                      value={filter.periode}
                      onChange={handleFilterChange}
                    >
                      <option value="bulanan">Bulanan</option>
                      <option value="tahunan">Tahunan</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {filter.periode === "bulanan" && (
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bulan</Form.Label>
                      <Form.Select
                        name="bulan"
                        value={filter.bulan}
                        onChange={handleFilterChange}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <option key={m} value={m}>
                              {namaBulan[m - 1]}
                            </option>
                          ),
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}

                <Col md={2}>
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

                <Col md={2}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tipe</Form.Label>
                    <Form.Select
                      name="type"
                      value={filter.type}
                      onChange={handleFilterChange}
                    >
                      <option value="semua">Semua</option>
                      <option value="income">Pemasukan</option>
                      <option value="expense">Pengeluaran</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12} md={4} className="d-flex align-items-md-end">
                  <div className="d-flex flex-column flex-md-row gap-2 mb-3 w-100">
                    <Button
                      variant="success"
                      onClick={handleDownloadPDF}
                      disabled={downloadLoading.pdf}
                      className="w-100 w-md-auto"
                    >
                      {downloadLoading.pdf ? (
                        "Loading..."
                      ) : (
                        <>
                          <FileEarmarkPdf className="me-2" /> PDF
                        </>
                      )}
                    </Button>

                    <Button
                      variant="warning"
                      onClick={handleDownloadExcel}
                      disabled={downloadLoading.excel}
                      className="w-100 w-md-auto"
                    >
                      {downloadLoading.excel ? (
                        "Loading..."
                      ) : (
                        <>
                          <FileEarmarkExcel className="me-2" /> Excel
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handlePrint}
                      className="w-100 w-md-auto"
                    >
                      <Printer className="me-2" /> Print
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm bg-success text-white">
                <Card.Body>
                  <h6>Total Pemasukan</h6>
                  <h3>{formatRupiah(summary.totalPemasukan)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm bg-danger text-white">
                <Card.Body>
                  <h6>Total Pengeluaran</h6>
                  <h3>{formatRupiah(summary.totalPengeluaran)}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm bg-primary text-white">
                <Card.Body>
                  <h6>Saldo Akhir</h6>
                  <h3>{formatRupiah(summary.saldo)}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabel Transaksi */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3">
              <h5 className="mb-0">
                Detail Transaksi -{" "}
                {filter.periode === "tahunan"
                  ? `Tahun ${filter.tahun}`
                  : `${namaBulan[filter.bulan - 1]} ${filter.tahun}`}
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : transactions.length === 0 ? (
                <Alert variant="info" className="text-center">
                  Tidak ada transaksi untuk periode ini
                </Alert>
              ) : (
                <div
                  className="table-responsive"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {filter.periode === "tahunan" ? (
                    // Tampilan tahunan - rekap per bulan
                    <>
                      <Table hover striped className="mb-4">
                        <thead className="sticky-top bg-white">
                          <tr>
                            <th>Bulan</th>
                            <th>Pemasukan</th>
                            <th>Pengeluaran</th>
                            <th>Saldo</th>
                            <th>Jumlah Transaksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (bulan) => {
                              const data = groupByMonth()[bulan] || {
                                pemasukan: 0,
                                pengeluaran: 0,
                                transactions: [],
                              };
                              const saldoBulan =
                                data.pemasukan - data.pengeluaran;
                              return (
                                <tr key={bulan}>
                                  <td>
                                    <strong>{namaBulan[bulan - 1]}</strong>
                                  </td>
                                  <td className="text-success">
                                    {formatRupiah(data.pemasukan)}
                                  </td>
                                  <td className="text-danger">
                                    {formatRupiah(data.pengeluaran)}
                                  </td>
                                  <td
                                    className={
                                      saldoBulan >= 0
                                        ? "text-primary"
                                        : "text-danger"
                                    }
                                  >
                                    {formatRupiah(saldoBulan)}
                                  </td>
                                  <td>{data.transactions.length} transaksi</td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                        <tfoot className="bg-light fw-bold">
                          <tr>
                            <td>TOTAL TAHUN {filter.tahun}</td>
                            <td className="text-success">
                              {formatRupiah(summary.totalPemasukan)}
                            </td>
                            <td className="text-danger">
                              {formatRupiah(summary.totalPengeluaran)}
                            </td>
                            <td className="text-primary">
                              {formatRupiah(summary.saldo)}
                            </td>
                            <td>{transactions.length} transaksi</td>
                          </tr>
                        </tfoot>
                      </Table>

                      {/* Detail transaksi per bulan (accordion) */}
                      <h6 className="mt-4 mb-3">Detail Transaksi per Bulan:</h6>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(
                        (bulan) => {
                          const data = groupByMonth()[bulan];
                          if (!data || data.transactions.length === 0)
                            return null;

                          return (
                            <Card key={bulan} className="mb-3 border">
                              <Card.Header
                                className="bg-light"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  const el = document.getElementById(
                                    `bulan-${bulan}`,
                                  );
                                  if (el)
                                    el.style.display =
                                      el.style.display === "none"
                                        ? "block"
                                        : "none";
                                }}
                              >
                                <strong>
                                  {namaBulan[bulan - 1]} {filter.tahun}
                                </strong>
                                <span className="ms-3 text-muted">
                                  ({data.transactions.length} transaksi,
                                  Pemasukan: {formatRupiah(data.pemasukan)},
                                  Pengeluaran: {formatRupiah(data.pengeluaran)})
                                </span>
                              </Card.Header>
                              <Card.Body
                                id={`bulan-${bulan}`}
                                style={{ display: "none" }}
                              >
                                <Table size="sm">
                                  <thead>
                                    <tr>
                                      <th>Tanggal</th>
                                      <th>Jenis Iuran</th>
                                      <th>Nama Warga</th>
                                      <th>Tipe</th>
                                      <th>Nominal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {data.transactions.map((t) => (
                                      <tr key={t.id}>
                                        <td>
                                          {new Date(t.date).toLocaleDateString(
                                            "id-ID",
                                          )}
                                        </td>
                                        <td>
                                          {getJenisIuranLabel(t.jenis_iuran)}
                                        </td>
                                        <td>{t.nama_warga}</td>
                                        <td>
                                          <Badge
                                            bg={
                                              t.type === "income"
                                                ? "success"
                                                : "danger"
                                            }
                                          >
                                            {t.type === "income"
                                              ? "Pemasukan"
                                              : "Pengeluaran"}
                                          </Badge>
                                        </td>
                                        <td
                                          className={
                                            t.type === "income"
                                              ? "text-success"
                                              : "text-danger"
                                          }
                                        >
                                          {formatRupiah(t.amount)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </Card.Body>
                            </Card>
                          );
                        },
                      )}
                    </>
                  ) : (
                    // Tampilan bulanan - detail per transaksi
                    <Table hover striped className="mb-0">
                      <thead className="sticky-top bg-white">
                        <tr>
                          <th>Tanggal</th>
                          <th>Jenis Iuran</th>
                          <th>Nama Warga</th>
                          <th>Tipe</th>
                          <th>Nominal</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.id}>
                            <td>
                              {new Date(t.date).toLocaleDateString("id-ID")}
                            </td>
                            <td>{getJenisIuranLabel(t.jenis_iuran)}</td>
                            <td>{t.nama_warga}</td>
                            <td>
                              <Badge
                                bg={t.type === "income" ? "success" : "danger"}
                              >
                                {t.type === "income"
                                  ? "Pemasukan"
                                  : "Pengeluaran"}
                              </Badge>
                            </td>
                            <td
                              className={
                                t.type === "income"
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {formatRupiah(t.amount)}
                            </td>
                            <td>{t.keterangan || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-light fw-bold">
                        <tr>
                          <td colSpan="4" className="text-end">
                            TOTAL:
                          </td>
                          <td colSpan="2">
                            Pemasukan: {formatRupiah(summary.totalPemasukan)} |
                            Pengeluaran:{" "}
                            {formatRupiah(summary.totalPengeluaran)} | Saldo:{" "}
                            {formatRupiah(summary.saldo)}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Info Export */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="border-0 shadow-sm bg-light">
                <Card.Body>
                  <h6>📌 Informasi Laporan:</h6>
                  <ul className="mb-0 small">
                    <li>
                      Pilih periode <strong>Bulanan</strong> untuk laporan per
                      bulan
                    </li>
                    <li>
                      Pilih periode <strong>Tahunan</strong> untuk laporan satu
                      tahun penuh
                    </li>
                    <li>
                      Laporan PDF akan didownload dengan format siap cetak
                    </li>
                    <li>
                      Laporan Excel (CSV) bisa dibuka dengan Microsoft Excel
                    </li>
                    <li>Data ditampilkan berdasarkan periode yang dipilih</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default function LaporanPage() {
  return (
    <ProtectedRoute>
      <LaporanIndex />
    </ProtectedRoute>
  );
}
