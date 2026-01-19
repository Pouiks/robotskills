import { AlertTriangle } from 'lucide-react'

const stages = [
  {
    id: 1,
    title: 'Objets connectés et robots spécialisés',
    subtitle: 'Des usages réels, déjà ancrés dans les foyers',
    description: 'Les foyers sont déjà équipés d\'objets connectés et de robots domestiques spécialisés (ménagers, entretien, surveillance). Ces solutions répondent à des besoins concrets, mais restent limitées dans leurs capacités d\'évolution.',
    active: true,
  },
  {
    id: 2,
    title: 'Premières unités intelligentes',
    subtitle: 'Tests, pilotes et déploiements contrôlés',
    description: 'Des robots plus avancés commencent à être testés dans certains foyers ou environnements pilotes. Ces premières unités permettent de valider des technologies plus complexes et d\'identifier les usages pertinents.',
    active: false,
  },
  {
    id: 3,
    title: 'Industrialisation progressive',
    subtitle: 'Passage à l\'échelle piloté par les constructeurs',
    description: 'Les constructeurs engagent des stratégies d\'industrialisation sur plusieurs années afin de rendre les robots plus fiables, plus accessibles et déployables à grande échelle.',
    active: false,
  },
  {
    id: 4,
    title: 'Adoption et capacités étendues',
    subtitle: 'Vers des robots évolutifs et personnalisables',
    description: 'Une fois largement déployés, les robots domestiques deviennent des plateformes évolutives. Les utilisateurs peuvent découvrir, activer et enrichir leurs robots avec de nouvelles capacités.',
    active: false,
  },
]

export function RobotEvolutionRoadmap() {
  return (
    <div className="mb-10">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Démonstration</strong> — Les skills présentés illustrent le potentiel de la plateforme 
          lorsque l&apos;écosystème robotique sera pleinement opérationnel.
        </p>
      </div>

      {/* Fresque */}
      <div className="relative p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 border">
        {/* Titre */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">L&apos;évolution de la robotique domestique</h2>
          <p className="text-sm text-muted-foreground">Comprendre la trajectoire du marché</p>
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
                  <div className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold
                    ${stage.active 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'bg-background border-slate-300 dark:border-slate-600 text-muted-foreground'
                    }
                  `}>
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
                  ${stage.active 
                    ? 'bg-white dark:bg-slate-800 shadow-md border-2 border-primary/30' 
                    : 'bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 opacity-60'
                  }
                `}
              >
                {stage.active && (
                  <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium rounded bg-primary/10 text-primary">
                    Aujourd&apos;hui
                  </span>
                )}
                <h3 className={`font-medium text-sm mb-1 ${stage.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stage.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{stage.subtitle}</p>
                <p className={`text-xs leading-relaxed ${stage.active ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                  {stage.description}
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
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0
                  ${stage.active 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-background border-slate-300 dark:border-slate-600 text-muted-foreground'
                  }
                `}>
                  {stage.id}
                </div>
                {index < stages.length - 1 && (
                  <div className={`w-0.5 flex-1 mt-2 ${stage.active ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>

              {/* Contenu */}
              <div className={`flex-1 pb-4 ${stage.active ? '' : 'opacity-60'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{stage.title}</h3>
                  {stage.active && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
                      Aujourd&apos;hui
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{stage.subtitle}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message de synthèse */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-center text-muted-foreground">
            L&apos;adoption des robots domestiques ne se fait pas en un instant. Elle s&apos;inscrit dans 
            une <span className="text-foreground font-medium">progression logique</span>, depuis les objets 
            connectés actuels jusqu&apos;à des robots capables d&apos;évoluer avec les usages.
          </p>
        </div>
      </div>
    </div>
  )
}
