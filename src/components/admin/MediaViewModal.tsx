'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';
import styles from '@/app/admin/media/media.module.css';

export interface MediaViewItem {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  position?: string;
  status?: string;
  displayOrder?: number;
  altText?: string;
  linkUrl?: string;
  created_at?: string;
  updated_at?: string;
}

interface MediaViewModalProps {
  item: MediaViewItem | null;
  open: boolean;
  onClose: () => void;
  title?: string;
}

function formatFileSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatLabel(value?: string) {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MediaViewModal({
  item,
  open,
  onClose,
  title = 'Media Details',
}: MediaViewModalProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 150);
  };

  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  const imageSrc = item.fileUrl ? getCloudinaryImageUrl(item.fileUrl) : '';

  return (
    <>
      <div
        className={`${styles.modalBackdrop} ${closing ? '' : styles.modalBackdropShow}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`${styles.modalRoot} ${closing ? '' : styles.modalRootShow}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mediaViewModalTitle"
      >
        <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle} id="mediaViewModalTitle">
                {title}
              </h5>
              <button
                type="button"
                className={styles.modalClose}
                onClick={handleClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalImageCol}>
                  {imageSrc ? (
                    <div className={styles.modalImageWrap}>
                      <Image
                        src={imageSrc}
                        alt={item.altText || item.title}
                        width={400}
                        height={300}
                        style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <div className={styles.modalNoImage}>No image</div>
                  )}
                </div>
                <div className={styles.modalDetailsCol}>
                  <div className={styles.modalField}>
                    <span className={styles.modalLabel}>Title</span>
                    <span className={styles.modalValue}>{item.title}</span>
                  </div>
                  {item.position !== undefined && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Position</span>
                      <span className={styles.modalValue}>{formatLabel(item.position)}</span>
                    </div>
                  )}
                  {item.status !== undefined && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Status</span>
                      <span className={styles.modalValue}>{formatLabel(item.status)}</span>
                    </div>
                  )}
                  {item.displayOrder !== undefined && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Display order</span>
                      <span className={styles.modalValue}>{item.displayOrder}</span>
                    </div>
                  )}
                  {item.fileType !== undefined && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>File type</span>
                      <span className={styles.modalValue}>{item.fileType || '—'}</span>
                    </div>
                  )}
                  {item.fileSize !== undefined && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>File size</span>
                      <span className={styles.modalValue}>{formatFileSize(item.fileSize)}</span>
                    </div>
                  )}
                  {item.fileName && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>File name</span>
                      <span className={styles.modalValue}>{item.fileName}</span>
                    </div>
                  )}
                  {item.altText && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Alt text</span>
                      <span className={styles.modalValue}>{item.altText}</span>
                    </div>
                  )}
                  {item.linkUrl && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Link URL</span>
                      <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className={styles.modalLink}>
                        {item.linkUrl}
                      </a>
                    </div>
                  )}
                  {item.created_at && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Created</span>
                      <span className={styles.modalValue}>
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {item.updated_at && (
                    <div className={styles.modalField}>
                      <span className={styles.modalLabel}>Last updated</span>
                      <span className={styles.modalValue}>
                        {new Date(item.updated_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className={styles.modalFieldFull}>
                    <span className={styles.modalLabel}>Description / Message</span>
                    <div className={styles.modalMessageBox}>
                      {item.description || '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnModalClose} onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
