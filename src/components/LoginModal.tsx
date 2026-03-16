import { useState } from 'react'
import { register as registerApi, login as loginApi } from '../api/api'

interface LoginModalProps {
  onClose: () => void
}

type Tab = 'login' | 'register'

export const LoginModal = ({ onClose }: LoginModalProps) => {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Lecture: Handle Login or Register
    
  }

  const switchTab = (next: Tab) => {
    setTab(next)
    setEmail('')
    setPassword('')
    setError(null)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="modal__tabs">
          <button
            className={`modal__tab${tab === 'login' ? ' modal__tab--active' : ''}`}
            onClick={() => switchTab('login')}
          >
            Sign in
          </button>
          <button
            className={`modal__tab${tab === 'register' ? ' modal__tab--active' : ''}`}
            onClick={() => switchTab('register')}
          >
            Register
          </button>
        </div>

        <p className="modal__subtitle">
          {tab === 'login' ? 'Welcome back to Xsolla Shop' : 'Create your Xsolla Shop account'}
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          <div className="modal__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={tab === 'login'}
            />
          </div>
          <div className="modal__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="modal__error">{error}</p>}
          <button type="submit" className="modal__submit" disabled={loading}>
            {loading ? (tab === 'login' ? 'Signing in…' : 'Creating account…') : tab === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
