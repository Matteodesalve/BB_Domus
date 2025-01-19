import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../utils/Auth"; // Corretto percorso relativo al frontend

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
