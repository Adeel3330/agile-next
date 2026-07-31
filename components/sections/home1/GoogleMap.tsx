'use client';

import { useState, useEffect, useRef } from 'react';
import Link from "next/link";

interface Settings {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  contactCountry?: string;
  workingHours?: any;
  mapLocation?: string;
  mapEmbedUrl?: string;
  additionalSettings?: {
    mapLatitude?: string;
    mapLongitude?: string;
    mapZoom?: string;
  };
}

interface WorkingHour {
  open?: string | null;
  close?: string | null;
  closed?: boolean;
}

interface GoogleMapSectionProps {
  settings?: Settings | null;
  loading?: boolean;
}

const DEFAULT_OFFICE_ADDRESS = '7901 4th St N, St. Petersburg, FL 33702, USA';

function buildMapEmbedUrl(address: string) {
  const query = encodeURIComponent(address.trim());
  return `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
}

function buildAddressFromSettings(settings: Settings) {
  return [
    settings.contactAddress,
    settings.contactCity,
    settings.contactState,
    settings.contactZip,
    settings.contactCountry,
  ]
    .filter(Boolean)
    .join(', ');
}

export default function GoogleMapSection({ settings: propSettings, loading: propLoading }: GoogleMapSectionProps) {
  const [mapUrl, setMapUrl] = useState<string>(buildMapEmbedUrl(DEFAULT_OFFICE_ADDRESS));
  const [apiSettings, setApiSettings] = useState<Settings | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (propSettings !== undefined) {
      setApiLoading(false);
      return;
    }

    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (isMounted && data.success && data.settings) {
          setApiSettings(data.settings);
        }
      } catch (err) {
        if (isMounted) console.error('Failed to fetch settings:', err);
      } finally {
        if (isMounted) setApiLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted = false; };
  }, [propSettings]);

  const settings = propSettings !== undefined ? propSettings : apiSettings;
  const loading = propSettings !== undefined ? propLoading : apiLoading;

  useEffect(() => {
    if (!settings) {
      setMapUrl(buildMapEmbedUrl(DEFAULT_OFFICE_ADDRESS));
      return;
    }

    // Prefer an explicit embed URL from CMS when provided.
    if (settings.mapEmbedUrl?.trim()) {
      setMapUrl(settings.mapEmbedUrl.trim());
      return;
    }

    // Coordinates from settings (if configured).
    if (settings.additionalSettings?.mapLatitude && settings.additionalSettings?.mapLongitude) {
      const lat = settings.additionalSettings.mapLatitude;
      const lng = settings.additionalSettings.mapLongitude;
      const zoom = settings.additionalSettings.mapZoom || '15';
      setMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=${zoom}&output=embed`);
      return;
    }

    // Fall back to contact address / mapLocation text.
    const address =
      settings.mapLocation?.trim() ||
      buildAddressFromSettings(settings) ||
      DEFAULT_OFFICE_ADDRESS;

    setMapUrl(buildMapEmbedUrl(address));
  }, [settings]);

  useEffect(() => {
    if (shouldLoadMap || !mapContainerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [shouldLoadMap, loading]);

  const formatTime = (time: string | null) => {
    if (!time) return null;

    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;

    return `${formattedHour}:${minute}${ampm}`;
  };

  const formatWorkingHours = () => {
    if (loading || !settings?.workingHours) {
      return (
        <>
          <li>Mon - Fri: <span>8:00AM - 7:00PM</span></li>
          <li>Sat - Sun: <span>Closed</span></li>
        </>
      );
    }



    const hours = settings.workingHours;

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekend = ['saturday', 'sunday'];

    const weekdayValues = weekdays.map(day => hours[day]);
    const weekendValues = weekend.map(day => hours[day]);

    // ✅ Check if all weekdays are open and same timing
    const firstWeekday = weekdayValues[0];

    const allWeekdaysSame = weekdayValues.every(day =>
      day &&
      !day.closed &&
      day.open === firstWeekday.open &&
      day.close === firstWeekday.close
    );

    // ✅ Check if weekend all closed
    const weekendClosed = weekendValues.every(day => day?.closed);

    return (
      <>
        {/* Weekdays */}
        {allWeekdaysSame ? (
          <li>
            Mon - Fri:{' '}
            <span>
              {formatTime(firstWeekday.open)} - {formatTime(firstWeekday.close)}
            </span>
          </li>
        ) : (
          weekdayValues.map((day, index) =>
            day?.closed ? (
              <li key={weekdays[index]}>
                {weekdays[index].slice(0, 3)}: <span>Closed</span>
              </li>
            ) : (
              <li key={weekdays[index]}>
                {weekdays[index].slice(0, 3)}:{' '}
                <span>
                  {formatTime(day.open)} - {formatTime(day.close)}
                </span>
              </li>
            )
          )
        )}

        {/* Weekend */}
        {weekendClosed ? (
          <li>Sat - Sun: <span>Closed</span></li>
        ) : (
          weekendValues.map((day, index) =>
            day?.closed ? (
              <li key={weekend[index]}>
                {weekend[index].slice(0, 3)}: <span>Closed</span>
              </li>
            ) : (
              <li key={weekend[index]}>
                {weekend[index].slice(0, 3)}:{' '}
                <span>
                  {formatTime(day.open)} - {formatTime(day.close)}
                </span>
              </li>
            )
          )
        )}
      </>
    );
  };

  return (
    <section className="google-map-section">
      <div className="map-inner" ref={mapContainerRef}>
        {loading || !shouldLoadMap ? (
          <div style={{
            width: '100%',
            height: '570px',
            background: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: loading ? 'pulse 1.5s ease-in-out infinite' : undefined
          }}>
            <span style={{ color: '#999' }}>{loading ? 'Loading map...' : 'Map will load when visible'}</span>
          </div>
        ) : (
          <iframe
            src={mapUrl}
            height={570}
            style={{ border: 0, width: "100%" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office location map"
          />
        )}
      </div>
      <div className="content-box">
        <div className="inner-box">
          <h3>Working Hours:</h3>
          <div className="content-inner">
            <ul className="schedule-list clearfix">
              {formatWorkingHours()}
            </ul>
            <h4>Contact Info:</h4>
            <ul className="info-list clearfix">
              <li>
                <i className="icon-46"></i>
                Email: {loading ? (
                  <span style={{
                    display: 'inline-block',
                    width: '180px',
                    height: '16px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    verticalAlign: 'middle'
                  }}></span>
                ) : (
                  <Link href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : 'mailto:info@agilenexussolution.com'}>
                    {settings?.contactEmail || 'info@agilenexussolution.com'}
                  </Link>
                )}
              </li>
              <li>
                <i className="icon-35"></i>
                Call: {loading ? (
                  <span style={{
                    display: 'inline-block',
                    width: '150px',
                    height: '16px',
                    background: '#e0e0e0',
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    verticalAlign: 'middle'
                  }}></span>
                ) : (
                  <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:+17276354993'}>
                    {settings?.contactPhone || '+1(727) 635 4993'}
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
