'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function LanguageSelector({ variant = 'icon', className }: LanguageSelectorProps) {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex gap-2', className)}>
        {locales.map((l) => (
          <Button
            key={l}
            variant={locale === l ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLocaleChange(l)}
            className="flex items-center gap-2"
          >
            <span>{localeFlags[l]}</span>
            <span>{localeNames[l]}</span>
          </Button>
        ))}
      </div>
    )
  }

  // Render a placeholder button during SSR to avoid hydration mismatch with Radix IDs
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className}>
        <Globe className="h-5 w-5" />
        <span className="sr-only">Change language</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleLocaleChange(l)}
            className={cn(
              'flex items-center gap-2 cursor-pointer',
              locale === l && 'bg-accent'
            )}
          >
            <span>{localeFlags[l]}</span>
            <span>{localeNames[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
