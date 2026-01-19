import Script from 'next/script'
import { HelpCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqData = [
  {
    question: "Quelle est la taille réelle du marché des robots domestiques aujourd'hui ?",
    answer: "Le marché mondial des robots domestiques est estimé entre 10 et 14 milliards de dollars en 2024–2025 selon plusieurs cabinets d'études. Cette valeur est principalement portée par les robots utilitaires, notamment les aspirateurs robots, qui représentent la majorité des ventes et des revenus du segment."
  },
  {
    question: "Le marché des robots domestiques est-il réellement en forte croissance ?",
    answer: "Oui, le marché des robots domestiques connaît une croissance soutenue, avec un taux de croissance annuel composé estimé entre 15 % et 20 %. Cette croissance concerne principalement l'expansion de segments existants comme les robots de nettoyage, plutôt que l'adoption massive de robots domestiques polyvalents."
  },
  {
    question: "Combien de robots domestiques sont réellement présents dans les foyers ?",
    answer: "Les estimations indiquent qu'environ 40 millions de robots domestiques pourraient être présents dans les foyers mondiaux autour de 2025, et plus de 50 millions d'unités d'ici 2027. Ce volume reste faible comparé aux autres équipements domestiques courants, confirmant le caractère encore marginal du marché."
  },
  {
    question: "Quels types de robots domestiques dominent réellement le marché ?",
    answer: "Les robots domestiques les plus répandus sont les robots spécialisés, tels que les aspirateurs et laveurs de sol, les tondeuses autonomes et les robots de piscine. Ces catégories concentrent l'essentiel de l'adoption et du chiffre d'affaires, tandis que les robots plus complexes restent marginaux."
  },
  {
    question: "Pourquoi les robots domestiques restent-ils des produits de niche malgré la croissance du marché ?",
    answer: "Les robots domestiques restent des produits de niche car leur valeur d'usage est limitée à des tâches spécifiques, leur coût reste élevé et leur fiabilité diminue dès que les usages deviennent complexes. Pour la majorité des foyers, ces produits ne sont pas encore perçus comme indispensables."
  },
  {
    question: "Quelles sont les principales limites technologiques des robots domestiques actuels ?",
    answer: "Les principales limites technologiques concernent la manipulation d'objets en environnement non structuré, la compréhension du contexte domestique et la sécurité en présence d'humains. Ces contraintes expliquent pourquoi les robots domestiques évitent les interactions physiques complexes."
  },
  {
    question: "Quel est le coût réel d'un robot domestique sur le long terme ?",
    answer: "Le coût réel d'un robot domestique inclut le prix d'achat, la maintenance, les pièces de rechange, les mises à jour logicielles et parfois des abonnements cloud. Sur plusieurs années, le coût total de possession peut dépasser largement l'investissement initial."
  },
  {
    question: "Quand les robots domestiques deviendront-ils réellement grand public ?",
    answer: "Les robots domestiques deviendront grand public lorsque trois conditions seront réunies : une valeur d'usage claire, une sécurité maîtrisée et un coût accessible. À court et moyen terme, le marché évoluera surtout par l'amélioration progressive de robots spécialisés."
  }
]

// Schema JSON-LD pour SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqData.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
}

export function FAQ() {
  return (
    <>
      {/* JSON-LD Schema pour SEO */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 text-primary mb-4">
              <HelpCircle className="h-5 w-5" />
              <span className="text-sm font-medium">FAQ</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur le marché des robots domestiques
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
              {faqData.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-muted/50 rounded-lg border-none px-6 data-[state=open]:bg-muted"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium text-foreground">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  )
}
