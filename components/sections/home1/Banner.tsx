'use client'

import Link from "next/link";
import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  slidesPerView: 1,
  spaceBetween: 30,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    320: { slidesPerView: 1 },
    575: { slidesPerView: 1 },
    767: { slidesPerView: 1 },
    991: { slidesPerView: 1 },
    1199: { slidesPerView: 1 },
    1350: { slidesPerView: 1 },
  },
};

export default function Banner() {
  return (
    <section className="banner-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/assets/images/shape/shape-3.png)" }}
      ></div>

      <Swiper {...swiperOptions} className="swiper-container banner-carousel">
        {[1, 2, 3].map((slide) => (
          <SwiperSlide key={slide}>
            <div className="slide-item p_relative">

              {/* Pattern Layer */}
              <div className="pattern-layer">
                <div
                  className="pattern-1"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-1.png)" }}
                />
                <div
                  className="pattern-2"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-2.png)" }}
                />
              </div>

              {/* Shape Layer */}
              <div className="shape-layer">
                <div
                  className="shape-1 float-bob-y"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-3.png)" }}
                />
                <div
                  className="shape-2"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-4.png)" }}
                />
                <div
                  className="shape-3"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-5.png)" }}
                />
                <div
                  className="shape-4"
                  style={{ backgroundImage: "url(/assets/images/shape/shape-6.png)" }}
                />
              </div>

              {/* Content Box */}
              <div className="auto-container">
                <div className="content-box p_relative d_block z_5">
                  <span className="title-text p_relative d_block">Your Health is our Priority</span>
                  <h2 className="p_relative d_block">
                    Compassionate Care, Innovative <span>Treatments</span>
                  </h2>
                  <p>
                    In addition to treating illnesses and injuries, medical care also emphasizes the importance of preventive care, such as regular check-ups, vaccinations, and lifestyle modifications.
                  </p>
                  <div className="btn-box">
                    <Link href="/" className="theme-btn btn-two"><span>Read More</span></Link>
                  </div>
                </div>
              </div>

              {/* Image Box */}
              <div className="image-box">
                <figure className="image">
                  <Image
                    src="/assets/images/banner/banner-img-1.png"
                    alt="Banner"
                    width={711}
                    height={700}
                  />
                </figure>

                {/* Doctors List */}
                <div className="doctors-list">
                  <ul className="thumb-box flex gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <li key={i}>
                        <Image
                          src={`/assets/images/banner/thumb-${i}.jpg`}
                          alt={`Thumb ${i}`}
                          width={45}
                          height={45}
                        />
                      </li>
                    ))}
                  </ul>
                  <h3>100K</h3>
                  <span>Professional Doctors</span>
                </div>
              </div>

            </div>
          </SwiperSlide>
        ))}

      </Swiper>
    </section>
  );
}
