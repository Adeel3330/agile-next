'use client';

import { useState, useEffect } from 'react';
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

export default function GoogleMapSection({ settings: propSettings, loading: propLoading }: GoogleMapSectionProps) {
  const [mapUrl, setMapUrl] = useState<string>('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2643.6895046810805!2d-122.52642526124438!3d38.00014098339506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085976736097a2f%3A0xbe014d20e6e22654!2sSan Rafael%2C California%2C Hoa Kỳ!5e0!3m2!1svi!2s!4v1678975266976!5m2!1svi!2s');
  const [apiSettings, setApiSettings] = useState<Settings | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

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
    if (settings) {
      // If map embed URL is provided in settings, use it
      if (settings.mapEmbedUrl) {
        setMapUrl(settings.mapEmbedUrl);
      }
      // Otherwise, try to build from address or coordinates
      else if (settings.additionalSettings?.mapLatitude && settings.additionalSettings?.mapLongitude) {
        const lat = settings.additionalSettings.mapLatitude;
        const lng = settings.additionalSettings.mapLongitude;
        const zoom = settings.additionalSettings.mapZoom || '15';
        setMapUrl(`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133894887!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f${zoom}!3m3!1m2!1s0x0%3A0x0!2z${lat}!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus`);
      }
      // Build from address if available
      else if (settings.contactAddress || settings.contactCity) {
        const address = [
          settings.contactAddress,
          settings.contactCity,
          settings.contactState,
          settings.contactZip,
          settings.contactCountry
        ].filter(Boolean).join(', ');

        if (address) {
          const encodedAddress = encodeURIComponent(address);
          setMapUrl(`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.184133894887!2d-122.52642526124438!3d38.00014098339506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzjCsDAwJzAwLjQiTiAxMjLCsDMxJzM1LjEiVw!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus&q=${encodedAddress}`);
        }
      }
    }
  }, [settings]);
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
      <div className="map-inner">
        {loading ? (
          <div style={{
            width: '100%',
            height: '570px',
            background: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            <span style={{ color: '#999' }}>Loading map...</span>
          </div>
        ) : (
          <iframe
            src={mapUrl}
            height={570}
            style={{ border: 0, width: "100%" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
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
