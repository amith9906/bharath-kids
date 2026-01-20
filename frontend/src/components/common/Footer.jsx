import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useStore } from '../../contexts/StoreContext';

const Footer = () => {
  const { t } = useTranslation();
  const store = useStore();
  const currentYear = new Date().getFullYear();

  const logoUrl = store.getLogoUrl();
  const fullAddress = store.getFullAddress();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={store.storeName}
                  className="h-10 w-auto object-contain bg-white rounded p-1"
                />
              )}
              <h3 className="text-xl font-bold">{store.storeName || t('common.appName')}</h3>
            </div>
            {store.tagline && (
              <p className="text-gray-400 text-sm">{store.tagline}</p>
            )}
            {store.aboutText && (
              <p className="text-gray-400 text-sm line-clamp-3">{store.aboutText}</p>
            )}
            {store.gstin && (
              <p className="text-gray-400 text-sm">GSTIN: {store.gstin}</p>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                >
                  <FiPhone className="w-4 h-4 flex-shrink-0" />
                  {store.phone}
                </a>
              )}
              {store.alternatePhone && (
                <a
                  href={`tel:${store.alternatePhone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                >
                  <FiPhone className="w-4 h-4 flex-shrink-0" />
                  {store.alternatePhone}
                </a>
              )}
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm"
                >
                  <FaWhatsapp className="w-4 h-4 flex-shrink-0" />
                  WhatsApp: {store.whatsapp}
                </a>
              )}
              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                >
                  <FiMail className="w-4 h-4 flex-shrink-0" />
                  {store.email}
                </a>
              )}
              {store.workingHours && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <FiClock className="w-4 h-4 flex-shrink-0" />
                  {store.workingHours}
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Address</h4>
            {fullAddress && (
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <FiMapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </div>
            )}
            {store.proprietorName && (
              <div className="text-gray-400 text-sm">
                <p className="font-medium text-white">Proprietor</p>
                <p>{store.proprietorName}</p>
                {store.proprietorPhone && (
                  <a href={`tel:${store.proprietorPhone}`} className="hover:text-white">
                    {store.proprietorPhone}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links & Social */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.home')}
              </Link>
              <Link to="/items" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.items')}
              </Link>
              <Link to="/cart" className="block text-gray-400 hover:text-white text-sm">
                {t('nav.cart')}
              </Link>
            </div>

            {/* Social Links */}
            {(store.facebook || store.instagram || store.whatsapp) && (
              <div className="pt-4">
                <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
                <div className="flex items-center gap-4">
                  {store.facebook && (
                    <a
                      href={store.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <FaFacebook className="w-6 h-6" />
                    </a>
                  )}
                  {store.instagram && (
                    <a
                      href={store.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <FaInstagram className="w-6 h-6" />
                    </a>
                  )}
                  {store.whatsapp && (
                    <a
                      href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <FaWhatsapp className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            {store.footerText || `© ${currentYear} ${store.storeName || t('common.appName')}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
