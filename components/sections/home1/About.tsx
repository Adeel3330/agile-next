"use client";
import { useState } from "react";
import Image from "next/image";
export default function About() {
    const [date, setDate] = useState("");
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
                                        <h2>Expertise and compassion saved my life</h2>
                                    </div>
                                    <div className="text-box mb_30 pb_30">
                                        <p>The medical professionals who treated me showed unmatched expertise, compassion, and dedication. Their care and support helped me overcome a serious health challenge and get back to living my life. I am forever grateful for everything they did for me</p>
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
                                    <figure className="image"><Image src="/assets/images/resource/about-1.jpg" alt="About Image" width={523} height={399} priority /></figure>
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
                        <form method="post" action="index.html" className="clearfix">
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-15"></i></div>
                                <span>Chose services</span>
                                <div className="select-box">
                                    <select className="selectmenu">
                                        <option>Heart Health</option>
                                        <option>Cardiology</option>
                                        <option>Dental</option>
                                        <option>Gastroenterology</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-16"></i></div>
                                <span>Date</span>
                                <input
                                type="date"
                                id="date"
                                placeholder="MM / DD / YYYY"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}/>
                            </div>
                            <div className="form-group">
                                <div className="icon-box"><i className="icon-17"></i></div>
                                <span>Phone</span>
                                <input type="text" name="phone" placeholder="+ 1 (XXX) XXX XXX"/>
                            </div>
                            <div className="message-btn">
                                <button type="submit" className="theme-btn btn-one"><span>Book Now</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
  );
}
