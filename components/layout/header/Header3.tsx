"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "../MobileMenu";

type Header3Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
  handlePopup: () => void;
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

export default function Header3({
  scroll,
  handleMobileMenu,
  handlePopup,
}: Header3Props) {
  return (
    <>
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
                      alt="Agile Nexus Solutions"
                      width={203}
                      height={66}
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
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      alt="Agile Nexus Solutions"
                      width={203}
                      height={66}
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
                <div
                  className="search-box-outer search-toggler"
                  onClick={handlePopup}
                >
                  <Image
                    src="/assets/images/icons/icon-9.svg"
                    alt="Search Icon"
                    width={20}
                    height={20}
                  />
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
