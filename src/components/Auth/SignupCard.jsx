import React, { useState } from 'react';
import DatePicker from '../DatePicker';

const SignupCard = ({ onClose, onSwitchToLogin, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    date: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const namePattern = /^[A-Za-z0-9 ]+$/;
    // Basic semantic HTML5 validation already runs because of required/type attributes.
    // Here we add extra business rules: name pattern, password length and matching passwords.
    if (!formData.fullName || !formData.email) return;
    if (!namePattern.test(formData.fullName.trim())) {
      alert('Full name can only contain letters, numbers and spaces.');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Password and Confirm Password must match.');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('You must agree to the Terms and Privacy Policy.');
      return;
    }
    onSubmit && onSubmit(formData);
  };

  const handleDateChange = (val) => setFormData((prev) => ({ ...prev, date: val }));

  return (
    <div style={{ position: 'relative', }}>
      <div className="signup-card" style={{
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#ffffff',
        borderRadius: 20,
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(10,0,0,0.6)',
        width: '100%',
        maxWidth: 560,
        maxHeight: '78vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid rgba(10, 54, 34, 0.35)',
        position: 'relative',
        zIndex: 1
      }}>
        <div aria-hidden style={{
          position: 'absolute',
          inset: '-30% -30% auto auto',
          width: 460,
          height: 460,
          background: 'radial-gradient(circle at center, rgba(10, 54, 34, 0.22), rgba(0,0,0,0))'
        }} />


        <div style={{ textAlign: 'center', marginBottom: '1.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '.5rem', position: 'relative', zIndex: 1 }}>
            <a href="#" onClick={e => { e.preventDefault(); window.location.href = '/'; }} style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: '3rem', fontWeight: 700, color: '#ffb347', fontFamily: '"Henny Penny", cursive' }}>
                orrin
              </span>
            </a>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required
              style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
              onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required
              style={{ width: '100%', padding: '.85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
              onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Create a strong password" required
        style={{ width: '100%', padding: '.85rem 2.75rem .85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
        onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(10, 54, 34, 0.35)', background: 'rgba(0, 0, 0, 0.5)', color: '#0A3622', cursor: 'pointer' }}
        onMouseEnter={(e)=>{ e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; }}
        onMouseLeave={(e)=>{ e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'; }}>
                {showPassword ? (
                  // When visible, show open eye to indicate next action can hide
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  // Default hidden state: show slashed eye
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.53-1.2 1.27-2.33 2.2-3.3" /><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.59" /><path d="M6.1 6.1L1 1m22 22l-5.1-5.1" /><path d="M22.94 11.06A10.94 10.94 0 0 0 12 4c-1.27 0-2.49.22-3.61.63" /></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required
        style={{ width: '100%', padding: '.85rem 2.75rem .85rem 1rem', borderRadius: 12, border: '1.5px solid rgba(10, 54, 34, 0.35)', fontSize: '1rem', transition: 'all 0.2s ease', background: '#000000', color: '#ffffff' }}
        onFocus={(e) => { e.target.style.borderColor = '#0A3622'; e.target.style.boxShadow = '0 0 0 3px rgba(10, 54, 34, 0.25)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(10, 54, 34, 0.35)'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(p => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(10, 54, 34, 0.35)', background: 'rgba(0, 0, 0, 0.5)', color: '#0A3622', cursor: 'pointer' }}
        onMouseEnter={(e)=>{ e.currentTarget.style.background = 'rgba(0,0,0,0.85)'; }}
        onMouseLeave={(e)=>{ e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'; }}>
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.53-1.2 1.27-2.33 2.2-3.3" /><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.59" /><path d="M6.1 6.1L1 1m22 22l-5.1-5.1" /><path d="M22.94 11.06A10.94 10.94 0 0 0 12 4c-1.27 0-2.49.22-3.61.63" /></svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '.95rem', fontWeight: 700, color: '#e5e7eb' }}>Date of Birth</label>
            <DatePicker
              name="date"
              value={formData.date}
              onChange={handleDateChange}
              placeholder="Date of Birth"
              inputClassName="w-full bg-black border border-[rgba(10,54,34,0.35)] rounded-xl px-4 py-3 text-white text-base placeholder:text-[#666] focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(10,54,34,0.25)] transition"
            />
          </div>

          <div style={{ marginBottom: '1.6rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} required
              style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#0A3622' }} />
            <label style={{ fontSize: '0.9rem', color: 'rgba(229, 231, 235, 0.85)', cursor: 'pointer', lineHeight: '1.4' }}>
              I agree to the{' '}
              <a href="#terms" style={{ color: '#ffb347', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.target.style.color = '#ffd089'; e.target.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.target.style.color = '#ffb347'; e.target.style.textDecoration = 'none'; }}>
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#privacy" style={{ color: '#ffb347', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.target.style.color = '#ffd089'; e.target.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.target.style.color = '#ffb347'; e.target.style.textDecoration = 'none'; }}>
                Privacy Policy
              </a>
            </label>
          </div>

          <button type="submit" style={{ width: '100%', padding: '0.9rem', borderRadius: 12, border: '1px solid rgba(10, 54, 34, 0.55)', background: '#0A3622', color: '#ffffff', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease', marginBottom: '1.4rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 24px rgba(10,54,34,0.35)' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 14px 30px rgba(10,54,34,0.55)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 24px rgba(10,54,34,0.35)'; }}>
            Create Account
          </button>
          <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'rgba(229, 231, 235, 0.85)' }}>
            Already have an account?{' '}
            <a href="#" style={{ color: '#ffb347', textDecoration: 'none', fontWeight: 600, transition: 'all 0.3s ease' }}
              onClick={(e)=>{ e.preventDefault(); onSwitchToLogin ? onSwitchToLogin() : (onClose && onClose()); }}
              onMouseEnter={(e) => { e.target.style.color = '#ffd089'; e.target.style.textDecoration = 'underline'; }}
              onMouseLeave={(e) => { e.target.style.color = '#ffb347'; e.target.style.textDecoration = 'none'; }}>
              Log In
            </a>
          </div>
        </form>
      </div>

      <style>{`
        .signup-card a {
          text-decoration: none;
        }
        .signup-card a span {
          transition: color 0.2s, transform 0.2s;
          text-decoration: none !important;
          text-decoration-skip-ink: none;
          text-underline-offset: 0.2em;
          border-bottom: none !important;
        }
        .signup-card a:hover span, .signup-card a:focus span {
          color: #ffd089;
          text-decoration: none !important;
          border-bottom: 4px solid #ffd089;
          outline: none;
          transform: scale(1.07);
        }
        @media (max-width: 480px) {
          .signup-card { padding: 1.25rem !important; }
        }
      `}</style>
    </div>
  );
};

export default SignupCard;
