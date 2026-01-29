'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const newsItems = [
  {
    img: '/assets/images/news/news-1.jpg',
    title: 'Prepare to Speak with Your Eye Specialist.',
    date: 'March 6, 2023',
    author: 'Author',
    comments: '2Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
  {
    img: '/assets/images/news/news-2.jpg',
    title: 'Empowering Patients through Medicine',
    date: 'March 5, 2023',
    author: 'Author',
    comments: '1Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
  {
    img: '/assets/images/news/news-3.jpg',
    title: 'From Diagnosis Role of Medical Research',
    date: 'March 4, 2023',
    author: 'Author',
    comments: '6Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
  {
    img: '/assets/images/news/news-1.jpg',
    title: 'Prepare to Speak with Your Eye Specialist.',
    date: 'March 6, 2023',
    author: 'Author',
    comments: '2Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
  {
    img: '/assets/images/news/news-2.jpg',
    title: 'Empowering Patients through Medicine',
    date: 'March 5, 2023',
    author: 'Author',
    comments: '1Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
  {
    img: '/assets/images/news/news-3.jpg',
    title: 'From Diagnosis Role of Medical Research',
    date: 'March 4, 2023',
    author: 'Author',
    comments: '6Comment',
    link: '/blog-details',
    description: 'To provide accessible and equitable healthcare for all individuals, regardless of their or socioeconomic status.',
  },
];

export default function News() {
  return (
    <section className="news-section sec-pad">
      <div className="auto-container">
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Latest News</span>
          <h2>Resources to Keep You Informed <br />with Our Blog</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />
            illnesses, injuries, and diseases. It
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
          breakpoints={{
            320: { slidesPerView: 1 },
            575: { slidesPerView: 1 },
            767: { slidesPerView: 2 },
            991: { slidesPerView: 2 },
            1199: { slidesPerView: 3 },
          }}
        >
          {newsItems.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="news-block-one">
                <div className="inner-box">
                  <figure className="image-box">
                    <Link href={item.link}>
                      <Image src={item.img} alt={item.title} width={400} height={300} />
                    </Link>
                  </figure>
                  <div className="lower-content">
                    <span className="comment-box">{item.comments}</span>
                    <h3>
                      <Link href={item.link}>{item.title}</Link>
                    </h3>
                    <ul className="post-info clearfix">
                      <li><i className="icon-59"></i>{item.date}</li>
                      <li><i className="icon-60"></i><Link href={item.link}>{item.author}</Link></li>
                    </ul>
                    <p>{item.description}</p>
                    <div className="link">
                      <Link href={item.link}>Read More</Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Optional navigation buttons */}
          <div className="nav-style-one">
            <div className="swiper-nav">
                <button type="button" className="swiper-prev"><span className="icon-21"></span></button>
                <button type="button" className="swiper-next"><span className="icon-22"></span></button>
            </div>
        </div>
        </Swiper>
      </div>
    </section>
  );
}
