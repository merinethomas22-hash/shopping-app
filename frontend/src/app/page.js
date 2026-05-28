'use client';

import { useState } from 'react';
import { loginCall } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginCall(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      router.push('/products');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      
      {/* Left Side - Image & Branding */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '4rem', color: 'white' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>
        
        {/* Elegant Gradient Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.2) 100%)', zIndex: 1 }}></div>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.05em' }}>BabyPro</h1>
          <p style={{ fontSize: '1.25rem', maxWidth: '500px', lineHeight: 1.6, color: '#e2e8f0' }}>
            Welcome to the future of parenting. BabyPro curates the highest quality, aesthetically pleasing, and safest products for your little ones. Experience seamless, secure shopping built for the modern family.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{ width: '450px', backgroundColor: 'var(--secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', boxShadow: '-20px 0 50px rgba(0,0,0,0.5)', zIndex: 10 }}>
        
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p style={{ color: '#94a3b8' }}>Please enter your details to sign in.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          
          <button type="submit" className="btn btn-accent" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem', fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.39)' }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
}
