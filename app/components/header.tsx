"use client";

import Link from 'next/link';
import { CurrentUser } from '../auth/signup/types';

const Header = ({ currentUser }: CurrentUser) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ]
    .filter((linkConfig) => linkConfig)
    .map(({ label, href }: any) => {
      return (
        <li key={href}>
          <Link
            href={href}
            className="text-gray-700 hover:text-black transition-colors"
          >
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className="bg-gray-100 border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-semibold text-gray-900"
        >
          GitTix
        </Link>

        {/* Auth Links */}
        <ul className="flex items-center space-x-6 text-sm font-medium">
          {links}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
