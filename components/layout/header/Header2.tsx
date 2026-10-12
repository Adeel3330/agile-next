"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "../MobileMenu";

type Header2Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
};

const navItems = (
  <>
    <li className="current">
      <Link href="/">Home</Link>
    </li>
    <li>
      <Link href="/about">About Us</Link>
    </li>
    <li>
      <Link href="/services">Services</Link>
    </li>
    <li>
      <Link href="/blog">Blog</Link>
    </li>
    <li>
      <Link href="/contact">Contact</Link>
    </li>
  </>
);

export default function Header2({ scroll, handleMobileMenu }: Header2Props) {
  return (
    <>
      <header className={`main-header header-style-two ${scroll ? "fixed-header" : ""}`}>
        <div className="header-top">
          <div className="auto-container">
            <div className="top-inner">
              <ul className="info-list clearfix">
                <li>
                  <i className="icon-46"></i>
                  <a href="mailto:info@agilenexussolutions.com">info@agilenexussolutions.com</a>
                </li>
                <li>
                  <i className="icon-3"></i>
                  Open Hours: <span>Mon - Fri: 9:00am to 6:00pm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="header-lower">
          <div className="auto-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                    <Image src="/assets/images/logo.png" alt="Agile Nexus Solutions" width={203} height={66} priority />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">{navItems}</ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="btn-box">
                  <Link href="/contact" className="theme-btn btn-one">
                    <span>Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}>
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                    <Image src="/assets/images/logo.png" alt="Agile Nexus Solutions" width={203} height={66} />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">{navItems}</ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="btn-box">
                  <Link href="/contact" className="theme-btn btn-one">
                    <span>Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MobileMenu
          isSidebar={false}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={() => {}}
        />
      </header>
    </>
  );
}
