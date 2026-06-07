import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/api';
import '../App.css';

export default function Login({ show, handleClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      toast.success(res.message || 'Logged in successfully!');
      setEmail('');
      setPassword('');
      handleClose();
      // Redirect to owner dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`modal ${show ? 'd-block' : 'd-none'}`} tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">  
        <div className="modal-content modal-content-glass">
          <div className="modal-header modal-header-glass">
            <h5 className="modal-title fw-bold">Sign In to InstantPlate</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClose}></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="loginEmail" className="form-label text-secondary small">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  id="loginEmail" 
                  placeholder="name@example.com" 
                  required
                />
              </div>
              <div>
                <label htmlFor="loginPassword" className="form-label text-secondary small">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  id="loginPassword" 
                  placeholder="••••••••" 
                  required
                />
              </div>
              {error && <div className="alert alert-danger py-2 small bg-danger-subtle border-danger text-danger m-0">{error}</div>}
              
              <button type="submit" disabled={submitting} className="btn btn-glass-primary mt-2">
                {submitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

Login.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
