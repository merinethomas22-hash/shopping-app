'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const showNavbar = pathname !== '/' && pathname !== '/register';

  useEffect(() => {
    const checkRole = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === 'admin');
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkRole();
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <html lang="en">
      <head>
        <title>BabyPro - Premium Baby Products</title>
      </head>
      <body>
        {showNavbar && (
          <nav className="navbar">
            <Link href="/products" className="nav-brand" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/logo.png" alt="BabyPro Logo" style={{ height: '30px', marginRight: '10px' }} />
              BabyPro
            </Link>
            <div className="nav-links">
              <Link href="/products" className="nav-link">Products</Link>
              <Link href="/cart" className="nav-link">Cart</Link>
              {isAdmin && <Link href="/admin" className="nav-link">Admin</Link>}
              <button onClick={handleLogout} className="btn" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>Logout</button>
            </div>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}
