import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const UserNotification = ({ show, message, variant = 'success', onClose, autoHide = true }) => {
  const [showToast, setShowToast] = useState(show);

  useEffect(() => {
    setShowToast(show);
  }, [show]);

  const handleClose = () => {
    setShowToast(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getBgClass = () => {
    switch (variant) {
      case 'success':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'danger':
        return 'bg-danger';
      case 'info':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      <Toast 
        show={showToast} 
        onClose={handleClose}
        delay={autoHide ? 3000 : null}
        autohide={autoHide}
        className="shadow-lg border-0"
      >
        <Toast.Header className={`${getBgClass()} text-white border-0`}>
          <span className="me-2" style={{ fontSize: '1.2rem' }}>{getIcon()}</span>
          <strong className="me-auto">AgroHub Notification</strong>
        </Toast.Header>
        <Toast.Body className="d-flex align-items-center">
          <div className="flex-grow-1">
            {message}
          </div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default UserNotification;
