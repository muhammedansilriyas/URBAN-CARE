import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [enrolled, setEnrolled] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setEnrolled(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/30 py-16 px-margin-mobile md:px-margin-desktop mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-on-surface">
        
        <div className="md:col-span-5 space-y-4">
          <div className="font-headline-md text-headline-md text-primary font-bold">Aetheris Medical</div>
          <p className="text-body-md text-on-surface-variant max-w-sm leading-relaxed">
            An architectural approach to modern medicine. Providing elite healthcare through precision, transparency, and sophisticated care environments.
          </p>
          <p className="text-label-sm text-secondary pt-2">
            © {new Date().getFullYear()} Aetheris Medical Group. All rights reserved. <br />
            Clinical Compliance ISO-27001 Certified.
          </p>
        </div>
        
        <div className="md:col-span-3 flex flex-col gap-3">
          <span className="text-label-md text-on-surface font-bold tracking-wider mb-1 uppercase">QUICK LINKS</span>
          <Link className="text-label-sm text-secondary hover:underline w-fit" to="/contact">Compliance & Privacy</Link>
          <Link className="text-label-sm text-secondary hover:underline w-fit" to="/contact">Terms of Service</Link>
          <Link className="text-label-sm text-secondary hover:underline w-fit" to="/login">Provider Portal</Link>
          <Link className="text-label-sm text-secondary hover:underline w-fit" to="/contact">Contact Support</Link>
        </div>
        
        <div className="md:col-span-4 flex flex-col items-start md:items-end w-full space-y-4">
          <span className="text-label-md text-on-surface font-bold tracking-wider uppercase">NEWSLETTER ENROLLMENT</span>
          {enrolled ? (
            <p className="text-sm text-primary font-semibold">Thank you for enrolling in our clinical perspectives digest!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm border-b border-outline-variant focus-within:border-primary transition-all py-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-label-md py-2 outline-none"
                placeholder="Your professional email"
              />
              <button type="submit" className="ml-4 text-primary font-bold text-label-md cursor-pointer hover:opacity-85">
                JOIN
              </button>
            </form>
          )}
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;
