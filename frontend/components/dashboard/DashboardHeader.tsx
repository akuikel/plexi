'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Phone, Settings, User, LayoutDashboard, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Generate user initials from name or email
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 lg:py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 lg:gap-3 group flex-shrink-0">
            <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 group-hover:scale-105 transition-transform">
              <Phone className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-serif font-bold text-foreground">Persa</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">AI Voice Assistant</p>
            </div>
          </Link>

          {/* Navigation Pills */}
          <div className="flex items-center gap-2 flex-1 justify-center max-w-xs">
            <div className="flex items-center bg-muted rounded-lg p-1 w-full">
              <Link href="/dashboard" className="flex-1">
                <Button
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-md w-full text-xs lg:text-sm"
                >
                  <LayoutDashboard className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Home</span>
                </Button>
              </Link>
              <Link href="/chat" className="flex-1">
                <Button
                  variant={pathname === '/chat' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-md w-full text-xs lg:text-sm"
                >
                  <MessageCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                  Chat
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <Badge className="hidden sm:flex bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 animate-pulse text-xs">
              <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>
              Online
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-10 w-10 rounded-full hover:scale-105 transition-transform"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profileUrl || ''} alt={user?.name || user?.email || 'User'} />
                    <AvatarFallback className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        {user.role && (
                          <Badge variant="outline" className="w-fit text-xs mt-1">
                            {user.role}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
