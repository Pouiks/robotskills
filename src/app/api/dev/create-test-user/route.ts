import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Route de développement uniquement - créer un utilisateur test et le connecter
export async function POST(request: Request) {
  // Bloquer en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, action = 'signup' } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    // Créer un client Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    if (action === 'signup') {
      // Créer l'utilisateur
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        // Si l'utilisateur existe déjà, essayer de se connecter
        if (error.message.includes('already been registered') || error.message.includes('already registered')) {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (loginError) {
            return NextResponse.json({ error: loginError.message }, { status: 400 })
          }

          return NextResponse.json({
            success: true,
            action: 'login',
            session: loginData.session,
            user: {
              id: loginData.user?.id,
              email: loginData.user?.email,
            },
          })
        }
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Si l'inscription réussit et que l'email est auto-confirmé, on a une session
      if (data.session) {
        return NextResponse.json({
          success: true,
          action: 'signup_with_session',
          session: data.session,
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        })
      }

      return NextResponse.json({
        success: true,
        action: 'signup',
        message: 'User created, check email for confirmation',
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      })
    } else {
      // Connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        action: 'login',
        session: data.session,
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      })
    }
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
