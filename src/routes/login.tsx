import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { zLoginRequest } from '@/api/generated/zod.gen'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = zLoginRequest.safeParse({ identifier, password })
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      let msg = firstError.message
      if (firstError.path.length > 0) {
        const fieldName = firstError.path[0] === 'identifier' ? 'Kullanıcı adı veya E-posta' : 'Şifre'
        msg = `${fieldName}: ${firstError.message}`
      }
      setError(msg)
      return
    }

    setError('')
    setIsLoading(true)
    try {
      await login(identifier, password)
      navigate({ to: '/' })
    } catch (err: any) {
      console.error('Login error:', err)
      const msg = err?.error || err?.message || 'Giriş başarısız. Kullanıcı adı/e-posta veya şifre hatalı.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-primary/5">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <LogIn className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Tekrar Hoş Geldiniz</CardTitle>
          <CardDescription>
            Sinter hesabınıza giriş yapın
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground">
                  <User className="h-4 w-4" />
                </span>
                <Input
                  type="text"
                  placeholder="ör. jinx veya jinx@sinter.app"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-10 h-10 w-full bg-background/50 border-muted focus-visible:ring-primary/20"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Şifre
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 w-full bg-background/50 border-muted focus-visible:ring-primary/20"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium transition-all duration-200 hover:scale-[1.01]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Hesabınız yok mu? </span>
              <Link
                to="/register"
                className="font-semibold text-primary underline-offset-4 hover:underline transition-all"
              >
                Kayıt Olun
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
