import { useAuth } from "../context/AuthContextt";
import { useRouter } from "next/router";
import { Nav, Button } from "react-bootstrap";
import {
  HouseDoor,
  Cash,
  FileEarmarkPdf,
  Upload,
  People,
  Gear,
  GraphUp,
  CalendarMonth,
  BoxArrowRight,
  Wallet2,
  List,
  X,
  Megaphone,
} from "react-bootstrap-icons";
import { useState, useEffect } from "react";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: HouseDoor,
      roles: ["admin", "warga"],
      path: "/dashboard",
      tooltip: "Lihat ringkasan keuangan",
    },
    {
      key: "pemasukan",
      label: "Pemasukan",
      icon: Cash,
      roles: ["admin", "warga"],
      path: "/kas/pemasukan",
      tooltip: "Kelola data pemasukan",
    },
    {
      key: "pengeluaran",
      label: "Pengeluaran",
      icon: Wallet2,
      roles: ["admin", "warga"],
      path: "/kas/pengeluaran",
      tooltip: "Kelola data pengeluaran",
    },
    // ===== MENU ANNOUNCEMENTS (PENGUMUMAN) =====
    {
      key: "announcements",
      label: "Pengumuman",
      icon: Megaphone,
      roles: ["admin", "warga"],
      path: "/announcements",
      tooltip: "Lihat dan kelola pengumuman",
    },
    {
      key: "reports",
      label: "Laporan",
      icon: FileEarmarkPdf,
      roles: ["admin", "warga"],
      path: "/laporan",
      tooltip: "Download laporan PDF & Excel",
    },
    {
      key: "statistics",
      label: "Statistik",
      icon: GraphUp,
      roles: ["admin", "warga"],
      path: "/statistik",
      tooltip: "Lihat grafik dan analisis",
    },
    {
      key: "calendar",
      label: "Kalender",
      icon: CalendarMonth,
      roles: ["admin", "warga"],
      path: "/kalender",
      tooltip: "Lihat transaksi per tanggal",
    },
    {
      key: "import",
      label: "Import Excel",
      icon: Upload,
      roles: ["admin"],
      path: "/import",
      tooltip: "Import data dari file Excel",
    },
    {
      key: "users",
      label: "Kelola Pengguna",
      icon: People,
      roles: ["admin"],
      path: "/users",
      tooltip: "Tambah/edit pengguna",
    },
    {
      key: "settings",
      label: "Pengaturan",
      icon: Gear,
      roles: ["admin"],
      path: "/settings",
      tooltip: "Konfigurasi aplikasi",
    },
  ];

  // Filter menu berdasarkan role user
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleMenuClick = (item) => {
    if (setActiveMenu) {
      setActiveMenu(item.key);
    }
    router.push(item.path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      logout();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Overlay untuk mobile
  const overlayStyle =
    isMobile && sidebarOpen
      ? {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 999,
        }
      : {};

  return (
    <>
      {/* Overlay untuk mobile */}
      {isMobile && sidebarOpen && (
        <div style={overlayStyle} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Hamburger Button untuk Mobile */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="success"
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            zIndex: 1001,
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
          title="Buka menu"
        >
          <List size={24} />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className="sidebar d-flex flex-column"
        style={{
          width: isMobile ? (sidebarOpen ? "280px" : "0px") : "280px",
          background: "linear-gradient(180deg, #1b5e20 0%, #2e7d32 100%)",
          color: "white",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
          transition: "width 0.3s ease",
          overflow: "hidden",
          visibility: isMobile
            ? sidebarOpen
              ? "visible"
              : "hidden"
            : "visible",
        }}
      >
        {/* Close Button untuk Mobile */}
        {isMobile && sidebarOpen && (
          <Button
            variant="link"
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              color: "white",
              zIndex: 1002,
            }}
            title="Tutup menu"
          >
            <X size={24} />
          </Button>
        )}

        {/* Konten Sidebar - hanya tampil jika sidebar terbuka */}
        {(sidebarOpen || !isMobile) && (
          <>
            {/* Logo dan Title */}
            <div
              className="p-4 text-center"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
              title="Halaman utama"
            >
              <h3
                style={{
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                🌳 Kas Kampung
              </h3>
              <p
                style={{ color: "#a5d6a7", fontSize: "14px", marginBottom: 0 }}
              >
                {user?.role === "admin" ? "Administrator" : "Warga"}
              </p>
            </div>

            {/* Menu Items - Tambahkan atribut title */}
            <div className="flex-grow-1 overflow-auto py-3 px-3">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.key;

                return (
                  <div
                    key={item.key}
                    onClick={() => handleMenuClick(item)}
                    className="d-flex align-items-center px-3 py-3 mb-2"
                    style={{
                      borderRadius: "10px",
                      backgroundColor: isActive ? "#a5d6a7" : "transparent",
                      color: isActive ? "#1b5e20" : "white",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      borderLeft: isActive
                        ? "4px solid #1b5e20"
                        : "4px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor =
                          "rgba(255,255,255,0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                    title={item.tooltip}
                  >
                    <Icon size={20} className="me-3 flex-shrink-0" />
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: isActive ? "bold" : "normal",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Logout Button - Tambahkan tooltip */}
            <div
              className="p-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div
                onClick={handleLogout}
                className="d-flex align-items-center px-3 py-3"
                style={{
                  borderRadius: "10px",
                  color: "white",
                  transition: "all 0.3s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
                title="Keluar dari aplikasi"
              >
                <BoxArrowRight size={20} className="me-3 flex-shrink-0" />
                <span style={{ fontSize: "16px" }}>Logout</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Style untuk mengatur margin konten utama */}
      <style jsx global>{`
        /* Untuk desktop, konten utama bergeser 280px */
        @media (min-width: 769px) {
          body {
            margin-left: 280px;
            width: calc(100% - 280px);
            transition: margin-left 0.3s ease;
          }
        }

        /* Untuk mobile, konten utama full width */
        @media (max-width: 768px) {
          body {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
