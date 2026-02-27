import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContextt";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Bootstrap JS untuk komponen interaktif
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
