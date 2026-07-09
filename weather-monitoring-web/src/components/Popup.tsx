import React from 'react';

interface PopupProps {
  title?: string;
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ title, visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Popup;
