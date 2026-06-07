import React from 'react';
import { Coffee, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-espresso text-ivory/80 pt-16 pb-8 border-t border-caramel/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-caramel" />
              <span className="font-heading text-2xl font-bold tracking-wider text-ivory">
                L'Ambroisie
              </span>
            </div>
            <p className="font-body text-sm text-ivory/60 leading-relaxed">
              Crafting premium cafe experiences since 2012. We serve artisanal coffee roasted in-house, delicate pastries, and a chef-curated gourmet menu.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="hover:text-caramel transition-colors text-ivory/70" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="hover:text-caramel transition-colors text-ivory/70" aria-label="Facebook">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold text-caramel mb-4 tracking-wide">QUICK LINKS</h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link to="/menu" className="hover:text-caramel transition-colors">View Menu</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-caramel transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-caramel transition-colors">Admin Portal</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-heading text-lg font-bold text-caramel mb-4 tracking-wide">OPENING HOURS</h4>
            <ul className="space-y-3 font-body text-sm text-ivory/70">
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-caramel shrink-0" />
                <span>Mon - Fri: 8:00 AM - 10:00 PM</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-caramel shrink-0" />
                <span>Sat - Sun: 9:00 AM - 11:00 PM</span>
              </li>
              <li className="text-xs text-caramel/70 italic pl-6">
                *Kitchen closes 30 mins before closing
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="font-heading text-lg font-bold text-caramel mb-4 tracking-wide">CONTACT US</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-caramel shrink-0 pt-0.5" />
                <span className="text-ivory/70">12, Gourmet Boulevard, Connaught Place, New Delhi - 110001</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-caramel shrink-0" />
                <span className="text-ivory/70">+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-caramel shrink-0" />
                <span className="text-ivory/70">info@lambroisie.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ivory/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-body text-ivory/50">
          <p>© {new Date().getFullYear()} L'Ambroisie Cafe. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-caramel transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-caramel transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
