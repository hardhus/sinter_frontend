import { Outlet, createRootRoute, redirect } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('sinter_token')
    const publicPaths = ['/login', '/register']
    if (!token && !publicPaths.includes(location.pathname)) {
      throw redirect({ to: '/login' })
    }
    // Eğer token varsa ve login/register sayfasındaysa ana sayfaya yönlendir
    if (token && publicPaths.includes(location.pathname)) {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
