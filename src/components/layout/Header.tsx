// src/components/layout/Header.tsx
'use client';

import { Scale, LogIn, LogOut, History, UserCircle, UserCog } from 'lucide-react'; // Added UserCog
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { user, logout, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Scale className="h-7 w-7 text-primary" />
          <span className="text-foreground">Truth Sleuth</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4"> {/* Adjusted gap for smaller screens */}
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
          ) : user ? (
            <>
              <Link href="/history" passHref>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <History className="mr-0 h-4 w-4 sm:mr-2" /> {/* Hide text on very small screens */}
                  <span className="hidden sm:inline">History</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-3"> {/* Adjusted padding */}
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name || user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{user.name || 'My Account'}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>
                      <UserCog className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login" passHref>
              <Button variant="default" size="sm">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
