import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <i className="fas fa-lighthouse text-lighthouse-600 text-2xl mr-3"></i>
              <div className="text-xl font-bold text-lighthouse-900">Lighthouse Lyrics</div>
            </div>
            <p className="mt-4 text-gray-500 max-w-md">
              Building the world's most comprehensive multilingual Christian songs database. 
              Discover, contribute, and preserve worship music and hymns across cultures.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-500 hover:text-gray-900">
                  Popular Songs
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-gray-500 hover:text-gray-900">
                  Recent Additions
                </Link>
              </li>
              <li>
                <Link href="/browse" className="text-gray-500 hover:text-gray-900">
                  Browse by Language
                </Link>
              </li>
              <li>
                <Link href="/contributors" className="text-gray-500 hover:text-gray-900">
                  Top Contributors
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guide" className="text-gray-500 hover:text-gray-900">
                  Contribution Guide
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-gray-500 hover:text-gray-900">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-500 hover:text-gray-900">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-500 hover:text-gray-900">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-8 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            © 2024 Lighthouse Lyrics. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <i className="fab fa-github"></i>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <i className="fab fa-discord"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
