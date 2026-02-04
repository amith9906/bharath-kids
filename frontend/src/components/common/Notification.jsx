import React, { useEffect, useRef } from 'react';

const Notification = ({ message, type = 'info', onClose, duration = 4000 }) => {
  const timer = useRef();

  useEffect(() => {
    if (message) {
      timer.current = setTimeout(() => {
        onClose && onClose();
      }, duration);
    }
    return () => clearTimeout(timer.current);
  }, [message, duration, onClose]);

  if (!message) return null;

  let bgColor = 'bg-blue-500';
  if (type === 'success') bgColor = 'bg-green-500';
  if (type === 'error') bgColor = 'bg-red-500';
  if (type === 'warning') bgColor = 'bg-yellow-500';

  return (
    <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg text-white ${bgColor} animate-fade-in`}
         role="alert">
      <span>{message}</span>
      <button className="ml-4 text-white font-bold" onClick={onClose} aria-label="Close">&times;</button>
    </div>
  );
};

export default Notification;
