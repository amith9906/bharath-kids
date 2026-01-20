import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiShoppingCart, FiFileText, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../contexts/StoreContext';

const Home = () => {
  const { t } = useTranslation();
  const store = useStore();

  const steps = [
    {
      icon: FiShoppingBag,
      title: t('home.step1Title'),
      description: t('home.step1Desc')
    },
    {
      icon: FiShoppingCart,
      title: t('home.step2Title'),
      description: t('home.step2Desc')
    },
    {
      icon: FiFileText,
      title: t('home.step3Title'),
      description: t('home.step3Desc')
    }
  ];

  const fullAddress = store.getFullAddress();
  const logoUrl = store.getLogoUrl();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={store.storeName}
              className="h-20 sm:h-24 w-auto mx-auto mb-6 bg-white rounded-lg p-2"
            />
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {store.storeName || t('home.title')}
          </h1>
          {store.tagline && (
            <p className="text-lg sm:text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
              {store.tagline}
            </p>
          )}
          <p className="text-base sm:text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <FiShoppingBag className="w-5 h-5" />
            {t('home.browseProducts')}
          </Link>
        </div>
      </section>

      {/* About Section (if aboutText exists) */}
      {store.aboutText && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              About Us
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {store.aboutText}
            </p>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10 sm:mb-12">
            {t('home.howItWorks')}
          </h2>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-primary-600 mb-2">
                  {index + 1}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      {(store.phone || store.email || fullAddress) && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
              Contact Us
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {store.phone && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 mb-1">Phone</span>
                  <span className="font-medium text-gray-900">{store.phone}</span>
                </a>
              )}

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <FaWhatsapp className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 mb-1">WhatsApp</span>
                  <span className="font-medium text-gray-900">{store.whatsapp}</span>
                </a>
              )}

              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 mb-1">Email</span>
                  <span className="font-medium text-gray-900 break-all">{store.email}</span>
                </a>
              )}

              {fullAddress && (
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-3">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-gray-500 mb-1">Address</span>
                  <span className="font-medium text-gray-900">{fullAddress}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary-50 rounded-2xl p-6 sm:p-8 md:p-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm sm:text-base">
              Browse our catalog and create your quotation request in just a few clicks.
            </p>
            <Link
              to="/items"
              className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-3"
            >
              {t('home.browseProducts')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
