import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/stores/useAppStore';
import { 
  Home, 
  Users, 
  Megaphone, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  BarChart3,
  Target,
  Calendar,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    badge: null,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: Users,
    badge: '24',
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    icon: Megaphone,
    badge: '4',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: FileText,
    badge: null,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    badge: null,
  },
];

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    badge: null,
  },
];

export function Sidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className={cn(
      'relative border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Mail className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Linkbird</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col h-full">
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.title}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive 
                    ? 'bg-accent text-accent-foreground shadow-sm' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {sidebarOpen && <span>{item.title}</span>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}