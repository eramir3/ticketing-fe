import Link from 'next/link';
import { CurrentUser } from '../auth/signup/types';

const Header = ({ currentUser }: CurrentUser) => {
  const links = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' },
  ].filter((linkConfig) => linkConfig)
    .map(({ label, href }: any) => {
      return (
        <li key={href} className="">
          <Link className="" href={href}>
            {label}
          </Link>
        </li>
      );
    });

  return (
    <nav className="">
      <Link className="" href="/">
        GitTix
      </Link>

      <div className="">
        <ul className="">{links}</ul>
      </div>
    </nav>
  );
};

export default Header