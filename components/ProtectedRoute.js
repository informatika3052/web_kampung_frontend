import { useAuth } from "../context/AuthContextt";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner } from "react-bootstrap";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Jika belum login, redirect ke halaman utama
        router.push("/");
      } else if (adminOnly && user.role !== "admin") {
        // Jika adminOnly tapi user bukan admin, redirect ke dashboard biasa
        router.push("/dashboard");
      }
    }
  }, [user, loading, router, adminOnly]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    return null;
  }

  return children;
};

export default ProtectedRoute;
