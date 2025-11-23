import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import apiClient from '../api/axiosConfig';
import { Shield, Globe2, Trash2 } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('app:userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    const confirmed = window.confirm('Delete your account and all your data from Orrin? This cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/users/${user.id}`);
      localStorage.removeItem('app:isLoggedIn');
      localStorage.removeItem('app:userData');
      navigate('/signup', { replace: true });
    } catch (e) {
      console.error('Failed to delete account', e);
      alert('Could not delete account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar isLoggedIn={true} />
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          Loading settings...
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isLoggedIn={true} />
      <main className="min-h-screen bg-gradient-to-b from-black via-[#050711] to-black text-white px-5 pt-20 pb-16 flex flex-col">
        <section className="max-w-4xl w-full mx-auto">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-[#9a9fb5] mt-1">Tune how Orrin behaves for you.</p>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-[2fr,1.1fr]">
            {/* Left column */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#1b1f2b] bg-[#050608]/80 p-4 md:p-5">
                <h2 className="text-sm font-semibold mb-3 text-[#9a9fb5] uppercase tracking-wide">Account & security</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#050608] border border-[#1b1f2b]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0a0d14] border border-[#222] flex items-center justify-center text-[#76f5d2]">
                        <Shield size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Login & security</h4>
                        <p className="text-xs text-[#9a9fb5]">Your email and password are managed securely via the app.</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-full flex items-center justify-between gap-4 p-4 rounded-2xl bg-[#150909] border border-[#3b1111] text-left hover:bg-[#200b0b] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#290b0b] border border-[#4b1515] flex items-center justify-center text-red-400">
                        <Trash2 size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold">Delete account</h4>
                        <p className="text-xs text-[#fca5a5]">Permanently delete your Orrin profile and data.</p>
                      </div>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-[#fca5a5]">{deleting ? 'Deleting…' : 'Danger'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right column */}
            <aside className="space-y-4">
              <div className="rounded-2xl border border-[#1b1f2b] bg-[#050608] p-4">
                <h2 className="text-sm font-semibold mb-2 text-[#9a9fb5] uppercase tracking-wide">Profile snapshot</h2>
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0a0d14] border border-[#222] flex items-center justify-center font-semibold">
                      {(user.username || user.fullName || user.firstName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.username || user.fullName || user.firstName}</p>
                      <p className="text-xs text-[#9a9fb5]">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#9a9fb5]">We could not load your profile info.</p>
                )}
              </div>

              <div className="rounded-2xl border border-[#1b1f2b] bg-[#050608] p-4">
                <h2 className="text-sm font-semibold mb-2 text-[#9a9fb5] uppercase tracking-wide">Region</h2>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0a0d14] border border-[#222] flex items-center justify-center text-[#76f5d2]">
                      <Globe2 size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-[#9a9fb5]">Language</p>
                      <p className="text-sm font-semibold">English</p>
                    </div>
                  </div>
                  <span className="text-[0.65rem] px-2 py-1 rounded-full border border-[#333] text-[#9a9fb5]">More languages soon</span>
                </div>
              </div>

              {/* Save button removed since no other editable settings yet */}
            </aside>
          </div>
        </section>
      </main>

      <Footer isLoggedIn={true} />
    </>
  );
};

export default Settings;
