import { useEffect, useRef } from 'react';

/**
 * Reusable Modal Component
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} showCloseButton - Show close button in header
 * @param {string} title - Modal title (optional)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} closeOnOverlayClick - Close modal when clicking overlay
 * @param {boolean} closeOnEscape - Close modal on Escape key
 * @param {string} maxWidth - Custom max-width (overrides size)
 * @param {string} maxHeight - Custom max-height
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
  title,
  className = '',
  style = {},
  closeOnOverlayClick = true,
  closeOnEscape = true,
  maxWidth,
  maxHeight,
}) {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Handle Escape key
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    // Handle body scroll lock
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus trap: focus the modal when it opens
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === overlayRef.current && onClose) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    // Prevent clicks inside modal from closing it
    e.stopPropagation();
  };

  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
    full: '95vw',
  };

  const modalMaxWidth = maxWidth || sizeMap[size] || sizeMap.md;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${className}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className="modal-content"
        onClick={handleModalClick}
        style={{
          maxWidth: modalMaxWidth,
          maxHeight: maxHeight || '90vh',
          ...style,
        }}
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                className="modal-close"
                onClick={onClose}
                aria-label="Close modal"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(148, 163, 184, 0.1);
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.75rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.15);
          flex-shrink: 0;
          gap: 1rem;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(148, 163, 184, 0.1);
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          padding: 0;
        }

        .modal-close:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          transform: scale(1.05);
        }

        .modal-close:active {
          transform: scale(0.95);
        }

        .modal-close:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        .modal-body {
          padding: 1.75rem;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .modal-overlay {
            padding: 0.5rem;
          }

          .modal-content {
            border-radius: 12px;
            max-height: 95vh;
          }

          .modal-header {
            padding: 1.25rem 1.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-close {
            width: 32px;
            height: 32px;
          }

          .modal-body {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .modal-header {
            padding: 1rem 1.25rem;
          }

          .modal-title {
            font-size: 1.1rem;
          }

          .modal-body {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}

