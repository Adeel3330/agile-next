'use client';

import { useEffect, useMemo, useState } from 'react';

interface PublicSettings {
  contactPhone?: string | null;
  chatbotUrl?: string | null;
  additionalSettings?: any;
}

export default function FloatingChatWidgets() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWhatsappMenuOpen, setIsWhatsappMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data?.success) {
          setSettings(data.settings || null);
        }
      } catch (error) {
        console.error('Failed to fetch settings for floating chat widgets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const whatsappPhone = useMemo(() => {
    const configuredPhone = settings?.additionalSettings?.whatsappBotPhone || settings?.contactPhone || '';
    return String(configuredPhone).replace(/[^\d]/g, '');
  }, [settings]);

  const whatsappButtons = useMemo(() => {
    const additional = settings?.additionalSettings || {};

    return [
      {
        label: additional.whatsappBotButton1Label || 'Billing Support',
        message: additional.whatsappBotButton1Message || 'Hi, I need help with medical billing support.'
      },
      {
        label: additional.whatsappBotButton2Label || 'Sales Inquiry',
        message: additional.whatsappBotButton2Message || 'Hi, I want to discuss your medical billing services.'
      }
    ];
  }, [settings]);

  const chatbotConfig = useMemo(() => {
    const raw = (settings?.chatbotUrl || '').trim();
    if (!raw) {
      return { mode: 'none' as const, linkUrl: '', embedSrc: '' };
    }

    const scriptSrcMatch = raw.match(/src\s*=\s*['\"]([^'\"]+)['\"]/i);
    if (scriptSrcMatch?.[1]) {
      return { mode: 'embed' as const, linkUrl: '', embedSrc: scriptSrcMatch[1] };
    }

    if (/^https?:\/\//i.test(raw) && raw.includes('embed.tawk.to')) {
      return { mode: 'embed' as const, linkUrl: '', embedSrc: raw };
    }

    const chatUrlMatch = raw.match(/^https?:\/\/tawk\.to\/chat\/([^/]+)\/([^/?#]+)/i);
    if (chatUrlMatch?.[1] && chatUrlMatch?.[2]) {
      return {
        mode: 'embed' as const,
        linkUrl: '',
        embedSrc: `https://embed.tawk.to/${chatUrlMatch[1]}/${chatUrlMatch[2]}`
      };
    }

    if (/^https?:\/\//i.test(raw)) {
      return { mode: 'link' as const, linkUrl: raw, embedSrc: '' };
    }

    return { mode: 'none' as const, linkUrl: '', embedSrc: '' };
  }, [settings]);

  useEffect(() => {
    if (chatbotConfig.mode !== 'embed' || !chatbotConfig.embedSrc) {
      return;
    }

    const existingScript = document.getElementById('talkto-widget-script');
    if (existingScript) {
      return;
    }

    let loaded = false;
    const loadScript = () => {
      if (loaded || document.getElementById('talkto-widget-script')) return;
      loaded = true;
      const script = document.createElement('script');
      script.id = 'talkto-widget-script';
      script.async = true;
      script.defer = true;
      script.src = chatbotConfig.embedSrc;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    };

    // Defer third-party chat until idle / interaction so it does not hurt PageSpeed.
    const idleId =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback(loadScript, { timeout: 6000 })
        : null;
    const timeoutId = window.setTimeout(loadScript, 5000);
    const onInteract = () => loadScript();
    window.addEventListener('scroll', onInteract, { once: true, passive: true });
    window.addEventListener('pointerdown', onInteract, { once: true });
    window.addEventListener('keydown', onInteract, { once: true });

    return () => {
      if (idleId !== null && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', onInteract);
      window.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, [chatbotConfig]);

  const handleTalkToClick = () => {
    if (chatbotConfig.mode === 'embed') {
      const tawkApi = (window as any).Tawk_API;
      if (tawkApi && typeof tawkApi.maximize === 'function') {
        tawkApi.maximize();
        return;
      }
      return;
    }

    if (chatbotConfig.mode === 'link' && chatbotConfig.linkUrl) {
      window.open(chatbotConfig.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const openWhatsApp = (message: string) => {
    if (!whatsappPhone) return;
    const url = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return null;
  }

  const showWhatsapp = Boolean(whatsappPhone);
  const showTalkTo = chatbotConfig.mode !== 'none';

  if (!showWhatsapp && !showTalkTo) {
    return null;
  }

  return (
    <>
      {showWhatsapp && (
        <div style={{ position: 'fixed', left: '20px', bottom: '20px', zIndex: 9999 }}>
          {isWhatsappMenuOpen && (
            <div
              className="card shadow-sm border-0 mb-2"
              style={{ minWidth: '260px', backgroundColor: '#fff', borderRadius: '10px' }}
            >
              <div className="card-body p-2" style={{ backgroundColor: '#fff', borderRadius: '8px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                  Hi! How can we help?
                </div>
                {whatsappButtons.map((button, index) => (
                  <button
                    key={`wa-btn-${index}`}
                    type="button"
                    className="theme-btn btn-one w-100 mb-2"
                    onClick={() => openWhatsApp(button.message)}
                  >
                    <span>{button.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="rounded-circle shadow border-0"
            onClick={() => setIsWhatsappMenuOpen((prev) => !prev)}
            aria-label="Open WhatsApp options"
            style={{
              width: '56px',
              height: '56px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#25D366',
              color: '#fff'
            }}
          >
            <i className="fab fa-whatsapp" style={{ fontSize: '28px' }}></i>
          </button>
        </div>
      )}

      {showTalkTo && (
        <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 9999 }}>
          {/* <button
            type="button"
            onClick={handleTalkToClick}
            className="rounded-circle shadow"
            aria-label="Open Talk.to widget"
            style={{
              width: '56px',
              height: '56px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e88e5',
              color: '#fff',
              textDecoration: 'none',
              border: '0'
            }}
          >
            <i className="fa fa-comments" style={{ fontSize: '22px' }}></i>
          </button> */}
        </div>
      )}
    </>
  );
}
