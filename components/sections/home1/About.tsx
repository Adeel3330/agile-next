"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface AboutData {
  title?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
}

export default function About() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [date, setDate] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [aboutImage, setAboutImage] = useState<string | null>(null);
    const [services, setServices] = useState<Service[]>([]);

    useEffect(() => {
        setMounted(true);
        fetchAboutData();
        fetchServices();
    }, []);

    const fetchAboutData = async () => {
        setLoading(true);
        try {
            // Fetch data from About Us page only
            const response = await fetch('/api/pages?template=about-us');
            const data = await response.json();

            if (data.success && data.page) {
                setAboutData(data.page);
                
                // Get image from page fileUrl or media API
                if (data.page.fileUrl) {
                    setAboutImage(data.page.fileUrl);
                } else {
                    // Try to get image from media API
                    try {
                        const mediaRes = await fetch('/api/media?position=about');
                        const mediaData = await mediaRes.json();
                        if (mediaData.success && mediaData.media && mediaData.media.length > 0) {
                            setAboutImage(mediaData.media[0].fileUrl);
                        }
                    } catch (err) {
                        console.error('Failed to fetch about media:', err);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch about data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        setServicesLoading(true);
        try {
            const response = await fetch('/api/services?limit=50');
            const data = await response.json();

            if (data.success && data.services) {
                setServices(data.services);
            }
        } catch (err) {
            console.error('Failed to fetch services:', err);
        } finally {
            setServicesLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage(null);

        try {
            const selectedServiceObj = services.find(s => s.id === selectedService);
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    serviceId: selectedService || null,
                    serviceName: selectedServiceObj?.title || selectedService || null,
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    appointmentDate: date,
                    appointmentTime: null,
                    message: null
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSubmitMessage({ type: 'success', text: data.message || 'Booking submitted successfully!' });
                // Reset form
                setName('');
                setEmail('');
                setDate('');
                setPhone('');
                setSelectedService('');
            } else {
                setSubmitMessage({ type: 'error', text: data.message || 'Failed to submit booking. Please try again.' });
            }
        } catch (err) {
            console.error('Submit booking error:', err);
            setSubmitMessage({ type: 'error', text: 'Failed to submit booking. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) {
        return null;
    }

    // Extract title from content HTML or use page title
    const getAboutTitle = () => {
        if (aboutData?.content) {
            const titleMatch = aboutData.content.match(/<h2[^>]*>(.*?)<\/h2>/i);
            if (titleMatch) {
                return titleMatch[1].replace(/<[^>]*>/g, '').trim();
            }
        }
        return aboutData?.title || 'Expertise and compassion saved my life';
    };

    // Extract description from content HTML or use page description
    const getAboutDescription = () => {
        if (aboutData?.content) {
            const paraMatch = aboutData.content.match(/<p[^>]*>(.*?)<\/p>/i);
            if (paraMatch) {
                return paraMatch[1].replace(/<[^>]*>/g, '').trim();
            }
        }
        return aboutData?.description || 'The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me';
    };

    const aboutTitle = getAboutTitle();
    const aboutDescription = getAboutDescription();
    const imageUrl = aboutImage || '/assets/images/resource/about-1.jpg';

  return (
        <section className="about-section p_relative">
            <div className="pattern-layer" style={{ backgroundImage: "url(assets/images/shape/shape-8.png)" }}></div>
            <div className="wave-layer">
                <div className="wave-1">
                    <svg width="318" height="131" viewBox="0 0 318 131" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468" stroke="#BDBDBD"/>
                    </svg>
                </div>
                <div className="wave-2">
                    <svg width="318" height="131" viewBox="0 0 318 131" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468" stroke="#BDBDBD"/>
                    </svg>
                </div>
            </div>
            <div className="auto-container">
                <div className="upper-content mb_80">
                    <div className="row clearfix">
                        <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                            <div className="content-block-one">
                                <div className="content-box">
                                    <div className="sec-title mb_15">
                                        <span className="sub-title mb_5">About the company</span>
                                        {loading ? (
                                            <div className="skeleton" style={{ width: '70%', height: '40px', marginBottom: '20px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                                        ) : (
                                            <h2>{aboutTitle}</h2>
                                        )}
                                    </div>
                                    <div className="text-box mb_30 pb_30">
                                        {loading ? (
                                            <>
                                                <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '10px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                                                <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '10px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                                                <div className="skeleton" style={{ width: '95%', height: '16px', background: '#e0e0e0', borderRadius: '4px' }}></div>
                                            </>
                                        ) : (
                                            <p>{aboutDescription}</p>
                                        )}
                                    </div>
                                    <div className="inner-box">
                                        <div className="row clearfix">
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Specialities</h4>
                                                    <ul className="list-style-one clearfix">
                                                        <li>Preventive care</li>
                                                        <li>Diagnostic testing</li>
                                                        <li>Mental health services</li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                                                <div className="specialities-box">
                                                    <h4>Our Vision</h4>
                                                    <ul className="list-style-one clearfix">
                                                        <li>To provide accessible and equitable</li>
                                                        <li>To use innovative technology</li>
                                                        <li>To empower patients</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                            <div className="image-block-one">
                                <div className="image-box">
                                    <div className="shape">
                                        <div className="shape-1" style={{ backgroundImage: "url(assets/images/shape/shape-9.png)" }}></div>
                                        <div className="shape-2" style={{ backgroundImage: "url(assets/images/shape/shape-10.png)" }}></div>
                                    </div>
                                    {loading ? (
                                        <div className="skeleton" style={{ width: '100%', height: '399px', background: '#e0e0e0', borderRadius: '10px' }}></div>
                                    ) : (
                                        <figure className="image">
                                            <Image 
                                                src={getCloudinaryImageUrl(imageUrl)} 
                                                alt="About Image" 
                                                width={523} 
                                                height={399} 
                                                priority 
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        </figure>
                                    )}
                                    <div className="text-box">
                                        <div className="image-shape"style={{ backgroundImage: "url(assets/images/shape/shape-7.png)" }}></div>
                                        <h2>30</h2>
                                        <span>Years of Experience in This Field</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="appointment-box">
                    <h4>Book an Appointment</h4>
                    <div className="form-inner">
                        <form onSubmit={handleSubmit} className="clearfix">
                            <div className="form-group mt-5">
                                <div className="icon-box"><i className="icon-15"></i></div>
                                <span>Choose services</span>
                                <div className="select-box">
                                    <select 
                                        className="selectmenu"
                                        value={selectedService}
                                        onChange={(e) => setSelectedService(e.target.value)}
                                        required
                                        disabled={servicesLoading || submitting}
                                    >
                                        <option value="">Select a service</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mt-5">
                                <div className="icon-box"><i className="icon-16"></i></div>
                                <span>Date</span>
                                <input
                                    type="date"
                                    id="date"
                                    placeholder="MM / DD / YYYY"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group mt-5">
                                <div className="icon-box"><i className="icon-17"></i></div>
                                <span>Phone</span>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    placeholder="+ 1 (XXX) XXX XXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group mt-5">
                                <div className="icon-box"><i className="fa fa-user"></i></div>
                                <span>Name</span>
                                <input 
                                    type="text" 
                                    name="name" 
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            <div className="form-group mt-5">
                                <div className="icon-box"><i className="fa fa-envelope"></i></div>
                                <span>Email</span>
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={submitting}
                                />
                            </div>
                            {submitMessage && (
                                <div className={`alert ${submitMessage.type === 'success' ? 'alert-success' : 'alert-danger'}`} style={{
                                    padding: '10px 15px',
                                    marginBottom: '15px',
                                    position: 'absolute',
                                    width: '100%',
                                    borderRadius: '4px',
                                    backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                                    color: submitMessage.type === 'success' ? '#155724' : '#721c24',
                                    border: `1px solid ${submitMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                                }}>
                                    {submitMessage.text}
                                </div>
                            )}
                            <div className="message-btn mt-5">
                                <button 
                                    type="submit" 
                                    className="theme-btn btn-one"
                                    disabled={submitting || !date || !phone || !selectedService || !name || !email}
                                    style={{ position: 'relative', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                                >
                                    {submitting && (
                                        <p style={{ 
                                            position: 'absolute', 
                                            left: '15px', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            display: 'inline-block',
                                            width: '14px',
                                            height: '14px',
                                            border: '2px solid #fff',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite'
                                        }}></p>
                                    )}
                                    <span style={{ marginLeft: submitting ? '25px' : '0' }}>
                                        {submitting ? 'Submitting...' : 'Book Now'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `
                    @keyframes spin {
                        0% { transform: translateY(-50%) rotate(0deg); }
                        100% { transform: translateY(-50%) rotate(360deg); }
                    }
                `}} />
            </div>
        </section>
  );
}
