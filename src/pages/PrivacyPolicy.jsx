import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PrivacyPolicy({ isLoggedIn: isLoggedInProp, onLogout: onLogoutProp }) {
  const navigate = useNavigate()

  // Local reactive state for login flag
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof isLoggedInProp !== 'undefined') return isLoggedInProp
    try {
      return localStorage.getItem('app:isLoggedIn') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (typeof isLoggedInProp !== 'undefined') setIsLoggedIn(isLoggedInProp)
  }, [isLoggedInProp])

  const handleLocalLogout = () => {
    if (typeof onLogoutProp === 'function') {
      try {
        onLogoutProp()
      } catch (e) {
        // ignore and fallback
      }
    } else {
      try {
        localStorage.removeItem('app:isLoggedIn')
        localStorage.removeItem('app:userData')
      } catch {}
    }

    setIsLoggedIn(false)

    try {
      navigate('/login', { replace: true })
    } catch {}
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-200">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLocalLogout} />

      {/* spacer to prevent overlap with Navbar */}
      <div className="h-20" />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>

        <p className="mb-4">
          This Privacy Policy is a placeholder created for a college project. The content below is fictional
          and intended only to demonstrate how a privacy policy might appear in a prototype application.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <p className="mb-4">
          For the purposes of this demonstration, the application does not collect real personal information.
          Any mention of data collection below is illustrative. In a production application you should clearly
          list the types of data collected (e.g., name, email, watch history) and how they are obtained.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
        <p className="mb-4">
          Example uses might include personalizing recommendations, saving watch lists, and improving the
          user experience. In this prototype, all such behaviors are simulated and no data is transmitted
          to external services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing and Third Parties</h2>
        <p className="mb-4">
          This project does not share data with third parties. For a real application you should disclose any
          third-party services (analytics, hosting, authentication) and link to their privacy practices.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies and Local Storage</h2>
        <p className="mb-4">
          The demo may use the browser's localStorage to persist mock preferences during testing. No tracking
          cookies or analytics are enabled in this prototype unless explicitly added by the developer.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Security</h2>
        <p className="mb-4">
          As a demonstration, security measures are minimal. In a real deployment, follow best practices such
          as using HTTPS, secure authentication, input validation, and careful handling of user data.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Children's Privacy</h2>
        <p className="mb-4">
          This prototype is not directed at children under 13. Do not submit information about children when
          using the demo application.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Changes to This Policy</h2>
        <p className="mb-4">
          This is placeholder text. In a real project, document how you will notify users about significant
          changes to the privacy policy and provide the date of last revision.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">8. Contact</h2>
        <p className="mb-4">
          For questions about this demo privacy policy, contact the project owner (example@example.com).
        </p>

        <p className="mt-10 italic text-gray-500">
          Note: This Privacy Policy page is mock content for a college project and should not be used as legal
          advice or a substitute for a professionally drafted privacy policy.
        </p>
      </main>

      <Footer isLoggedIn={isLoggedIn} />
    </div>
  )
}
