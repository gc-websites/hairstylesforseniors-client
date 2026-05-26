import { FC, useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onDone?: () => void;
}

const Toast: FC<ToastProps> = ({ message, duration = 2200, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onDone]);

  if (!visible) return null;

  return (
    <div className="hfs-forum__toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      <span>{message}</span>
    </div>
  );
};

export default Toast;
