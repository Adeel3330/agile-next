"use client";
import { useEffect, useState } from "react";

const PRELOADER_TEXT = "Agile Nexus Solutions";

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === "complete") {
      setLoading(false);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="loader-wrap">
      <div className="preloader">
          <div id="handle-preloader" className="handle-preloader">
              <div className="animation-preloader">
                  <div className="load-inner">
                      <div className="spinner"></div>
                      <div className="txt-loading">
                          {PRELOADER_TEXT.split("").map((letter, index) => (
                            <span
                              key={`${letter}-${index}`}
                              data-text-preloader={letter === " " ? "\u00A0" : letter}
                              className="letters-loading"
                            >
                              {letter === " " ? "\u00A0" : letter}
                            </span>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  );
}
