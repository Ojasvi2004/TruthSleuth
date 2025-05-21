import { Scale } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Scale className="h-7 w-7 text-primary" />
          <span className="text-foreground">Truth Sleuth</span>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
