import { useState } from 'react'
import { useRouter } from 'next/router'
import SectionGrey from '@/components/SectionGrey'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      const data = await res.json()
      setError(data.message)
    }
  }

  return (
    <SectionGrey>
      <div className="min-h-screen pt-20">
        <h1>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" style={{ color: 'black' }}>
            Login
          </button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </SectionGrey>
  )
}
