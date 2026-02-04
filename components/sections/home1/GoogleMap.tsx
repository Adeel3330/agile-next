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

interface GoogleMapSectionProps {
  settings?: Settings | null;
  loading?: boolean;
}

export default function GoogleMapSection({ settings, loading = false }: GoogleMapSectionProps) {
  const [mapUrl, setMapUrl] = useState<string>('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2643.6895046810805!2d-122.52642526124438!3d38.00014098339506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085976736097a2f%3A0xbe014d20e6e22654!2sSan Rafael%2C California%2C Hoa Kỳ!5e0!3m2!1svi!2s!4v1678975266976!5m2!1svi!2s');

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

  const formatWorkingHours = () => {
    if (loading || !settings?.workingHours) {
      return (
        <>
          <li>Mon - Wed: <span>8:00AM - 7:00PM</span></li>
          <li>Thu: <span>8:00AM - 7:00PM</span></li>
          <li>Fri: <span>8:00AM - 7:00PM</span></li>
          <li>Sat - Sun: <span>8:00AM - 7:00PM</span></li>
        </>
      );
    }

    const hours = settings.workingHours;
    const daysMap: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekend = ['saturday', 'sunday'];

    const weekdayData = weekdays.map(day => hours[day]).find(h => h && !h.closed);
    const weekendData = weekend.map(day => hours[day]).find(h => h && !h.closed);

    return (
      <>
        {weekdayData && (
          <li>Mon - Fri: <span>{weekdayData.open || '8:00AM'} - {weekdayData.close || '7:00PM'}</span></li>
        )}
        {weekendData && (
          <li>Sat - Sun: <span>{weekendData.open || '8:00AM'} - {weekendData.close || '7:00PM'}</span></li>
        )}
        {!weekdayData && !weekendData && (
          <>
            <li>Mon - Wed: <span>8:00AM - 7:00PM</span></li>
            <li>Thu: <span>8:00AM - 7:00PM</span></li>
            <li>Fri: <span>8:00AM - 7:00PM</span></li>
            <li>Sat - Sun: <span>8:00AM - 7:00PM</span></li>
          </>
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
          <h3>Working Hour:</h3>
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
                  <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:+123045615523'}>
                    {settings?.contactPhone || '+1 (230)-456-155-23'}
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
