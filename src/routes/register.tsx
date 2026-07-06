import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(username, email, password)
      navigate({ to: '/' })
    } catch (err) {
      console.error("Register error:", err)
      setError('Kayıt başarısız, lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 border rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Kayıt Ol</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Kullanıcı Adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 mb-2 rounded"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />
        <button type="submit" className="w-full bg-primary text-white py-2 rounded">
          Kayıt Ol
        </button>
        <p className="mt-2 text-sm text-center">
          Zaten hesabın var mı? <a href="/login" className="text-blue-500">Giriş Yap</a>
        </p>
      </form>
    </div>
  )
}
