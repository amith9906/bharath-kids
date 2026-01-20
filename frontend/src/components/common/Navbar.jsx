import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiShoppingCart, FiMenu, FiX, FiLogOut, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import LanguageSwitcher from './LanguageSwitcher';
const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const store = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const logoUrl = store.getLogoUrl();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Top bar with contact info */}
      {(store.phone || store.whatsapp || store.email) && (
        <div className="bg-primary-600 text-white text-xs sm:text-sm py-1.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center sm:justify-between items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-1 hover:text-primary-100">
                  <FiPhone className="w-3 h-3" />
                  <span className="hidden xs:inline">{store.phone}</span>
                </a>
              )}
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary-100"
                >
                  <FaWhatsapp className="w-3 h-3" />
                  <span className="hidden xs:inline">WhatsApp</span>
                </a>
              )}
            </div>
            {store.workingHours && (
              <span className="hidden sm:block text-primary-100">{store.workingHours}</span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={store.storeName}
                className="h-10 w-auto object-contain"
              />
            ) : null}
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold text-primary-600 leading-tight">
                {store.storeName || t('common.appName')}
              </span>
              {store.tagline && (
                <span className="text-xs text-gray-500 hidden sm:block">{store.tagline}</span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/items"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              {t('nav.items')}
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/my-quotations"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.myQuotations')}
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.admin')}
              </Link>
            )}
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-primary-600 p-2 rounded-lg hover:bg-gray-100"
            >
              <FiShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FiLogOut className="w-4 h-4" />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative p-2">
              <FiShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700"
            >
              {isMobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/items"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
              >
                {t('nav.items')}
              </Link>

              {isAuthenticated && !isAdmin && (
                <Link
                  to="/my-quotations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.myQuotations')}
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                >
                  {t('nav.admin')}
                </Link>
              )}

              <div className="border-t pt-2 mt-2">
                <LanguageSwitcher />
              </div>

              {isAuthenticated ? (
                <div className="border-t pt-2 mt-2">
                  <span className="block px-3 py-2 text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="border-t pt-2 mt-2 flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-primary-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
