import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { signup } from '../services/api';
import '../App.css';

export default function Signup({ show, handleClose }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email address.');
      return;
    }

    setSubmitting(true);

    try {
      await signup(email, password, 'OWNER');
      toast.success('Registration successful! Restaurant initialized.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      handleClose();
      // Redirect to owner dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
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
            <h5 className="modal-title fw-bold">Create SaaS Owner Account</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClose}></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              <div>
                <label htmlFor="signupEmail" className="form-label text-secondary small">Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  id="signupEmail" 
                  placeholder="name@example.com" 
                  required
                />
              </div>
              <div>
                <label htmlFor="signupPassword" className="form-label text-secondary small">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  id="signupPassword" 
                  placeholder="Minimum 6 characters" 
                  required
                />
              </div>
              <div>
                <label htmlFor="signupConfirmPassword" className="form-label text-secondary small">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="form-control glass-panel bg-transparent border-secondary text-white" 
                  id="signupConfirmPassword" 
                  placeholder="Re-enter password" 
                  required
                />
              </div>
              {error && <div className="alert alert-danger py-2 small bg-danger-subtle border-danger text-danger m-0">{error}</div>}
              
              <button type="submit" disabled={submitting} className="btn btn-glass-primary mt-2">
                {submitting ? 'Registering...' : 'Register & Setup Store'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

Signup.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};