"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { GothamLogo } from '@/icons';

const BlogHeader: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0.00px 1.00px 28px 0px rgba(0,0,0,0.12)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="https://gothamenterprisesltd.com/home" className="flex items-center">
              <GothamLogo className="h-8 w-auto" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="https://gothamenterprisesltd.com/find-jobs"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find Jobs
            </Link>
            <Link 
              href="https://gothamenterprisesltd.com/blog"
              className="text-gray-900 font-medium border-b-2 border-primary"
            >
              Blog
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="https://gothamenterprisesltd.com/login"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Login
            </Link>
            <Link 
              href="https://gothamenterprisesltd.com/register/job-seeker"
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Register
            </Link>
          </div>

          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 mt-2">
              <Link 
                href="https://gothamenterprisesltd.com/find-jobs"
                className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link 
                href="/blog"
                className="block px-3 py-2 text-gray-900 font-medium bg-gray-50 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <Link 
                  href="https://gothamenterprisesltd.com/login"
                  className="block px-3 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="https://gothamenterprisesltd.com/register"
                  className="block px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors mx-3 mt-2 text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default BlogHeader;
