import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Hoş Geldiniz!</h1>
      {user && (
        <div className="mb-4">
          <p>Kullanıcı: <strong>{user.username}</strong></p>
          <p>Email: {user.email}</p>
        </div>
      )}
      <Button onClick={logout}>Çıkış Yap</Button>
    </div>
  )
}
