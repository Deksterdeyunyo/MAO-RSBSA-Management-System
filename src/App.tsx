import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SeedsInventory from './pages/SeedsInventory';
import FertilizersInventory from './pages/FertilizersInventory';
import VetChemicalsInventory from './pages/VetChemicalsInventory';
import PesticidesInventory from './pages/PesticidesInventory';
import Recipients from './pages/Recipients';
import Distribution from './pages/Distribution';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        
        <Route path="/seeds" element={
          <DashboardLayout>
            <SeedsInventory />
          </DashboardLayout>
        } />
        
        <Route path="/fertilizers" element={
          <DashboardLayout>
            <FertilizersInventory />
          </DashboardLayout>
        } />
        
        <Route path="/vet-chemicals" element={
          <DashboardLayout>
            <VetChemicalsInventory />
          </DashboardLayout>
        } />
        
        <Route path="/pesticides" element={
          <DashboardLayout>
            <PesticidesInventory />
          </DashboardLayout>
        } />
        
        <Route path="/recipients" element={
          <DashboardLayout>
            <Recipients />
          </DashboardLayout>
        } />
        
        <Route path="/distribution" element={
          <DashboardLayout>
            <Distribution />
          </DashboardLayout>
        } />
        
        <Route path="/reports" element={
          <DashboardLayout>
            <Reports />
          </DashboardLayout>
        } />
        
        <Route path="/users" element={
          <DashboardLayout>
            <UserManagement />
          </DashboardLayout>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
