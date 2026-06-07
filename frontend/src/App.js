import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import AboutUs from './components/AboutUs';
import HomePage from './components/HomePage';
import OwnerDashboard from './components/OwnerDashboard';
import CustomerMenu from './components/CustomerMenu';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <Navbar title="InstantPlate" />
      <div className="mt-1">
        <Routes>
          {/* Main B2B SaaS routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/signup" element={<Signup handleClose={() => window.history.back()} />} />
          <Route path="/login" element={<Login handleClose={() => window.history.back()} />} />
          <Route path="/dashboard" element={<OwnerDashboard />} />

          {/* B2C Customer digital QR menu routes */}
          <Route path="/demo" element={<CustomerMenu />} />
          <Route path="/menu/:restaurantId" element={<CustomerMenu />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </Router>
  );
};

export default App;