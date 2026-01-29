"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "../MobileMenu";

// ✅ Define props type
type Header3Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
  handlePopup: () => void;
  isSidebar: boolean;
  handleSidebar: () => void;
};

export default function Header3({
  scroll,
  handleMobileMenu,
  handlePopup,
  isSidebar,
  handleSidebar,
}: Header3Props) {
  return (
    <>
      {/* main header */}
      <header
        className={`main-header header-style-three ${
          scroll ? "fixed-header" : ""
        }`}
      >
        <div className="header-lower">
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                    <Image
                      src="/assets/images/logo-2.png"
                      alt="Logo Image"
                      width={203}
                      height={40}
                      priority
                    />
                  </Link>
                </figure>
              </div>

              <div className="menu-area">
                {/* ✅ Mobile menu toggler */}
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                {/* ✅ Desktop nav */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">
                      <li className="current dropdown">
                        <Link href="/">Home</Link>
                        <ul>
                          <li>
                            <Link href="/">Home Page One</Link>
                          </li>
                          <li>
                            <Link href="/index-2">Home Page Two</Link>
                          </li>
                          <li>
                            <Link href="/index-3">Home Page Three</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link href="/departments">Departments</Link>
                        <ul>
                          <li>
                            <Link href="/departments">Our Departments</Link>
                          </li>
                          <li>
                            <Link href="/department-details">Cardiology</Link>
                          </li>
                          <li>
                            <Link href="/department-details-2">Dental</Link>
                          </li>
                          <li>
                            <Link href="/department-details-3">
                              Gastroenterology
                            </Link>
                          </li>
                          <li>
                            <Link href="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link href="/department-details-5">
                              Orthopaedics
                            </Link>
                          </li>
                          <li>
                            <Link href="/department-details-6">
                              Modern Laboratory
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/">Pages</Link>
                        <ul>
                          <li className="dropdown">
                            <Link href="/">Doctors</Link>
                            <ul>
                              <li>
                                <Link href="/doctors">Our Doctors</Link>
                              </li>
                              <li>
                                <Link href="/doctor-details">
                                  Doctor Details
                                </Link>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown">
                            <Link href="/">Portfolio</Link>
                            <ul>
                              <li>
                                <Link href="/portfolio">Portfolio One</Link>
                              </li>
                              <li>
                                <Link href="/portfolio-2">Portfolio Two</Link>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Link href="/pricing">Pricing</Link>
                          </li>
                          <li>
                            <Link href="/error">Page Not Found</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/">Blog</Link>
                        <ul>
                          <li>
                            <Link href="/blog">Blog Grid</Link>
                          </li>
                          <li>
                            <Link href="/blog-2">Blog Standard</Link>
                          </li>
                          <li>
                            <Link href="/blog-details">Blog Details</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              {/* ✅ Right icons */}
              <div className="menu-right-content">
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                    priority
                  />
                </div>
                <div
                  className="nav-btn nav-toggler navSidebar-button clearfix"
                  onClick={handleSidebar}
                >
                  <Image
                    src="/assets/images/icons/icon-10.svg"
                    alt="Sidebar Icon"
                    width={18}
                    height={16}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sticky header */}
        <div
          className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}
        >
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                    <Image
                      src="/assets/images/logo-2.png"
                      alt="Logo Image"
                      width={203}
                      height={40}
                      priority
                    />
                  </Link>
                </figure>
              </div>

              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>
                {/* ✅ Sticky nav uses same structure */}
                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    {/* 🔁 Same nav links (can refactor later into a map) */}
                    <ul className="navigation clearfix">
                      <li className="current dropdown">
                        <Link href="/">Home</Link>
                        <ul>
                          <li>
                            <Link href="/">Home Page One</Link>
                          </li>
                          <li>
                            <Link href="/index-2">Home Page Two</Link>
                          </li>
                          <li>
                            <Link href="/index-3">Home Page Three</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/about">About Us</Link>
                      </li>
                      <li className="dropdown">
                        <Link href="/departments">Departments</Link>
                        <ul>
                          <li>
                            <Link href="/departments">Our Departments</Link>
                          </li>
                          <li>
                            <Link href="/department-details">Cardiology</Link>
                          </li>
                          <li>
                            <Link href="/department-details-2">Dental</Link>
                          </li>
                          <li>
                            <Link href="/department-details-3">
                              Gastroenterology
                            </Link>
                          </li>
                          <li>
                            <Link href="/department-details-4">Neurology</Link>
                          </li>
                          <li>
                            <Link href="/department-details-5">
                              Orthopaedics
                            </Link>
                          </li>
                          <li>
                            <Link href="/department-details-6">
                              Modern Laboratory
                            </Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/">Pages</Link>
                        <ul>
                          <li className="dropdown">
                            <Link href="/">Doctors</Link>
                            <ul>
                              <li>
                                <Link href="/doctors">Our Doctors</Link>
                              </li>
                              <li>
                                <Link href="/doctor-details">
                                  Doctor Details
                                </Link>
                              </li>
                            </ul>
                          </li>
                          <li className="dropdown">
                            <Link href="/">Portfolio</Link>
                            <ul>
                              <li>
                                <Link href="/portfolio">Portfolio One</Link>
                              </li>
                              <li>
                                <Link href="/portfolio-2">Portfolio Two</Link>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <Link href="/pricing">Pricing</Link>
                          </li>
                          <li>
                            <Link href="/error">Page Not Found</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/">Blog</Link>
                        <ul>
                          <li>
                            <Link href="/blog">Blog Grid</Link>
                          </li>
                          <li>
                            <Link href="/blog-2">Blog Standard</Link>
                          </li>
                          <li>
                            <Link href="/blog-details">Blog Details</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                    priority
                  />
                </div>
                <div
                  className="nav-btn nav-toggler navSidebar-button clearfix"
                  onClick={handleSidebar}
                >
                  <Image
                    src="/assets/images/icons/icon-10.svg"
                    alt="Sidebar Icon"
                    width={18}
                    height={16}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Pass props properly to MobileMenu */}
        <MobileMenu
          isSidebar={isSidebar}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={handleSidebar}
        />
      </header>
    </>
  );
}
