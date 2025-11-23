import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function TermsAndConditions({ isLoggedIn: isLoggedInProp, onLogout: onLogoutProp }) {
  const navigate = useNavigate()

  // Local state for reactive rendering. Prefer prop if provided; otherwise read localStorage.
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof isLoggedInProp !== 'undefined') return isLoggedInProp
    try {
      return localStorage.getItem('app:isLoggedIn') === 'true'
    } catch {
      return false
    }
  })

  // If parent later passes a different prop value, keep in sync
  useEffect(() => {
    if (typeof isLoggedInProp !== 'undefined') setIsLoggedIn(isLoggedInProp)
  }, [isLoggedInProp])

  // Central logout handler used here and passed to Navbar
  const handleLocalLogout = () => {
    // If App provided an onLogout handler, call it first to let App update its state
    if (typeof onLogoutProp === 'function') {
      try {
        onLogoutProp()
      } catch (e) {
        // ignore and fallback
      }
    } else {
      // Fallback: clear localStorage ourselves
      try {
        localStorage.removeItem('app:isLoggedIn')
        localStorage.removeItem('app:userData')
      } catch {}
    }

    // Ensure our local state updates so Navbar/Footer reflect logged-out immediately
    setIsLoggedIn(false)

    // Navigate to login page
    try {
      navigate('/login', { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Pass our handler so Navbar will trigger App's logout if available, or our fallback if not */}
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLocalLogout} />

      {/* spacer so content doesn't overlap the fixed navbar */}
      <div className="h-15" />

      <main className="flex-1 max-w-3xl mx-auto px-5 py-15">
        <h1 className="text-3xl font-semibold mb-6">Terms & Conditions</h1>

        <p className="mb-4">
          This project is a college assignment and all content presented here is strictly for
          educational and demonstration purposes. The following terms and conditions outline
          the mock guidelines under which this cinematic watch tracker is showcased.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Educational Use Only</h2>
        <p className="mb-4">
          All data, features, and UI elements in this project are fictional or placeholder
          implementations. They do not represent real services, companies, or platforms. Any
          resemblance to actual products or systems is coincidental.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. No Real Data Tracking</h2>
        <p className="mb-4">
          The application does not collect, store, or process any personal data. All watch
          history, user actions, or account-like elements are simulated for project purposes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Mock Features</h2>
        <p className="mb-4">
          Features such as recommendations, watch lists, spin-the-wheel selections, and genre
          filters are implemented for demonstration only and may not reflect real-world
          accuracy or functionality.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. No Liability</h2>
        <p className="mb-4">
          As this project is purely academic, neither the creator nor the institution is liable
          for any misuse, misunderstanding, or improper interpretation of the content or code.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Temporary and Non-Commercial</h2>
        <p className="mb-4">
          This application is not intended for public release or commercial use. All rights to
          the structure, design, and mock content remain with the creator for academic
          submission only.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Future Changes</h2>
        <p className="mb-4">
          Since this is a prototype, features may change or stop working without notice. The
          project may be expanded, refined, or dismantled after the academic evaluation.
        </p>

        <p className="mt-10 italic text-gray-600">
          This is a placeholder Terms & Conditions page created solely for a college project.
        </p>
      </main>

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  )
}
