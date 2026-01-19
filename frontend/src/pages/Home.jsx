import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiShoppingCart, FiFileText } from 'react-icons/fi';

const Home = () => {
  const { t } = useTranslation();

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('home.title')}
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('home.subtitle')}
          </p>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <FiShoppingBag className="w-5 h-5" />
            {t('home.browseProducts')}
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.howItWorks')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="text-2xl font-bold text-primary-600 mb-2">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Browse our catalog and create your quotation request in just a few clicks.
            </p>
            <Link
              to="/items"
              className="btn btn-primary text-lg px-8 py-3"
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
