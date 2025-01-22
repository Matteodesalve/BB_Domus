import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import HomePage from "./components/Homepage";
import LoginPage from "./components/LoginPage";
import SummarySection from "./components/SummarySection";
import ProtectedRoute from "./components/protectedRoutes";
import { isAuthenticated } from "./utils/Auth";

// Funzione per ottenere la pagina corrente in base all'autenticazione
const getCurrentPage = () => {
  return isAuthenticated() ? "/home" : "/login";
};

// Componente per gestire gli accessi manuali a percorsi errati
const RedirectToCorrectPage = () => {
  const location = useLocation();
  const correctPage = getCurrentPage();

  if (location.pathname !== correctPage) {
    return <Navigate to={correctPage} replace />;
  }
  return null; // Nessuna azione se siamo sulla pagina giusta
};

// Componente per impedire l'accesso alla pagina di login se autenticati
const RestrictedLoginRoute = () => {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <LoginPage />;
};

function App() {
  return (
    <Routes>
      {/* Route della login, reindirizza a home se autenticato */}
      <Route path="/login" element={<RestrictedLoginRoute />} />

      {/* Route della home, protetta */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/summary" 
        element={
          <ProtectedRoute>
              <SummarySection />
          </ProtectedRoute>
        } 
      />

      {/* Reindirizzamento a home o login per qualsiasi altro percorso */}
      <Route path="*" element={<RedirectToCorrectPage />} />
    </Routes>
  );
}

export default App;