import { FaWhatsapp } from 'react-icons/fa';
import { useStore } from '../../contexts/StoreContext';

const WhatsAppButton = () => {
  const store = useStore();
  if (!store.whatsapp) return null;
  const phone = store.whatsapp.replace(/[^0-9]/g, '');
  return (
    <a
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors"
      title="Chat on WhatsApp"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppButton;
