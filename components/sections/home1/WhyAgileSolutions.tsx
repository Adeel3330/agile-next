'use client';

import { useEffect, useState } from 'react';

interface PageData {
  id: string;
  title: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  fileUrl?: string;
}

interface SettingsData {
  additionalSettings?: {
    whyAgileKpis?: Array<{ value?: string; label?: string }>;
    whyAgileKpi1Value?: string;
    whyAgileKpi1Label?: string;
    whyAgileKpi2Value?: string;
    whyAgileKpi2Label?: string;
    whyAgileKpi3Value?: string;
    whyAgileKpi3Label?: string;
    whyAgileKpi4Value?: string;
    whyAgileKpi4Label?: string;
    whyAgileKpi5Value?: string;
    whyAgileKpi5Label?: string;
    whyAgileKpi6Value?: string;
    whyAgileKpi6Label?: string;
  };
}

interface KPIItem {
  value: string;
  label: string;
}

const KPI_FALLBACK: KPIItem[] = [
  { value: '30%', label: 'Reduction in A/R' },
  { value: '7–14', label: 'Days Turnaround Time' },
  { value: '95%', label: 'First Pass Clean Claims Rate' },
  { value: 'Up to 30%', label: 'Revenue Increase' },
  { value: '90%', label: 'Collection Ratio' },
  { value: '40+', label: 'Specialties' },
];

export default function WhyAgileSolutions() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pageRes, settingsRes] = await Promise.all([
        fetch('/api/pages/why-agile-solutions'),
        fetch('/api/settings'),
      ]);

      const pageJson = await pageRes.json();
      if (pageJson.success && pageJson.page) setPageData(pageJson.page);

      const settingsJson = await settingsRes.json();
      if (settingsJson.success && settingsJson.settings) setSettingsData(settingsJson.settings);
    } catch (err) {
      console.error('Failed to fetch why agile solutions data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const heading = pageData?.title || 'Why Agile Nexus Solutions?';

  const kpiItems = (() => {
    const settings = settingsData?.additionalSettings;
    const fromArray = settings?.whyAgileKpis
      ?.filter((item) => item?.value && item?.label)
      .map((item) => ({ value: item.value!.trim(), label: item.label!.trim() })) || [];

    if (fromArray.length > 0) return fromArray;

    const fromFields: KPIItem[] = [
      { value: settings?.whyAgileKpi1Value || '', label: settings?.whyAgileKpi1Label || '' },
      { value: settings?.whyAgileKpi2Value || '', label: settings?.whyAgileKpi2Label || '' },
      { value: settings?.whyAgileKpi3Value || '', label: settings?.whyAgileKpi3Label || '' },
      { value: settings?.whyAgileKpi4Value || '', label: settings?.whyAgileKpi4Label || '' },
      { value: settings?.whyAgileKpi5Value || '', label: settings?.whyAgileKpi5Label || '' },
      { value: settings?.whyAgileKpi6Value || '', label: settings?.whyAgileKpi6Label || '' },
    ].filter((item) => item.value.trim().length > 0 && item.label.trim().length > 0);

    if (fromFields.length > 0) return fromFields;

    return KPI_FALLBACK;
  })();

  const introText = (() => {
    if (!pageData?.content || typeof window === 'undefined') {
      return 'Our key performance indicators show measurable outcomes we deliver for healthcare providers through efficient billing and revenue cycle operations.';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(pageData.content, 'text/html');
    const firstParagraph = doc.querySelector('p')?.textContent?.trim();
    return (
      firstParagraph ||
      'Our key performance indicators show measurable outcomes we deliver for healthcare providers through efficient billing and revenue cycle operations.'
    );
  })();

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" style={{ background: '#f5f8fa' }}>
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Why Choose Us</span>
          <h2>{heading}</h2>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '30px 24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          }}
        >
          <div className="centred mb_35">
            <h3 style={{ marginBottom: '12px', fontSize: '30px', fontWeight: 700 }}>Our Key Performance Indicators</h3>
            <p style={{ color: '#555', maxWidth: '860px', margin: '0 auto', lineHeight: 1.8 }}>{introText}</p>
          </div>

          <div className="kpi-grid">
            {kpiItems.map((item, index) => (
              <div key={`${item.value}-${item.label}-${index}`} className="kpi-card">
                <h4 className="kpi-value">{item.value}</h4>
                <p className="kpi-label">{item.label}</p>
              </div>
            ))}
          </div>

          {loading && kpiItems.length === 0 && (
            <div className="kpi-grid">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="kpi-card">
                  <div className="skeleton" style={{ width: '80px', height: '28px', margin: '0 auto 10px', background: '#e0e0e0', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div className="skeleton" style={{ width: '130px', height: '16px', margin: '0 auto', background: '#e0e0e0', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            .kpi-grid {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 16px;
            }
            .kpi-card {
              background: #f5f8fa;
              border-radius: 12px;
              padding: 20px 16px;
              text-align: center;
              border: 1px solid #eef3f8;
            }
            .kpi-value {
              font-size: 34px;
              line-height: 40px;
              font-weight: 800;
              color: var(--theme-color);
              margin-bottom: 8px;
            }
            .kpi-label {
              font-size: 14px;
              line-height: 22px;
              color: #555;
              margin: 0;
              font-weight: 500;
            }
            @media only screen and (max-width: 991px) {
              .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media only screen and (max-width: 575px) {
              .kpi-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            }
          `,
        }}
      />
    </section>
  );
}
