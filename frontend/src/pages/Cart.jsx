import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/cart/CartItem';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const Cart = () => {
  const { t } = useTranslation();
  const { items, clearCart, subtotal, discountTotal, taxTotal, grandTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {t('cart.empty')}
            </h2>
            <Link to="/items" className="btn btn-primary mt-4">
              {t('cart.continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{t('cart.title')}</h1>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 sm:gap-2 text-red-600 hover:text-red-700 text-sm sm:text-base"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="hidden xs:inline">{t('cart.clearCart')}</span>
            <span className="xs:hidden">Clear</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-20 sm:top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t('checkout.orderSummary')}
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{t('cart.discountTotal')}</span>
                  <span>-{formatCurrency(discountTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.taxTotal')}</span>
                  <span className="font-medium">{formatCurrency(taxTotal)}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{t('cart.grandTotal')}</span>
                    <span className="text-primary-600">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn btn-primary w-full mt-4 sm:mt-6 py-3 text-sm sm:text-base"
              >
                {t('cart.proceedToCheckout')}
              </Link>

              <Link
                to="/items"
                className="btn btn-secondary w-full mt-2 sm:mt-3 py-3 text-sm sm:text-base"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
