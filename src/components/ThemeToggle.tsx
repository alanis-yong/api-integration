import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      className="theme-toggle"
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon">{dark ? '🌙' : '☀️'}</span>
      <span className={['theme-toggle__track', dark && 'theme-toggle__track--dark'].filter(Boolean).join(' ')}>
        <span className="theme-toggle__knob" />
      </span>
    </button>
  )
}
