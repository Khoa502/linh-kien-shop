import { useDarkMode } from '../context/DarkModeContext'

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode()
  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{ backgroundColor: darkMode ? '#2563eb' : '#cbd5e1' }}
      aria-label="Toggle dark mode"
    >
      <span
        className="inline-block w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center text-xs"
        style={{ transform: darkMode ? 'translateX(26px)' : 'translateX(2px)' }}
      >
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  )
}
