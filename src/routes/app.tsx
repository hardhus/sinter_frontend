import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ServerSidebar } from '@/components/layout/ServerSidebar';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <ServerSidebar />
      <div className="flex flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
