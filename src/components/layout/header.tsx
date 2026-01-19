'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, Search, User, LogOut, Settings, Package, Cpu, Store, BookOpen, Code, FileText, Building2, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { CurrentUser } from '@/types'

interface HeaderProps {
  user: CurrentUser | null
}

const navigation = [
  { name: 'Store', href: '/store', icon: Store },
  { name: 'Blog', href: '/blog', icon: BookOpen },
]

const mobileFooterLinks = {
  product: [
    { name: 'Catégories', href: '/store?view=categories' },
    { name: 'Populaires', href: '/store?sort=popular' },
    { name: 'Nouveautés', href: '/store?sort=recent' },
  ],
  developers: [
    { name: 'Programme Développeur', href: '/dev', icon: Code },
    { name: 'Documentation', href: '/docs', icon: FileText },
  ],
  company: [
    { name: 'À propos', href: '/about', icon: Building2 },
    { name: 'Contact', href: '/contact', icon: Mail },
  ],
  legal: [
    { name: 'Confidentialité', href: '/privacy' },
    { name: 'CGU', href: '/terms' },
  ],
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex py-1 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image
              src="/logors.png"
              alt="RobotSkills"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="hidden sm:inline-block">RobotSkills</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href || pathname.startsWith(item.href.split('?')[0])
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
            <Link href="/store">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Link>
          </Button>

          {user ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.displayName && <p className="font-medium">{user.displayName}</p>}
                      {user.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/robots">
                      <Cpu className="mr-2 h-4 w-4" />
                      Mes Robots
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/library">
                      <Package className="mr-2 h-4 w-4" />
                      Ma Bibliothèque
                    </Link>
                  </DropdownMenuItem>
                  {user.isDeveloper && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dev">
                          <Settings className="mr-2 h-4 w-4" />
                          Portail Développeur
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {user.organizations.some((o) => o.orgType === 'oem') && (
                    <DropdownMenuItem asChild>
                      <Link href="/oem">
                        <Settings className="mr-2 h-4 w-4" />
                        Portail OEM
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action="/api/auth/signout" method="POST" className="w-full">
                      <button type="submit" className="flex w-full items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/login?mode=signup">S&apos;inscrire</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              {/* Header du menu mobile */}
              <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/logors.png"
                    alt="RobotSkills"
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <span className="font-bold text-xl">RobotSkills</span>
                </Link>
              </div>

              {/* Navigation principale */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                          pathname === item.href || pathname.startsWith(item.href.split('?')[0])
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>

                {/* Section Développeurs */}
                <div className="mt-6">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Développeurs
                  </h3>
                  <div className="space-y-1">
                    {mobileFooterLinks.developers.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Section Entreprise */}
                <div className="mt-6">
                  <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Entreprise
                  </h3>
                  <div className="space-y-1">
                    {mobileFooterLinks.company.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {item.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Connexion si pas connecté */}
                {!user && (
                  <div className="mt-6 space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/login?mode=signup">S&apos;inscrire</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Connexion</Link>
                    </Button>
                  </div>
                )}
              </nav>

              {/* Footer du menu mobile */}
              <div className="border-t p-4 bg-muted/30">
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-muted-foreground">
                  {mobileFooterLinks.legal.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  © {new Date().getFullYear()} RobotSkills
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
