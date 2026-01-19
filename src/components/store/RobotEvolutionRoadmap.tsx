'use client'

import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function RobotEvolutionRoadmap() {
  const t = useTranslations('store')

  const stages = [
    { id: 1, active: true },
    { id: 2, active: false },
    { id: 3, active: false },
    { id: 4, active: false },
  ]

  return (
    <div className="mb-10">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>{t('disclaimer')}</strong> — {t('disclaimerText')}
        </p>
      </div>

      {/* Fresque */}
      <div className="relative p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 border">
        {/* Titre */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">{t('roadmap.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('roadmap.subtitle')}</p>
        </div>

        {/* Timeline horizontale - Desktop */}
        <div className="hidden lg:block">
          {/* Ligne de progression */}
          <div className="relative mb-6">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />
            <div className="absolute top-3 left-0 h-0.5 bg-primary" style={{ width: '12%' }} />

            {/* Points */}
            <div className="relative flex justify-between">
              {stages.map((stage) => (
                <div key={stage.id} className="flex flex-col items-center" style={{ width: '24%' }}>
                  <div
                    className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${
                      stage.active
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-slate-300 dark:border-slate-600 text-muted-foreground'
                    }
                  `}
                  >
                    {stage.id}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cartes */}
          <div className="grid grid-cols-4 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`
                  p-4 rounded-lg transition-all
                  ${
                    stage.active
                      ? 'bg-white dark:bg-slate-800 shadow-md border-2 border-primary/30'
                      : 'bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 opacity-60'
                  }
                `}
              >
                {stage.active && (
                  <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded bg-primary/10 text-primary">
                    {t('roadmap.today')}
                  </span>
                )}
                <h3
                  className={`font-medium text-sm mb-1 ${stage.active ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  {t(`roadmap.stages.${stage.id}.title`)}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {t(`roadmap.stages.${stage.id}.subtitle`)}
                </p>
                <p
                  className={`text-xs leading-relaxed ${stage.active ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}
                >
                  {t(`roadmap.stages.${stage.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline verticale - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex gap-4">
              {/* Ligne verticale + point */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0
                  ${
                    stage.active
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-slate-300 dark:border-slate-600 text-muted-foreground'
                  }
                `}
                >
                  {stage.id}
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 mt-2 ${stage.active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                )}
              </div>

              {/* Contenu */}
              <div className={`flex-1 pb-4 ${stage.active ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{t(`roadmap.stages.${stage.id}.title`)}</h3>
                  {stage.active && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                      {t('roadmap.today')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {t(`roadmap.stages.${stage.id}.subtitle`)}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(`roadmap.stages.${stage.id}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message de synthèse */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-center text-muted-foreground">
            {t('roadmap.conclusion')}{' '}
            <span className="text-foreground font-medium">{t('roadmap.conclusionHighlight')}</span>
            {t('roadmap.conclusionEnd')}
          </p>
        </div>
      </div>
    </div>
  )
}
