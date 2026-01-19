'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Cpu, QrCode, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getOemsWithModels, createRobot, confirmPairing, type OemWithModels } from '@/server/robots'

type Step = 'select' | 'pairing' | 'complete'

export default function NewRobotPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [isLoading, setIsLoading] = useState(false)
  const [oems, setOems] = useState<OemWithModels[]>([])
  const [isLoadingOems, setIsLoadingOems] = useState(true)
  
  const [selectedOem, setSelectedOem] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [robotName, setRobotName] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [pairingCode, setPairingCode] = useState('')
  const [robotId, setRobotId] = useState('')

  const currentOem = oems.find((o) => o.id === selectedOem)

  // Charger les OEMs au montage
  useEffect(() => {
    async function loadOems() {
      try {
        const data = await getOemsWithModels()
        setOems(data)
      } catch (error) {
        console.error('Error loading OEMs:', error)
        toast.error('Erreur lors du chargement des constructeurs')
      } finally {
        setIsLoadingOems(false)
      }
    }
    loadOems()
  }, [])

  const handleStartPairing = async () => {
    if (!selectedOem || !selectedModel || !serialNumber) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await createRobot({
        oemId: selectedOem,
        modelId: selectedModel,
        serialNumber: serialNumber.trim(),
        nickname: robotName.trim() || undefined,
      })

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la création')
        return
      }

      setRobotId(result.robotId!)
      setPairingCode(result.pairingCode!)
      setStep('pairing')
    } catch (error) {
      console.error('Error starting pairing:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPairing = async () => {
    if (!robotId) {
      toast.error('Robot non trouvé')
      return
    }

    setIsLoading(true)
    
    try {
      const result = await confirmPairing(robotId)

      if (!result.success) {
        toast.error(result.error || 'Erreur lors de la confirmation')
        return
      }

      setStep('complete')
      toast.success('Robot appairé avec succès !')
    } catch (error) {
      console.error('Error confirming pairing:', error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8 md:py-12">
      <div className="container max-w-2xl">
        {/* Back */}
        <Link
          href="/dashboard/robots"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à mes robots
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ajouter un robot</h1>
          <p className="text-muted-foreground">
            Appairez votre robot pour commencer à installer des skills
          </p>
        </div>

        {/* Step 1: Select Robot */}
        {step === 'select' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Informations du robot
              </CardTitle>
              <CardDescription>
                Sélectionnez votre constructeur et modèle de robot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingOems ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : oems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun constructeur disponible
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Constructeur *</Label>
                    <Select value={selectedOem} onValueChange={(v) => { setSelectedOem(v); setSelectedModel(''); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un constructeur" />
                      </SelectTrigger>
                      <SelectContent>
                        {oems.map((oem) => (
                          <SelectItem key={oem.id} value={oem.id}>
                            {oem.brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedOem && currentOem && (
                    <div className="space-y-2">
                      <Label>Modèle *</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un modèle" />
                        </SelectTrigger>
                        <SelectContent>
                          {currentOem.models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.modelName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="serial">Numéro de série *</Label>
                    <Input
                      id="serial"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Ex: RT100-2024-XXXXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Le numéro de série se trouve généralement sous le robot ou dans les paramètres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du robot (optionnel)</Label>
                    <Input
                      id="name"
                      value={robotName}
                      onChange={(e) => setRobotName(e.target.value)}
                      placeholder="Ex: Mon Robot"
                    />
                  </div>

                  <Button
                    onClick={handleStartPairing}
                    disabled={!selectedOem || !selectedModel || !serialNumber || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Initialisation...
                      </>
                    ) : (
                      'Lancer l\'appairage'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Pairing */}
        {step === 'pairing' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Appairage en cours
              </CardTitle>
              <CardDescription>
                Entrez ce code sur votre robot pour finaliser l&apos;appairage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center bg-muted rounded-lg px-8 py-4 mb-4">
                  <span className="text-4xl font-mono font-bold tracking-widest">
                    {pairingCode}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ce code expire dans 10 minutes
                </p>
              </div>

              <div className="bg-muted/40 rounded-lg p-4">
                <h4 className="font-medium mb-2">Comment faire ?</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li>1. Sur votre robot, ouvrez les paramètres</li>
                  <li>2. Allez dans &quot;Connexion&quot; ou &quot;Pairing&quot;</li>
                  <li>3. Sélectionnez &quot;RobotSkills&quot;</li>
                  <li>4. Entrez le code affiché ci-dessus</li>
                </ol>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmPairing}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'J\'ai entré le code'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Robot ajouté avec succès !</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Votre robot {robotName ? `"${robotName}"` : ''} est maintenant connecté. Vous pouvez commencer à installer des skills.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/robots">
                      Voir mes robots
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/store">
                      Explorer le Store
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help */}
        <Card className="mt-6 bg-muted/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Besoin d&apos;aide ?</p>
                <p className="text-muted-foreground">
                  Si vous rencontrez des difficultés pour appairer votre robot, consultez notre{' '}
                  <Link href="/docs" className="text-primary hover:underline">
                    documentation
                  </Link>{' '}
                  ou{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    contactez le support
                  </Link>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
