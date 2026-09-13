'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Mail, Lock, Shield, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.push('/compte')
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('Email ou mot de passe incorrect.')
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Cet email est déjà utilisé.')
      } else {
        setError('Une erreur est survenue : ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '2rem' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px rgba(11,19,43,0.05)', maxWidth: '450px', width: '100%' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Shield size={48} style={{ color: '#F97316', margin: '0 auto 1rem' }} />
            <h1 style={{ color: '#0B132B', fontSize: '1.5rem', fontWeight: 800 }}>
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Accédez à vos documents achetés et votre historique.
            </p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Adresse Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid #E2E8F0', borderRadius: '0.75rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Mot de passe</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid #E2E8F0', borderRadius: '0.75rem', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Patientez...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: '#64748B' }}>
            {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null) }}
              style={{ background: 'none', border: 'none', color: '#F97316', fontWeight: 600, cursor: 'pointer', marginLeft: '0.5rem', fontSize: '0.875rem' }}
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}
