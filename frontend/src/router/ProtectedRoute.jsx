import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import PaperPlane from '../components/PaperPlanej.jsx';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PaperPlane className="w-16 h-16" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
