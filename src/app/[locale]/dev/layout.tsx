import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Code, Package, Send, Home, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { getMe } from '@/server/auth'
import { getDeveloperLicense } from '@/server/developer'

const navItems = [
  { href: '/dev', label: 'Vue d\'ensemble', icon: Home },
  { href: '/dev/skills', label: 'Mes Skills', icon: Package },
  { href: '/dev/submissions', label: 'Soumissions', icon: Send },
]

export default async function DevPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getMe()

  // Not authenticated -> login
  if (!user) {
    redirect('/login?redirect=/dev')
  }

  // Check for valid developer license
  const license = await getDeveloperLicense()

  if (!license || !license.isValid) {
    // Redirect to developer program page with explanation
    redirect('/dashboard/developer?reason=license_required')
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetTitle className="sr-only">Menu Dev Portal</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-2 px-2 mb-4">
                  <Code className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Dev Portal</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo / Title */}
          <Link href="/dev" className="flex items-center gap-2 mr-6">
            <Code className="h-5 w-5 text-primary" />
            <span className="font-semibold hidden sm:inline">Dev Portal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/dev/skills/new">
                <Package className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nouveau Skill</span>
                <span className="sm:hidden">Nouveau</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main>{children}</main>
    </div>
  )
}
