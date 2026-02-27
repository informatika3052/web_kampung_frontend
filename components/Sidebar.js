import { useAuth } from "../context/AuthContextt";
import { useRouter } from "next/router";
import { Nav } from "react-bootstrap";
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
} from "react-bootstrap-icons";

export default function Sidebar({ activeMenu, setActiveMenu }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: HouseDoor,
      roles: ["admin", "warga"],
    },
    {
      key: "transactions",
      label: "Transaksi",
      icon: Cash,
      roles: ["admin", "warga"],
    },
    {
      key: "reports",
      label: "Laporan Bulanan",
      icon: FileEarmarkPdf,
      roles: ["admin", "warga"],
    },
    {
      key: "statistics",
      label: "Statistik",
      icon: GraphUp,
      roles: ["admin", "warga"],
    },
    {
      key: "calendar",
      label: "Kalender Keuangan",
      icon: CalendarMonth,
      roles: ["admin", "warga"],
    },
    { key: "import", label: "Import Excel", icon: Upload, roles: ["admin"] },
    { key: "users", label: "Kelola Pengguna", icon: People, roles: ["admin"] },
    { key: "settings", label: "Pengaturan", icon: Gear, roles: ["admin"] },
  ];

  // Filter menu berdasarkan role user
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  const handleMenuClick = (key) => {
    setActiveMenu(key);
    router.push(`/dashboard?menu=${key}`);
  };

  const handleLogout = () => {
    logout();
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
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <h5 style={{ color: "white", marginBottom: "5px" }}>{user?.name}</h5>
        <p style={{ color: "#a5d6a7", fontSize: "13px", marginBottom: 0 }}>
          {user?.email}
        </p>
      </div>

      {/* Menu Items */}
      <Nav className="flex-column p-3" style={{ flex: 1 }}>
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <Nav.Link
              key={item.key}
              onClick={() => handleMenuClick(item.key)}
              className="d-flex align-items-center px-3 py-3 mb-2"
              style={{
                borderRadius: "10px",
                backgroundColor:
                  activeMenu === item.key ? "#a5d6a7" : "transparent",
                color: activeMenu === item.key ? "#1b5e20" : "white",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (activeMenu !== item.key) {
                  e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== item.key) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <Icon size={20} className="me-3" />
              <span style={{ fontSize: "16px" }}>{item.label}</span>
            </Nav.Link>
          );
        })}
      </Nav>

      {/* Logout Button */}
      <div
        className="p-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}
      >
        <Nav.Link
          onClick={handleLogout}
          className="d-flex align-items-center px-3 py-3"
          style={{
            borderRadius: "10px",
            color: "white",
            transition: "all 0.3s",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
        >
          <BoxArrowRight size={20} className="me-3" />
          <span style={{ fontSize: "16px" }}>Logout</span>
        </Nav.Link>
      </div>

      {/* Style tambahan untuk scroll menu */}
      <style jsx>{`
        .sidebar {
          overflow-y: auto;
        }
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
