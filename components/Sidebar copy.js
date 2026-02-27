import { useAuth } from "../context/AuthContextt";
import { useRouter } from "next/router";
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
} from "react-bootstrap-icons";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Definisikan semua menu dengan roles yang boleh mengakses
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: HouseDoor,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/dashboard",
    },
    {
      key: "pemasukan",
      label: "Pemasukan",
      icon: Cash,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/kas/pemasukan",
    },
    {
      key: "pengeluaran",
      label: "Pengeluaran",
      icon: Wallet2,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/kas/pengeluaran",
    },
    {
      key: "reports",
      label: "Laporan",
      icon: FileEarmarkPdf,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/laporan",
    },
    {
      key: "statistics",
      label: "Statistik",
      icon: GraphUp,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/statistik",
    },
    {
      key: "calendar",
      label: "Kalender",
      icon: CalendarMonth,
      roles: ["admin", "warga"], // Semua role bisa
      path: "/kalender",
    },
    {
      key: "import",
      label: "Import Excel",
      icon: Upload,
      roles: ["admin"], // ONLY ADMIN
      path: "/import",
    },
    {
      key: "users",
      label: "Kelola Pengguna",
      icon: People,
      roles: ["admin"], // ONLY ADMIN
      path: "/users",
    },
    {
      key: "settings",
      label: "Pengaturan",
      icon: Gear,
      roles: ["admin"], // ONLY ADMIN
      path: "/settings",
    },
  ];

  // Filter menu berdasarkan role user
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleMenuClick = (item, e) => {
    e.preventDefault(); // Mencegah perilaku default link
    if (setActiveMenu) {
      setActiveMenu(item.key);
    }
    router.push(item.path);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      logout();
    }
  };

  return (
    <div
      className="sidebar d-flex flex-column"
      style={{
        width: "280px",
        background: "linear-gradient(180deg, #1b5e20 0%, #2e7d32 100%)",
        color: "white",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      {/* Logo dan Title */}
      <div
        className="p-4 text-center"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
      >
        <h3 style={{ color: "white", fontWeight: "bold", marginBottom: "5px" }}>
          🌳 Kas Kampung
        </h3>
        <p style={{ color: "#a5d6a7", fontSize: "14px", marginBottom: 0 }}>
          {user?.role === "admin" ? "Administrator" : "Warga"}
        </p>
      </div>

      {/* User Info */}
      {user && (
        <div
          className="p-4 text-center"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#a5d6a7",
              margin: "0 auto 15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "#1b5e20",
              fontWeight: "bold",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h5
            style={{
              color: "white",
              marginBottom: "5px",
              wordBreak: "break-word",
            }}
          >
            {user.name}
          </h5>
          <p
            style={{
              color: "#a5d6a7",
              fontSize: "13px",
              marginBottom: 0,
              wordBreak: "break-word",
            }}
          >
            {user.email}
          </p>
        </div>
      )}

      {/* Menu Items - Gunakan div biasa, bukan Nav.Link */}
      <div className="flex-grow-1 overflow-auto py-3 px-3">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;

          return (
            <div
              key={item.key}
              onClick={(e) => handleMenuClick(item, e)}
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
              title={`Klik untuk membuka ${item.label} - ${item.path}`} // Tooltip kustom
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

      {/* Logout Button */}
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
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          title="Klik untuk logout"
        >
          <BoxArrowRight size={20} className="me-3 flex-shrink-0" />
          <span style={{ fontSize: "16px" }}>Logout</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          overflow-y: hidden;
          display: flex;
          flex-direction: column;
        }
        .sidebar:hover {
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
