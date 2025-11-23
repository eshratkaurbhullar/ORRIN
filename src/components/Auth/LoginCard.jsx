import React, { useState } from 'react';

// Accept apiError and isSubmitting as props
const LoginCard = ({ onClose, onSwitchToSignup, onSubmit, apiError, isSubmitting }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' })); // Clear validation error on change
    // Note: We don't clear apiError here, as it comes from the parent
  };

  const validate = () => {
    const newErrors = {};
    // username optional, but if provided trim it
    if (formData.username && !formData.username.trim()) newErrors.username = 'Enter a valid username';
    if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return; // Prevent submit if already submitting or invalid
    onSubmit && onSubmit(formData);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%'}}>
      <div className="signup-card" style={{
        background: 'linear-gradient(160deg, #0a0a0a 0%, #000000 100%)',
        color: '#ffffff', padding: '6rem 9rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        width: '100%', maxHeight: 'unset', overflowX: 'hidden', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        border: '1px solid rgba(10, 54, 34, 0.35)', position: 'relative',
      }}>


        <div style={{ textAlign: 'center', marginBottom: '1.6rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '.5rem' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
              style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '3rem', fontWeight: 700, color: '#ffb347' , fontFamily: '"Henny Penny", cursive'}}>orrin</span>
            </a>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Log In</h1>
        </div>

        {/* Display API Error Message */}
        {apiError && (
          <div style={{
            padding: '0.8rem 1rem',
            margin: '1rem 0 0.5rem 0',
            color: '#f87171', // Tailwind red-400
            backgroundColor: 'rgba(153, 27, 27, 0.2)', // Tailwind red-800/20
            border: '1px solid rgba(239, 68, 68, 0.3)', // Tailwind red-500/30
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          {/* Username Input */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Username (optional)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Your display name"
              style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
              onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
            {errors.username && <span style={{ color: '#ef4444', fontSize: '.85rem' }}>{errors.username}</span>}
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required
              style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
              onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '.85rem' }}>{errors.email}</span>}
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Your password" required
                style={{ width: '100%', padding: '.85rem 2.75rem .85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
                onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(10, 54, 34, 0.35)', background: 'rgba(0, 0, 0, 0.5)', color: '#0A3622', cursor: 'pointer' }}
                onMouseEnter={(e)=>{ e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; }}
                onMouseLeave={(e)=>{ e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'; }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.53-1.2 1.27-2.33 2.2-3.3" /><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.59" /><path d="M6.1 6.1L1 1m22 22l-5.1-5.1" /><path d="M22.94 11.06A10.94 10.94 0 0 0 12 4c-1.27 0-2.49.22-3.61.63" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span style={{ color: '#ef4444', fontSize: '.85rem' }}>{errors.password}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting} // Disable button when submitting
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: 12,
              border: '1px solid rgba(10, 54, 34, 0.55)',
              background: '#0A3622',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer', // Change cursor
              transition: 'all 0.25s ease',
              marginBottom: '1.4rem',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 24px rgba(10,54,34,0.35)',
              opacity: isSubmitting ? 0.7 : 1, // Visual cue for disabled state
            }}
            onMouseEnter={(e) => { if (!isSubmitting) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 14px 30px rgba(10,54,34,0.55)'; } }}
            onMouseLeave={(e) => { if (!isSubmitting) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 24px rgba(10,54,34,0.35)'; } }}>
            {/* Change text when submitting */}
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>

          {/* Switch to Signup */}
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(229, 231, 235, 0.85)' }}>
            Don&apos;t have an account?{' '}
            <a href="#" style={{ color: '#ffb347', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease' }}
              onClick={(e)=>{ e.preventDefault(); onSwitchToSignup && onSwitchToSignup(); }}
              onMouseEnter={(e) => { e.target.style.color = '#ffd089'; e.target.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.target.style.color = '#ffb347'; e.target.style.textDecoration = 'none'; }}>
              Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginCard;