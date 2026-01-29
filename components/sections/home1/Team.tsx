import Image from "next/image";
import Link from "next/link";
export default function Team() {
  return (
        <section className="team-section sec-pad centred">
            <div className="bg-layer" style={{ backgroundImage: "url(assets/images/background/team-bg.jpg)" }}></div>
            <div className="auto-container">
                <div className="sec-title mb_60">
                    <span className="sub-title mb_5">Our Team</span>
                    <h2>The Most Qualified Skillful & <br />Professional staff</h2>
                    <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
                </div>
                <div className="row clearfix">
                    <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                        <div className="team-block-one wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                            <div className="inner-box">
                                <figure className="image-box"><Link href="/doctor-details"><Image src="/assets/images/team/team-1.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                <div className="content-box">
                                    <h3><Link href="/doctor-details">Catherine Denuve</Link></h3>
                                    <span className="designation">Optegra eye</span>
                                    <ul className="social-links clearfix">
                                        <li><Link href="/"><i className="fab fa-facebook-f"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-twitter"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-dribbble"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-behance"></i></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                        <div className="team-block-one wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                            <div className="inner-box">
                                <figure className="image-box"><Link href="/doctor-details"><Image src="/assets/images/team/team-2.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                <div className="content-box">
                                    <h3><Link href="/doctor-details">Jenny Wilson</Link></h3>
                                    <span className="designation">Lens replacement</span>
                                    <ul className="social-links clearfix">
                                        <li><Link href="/"><i className="fab fa-facebook-f"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-twitter"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-dribbble"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-behance"></i></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 team-block">
                        <div className="team-block-one wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                            <div className="inner-box">
                                <figure className="image-box"><Link href="/doctor-details"><Image src="/assets/images/team/team-3.jpg" alt="Image" width={416} height={430} priority /></Link></figure>
                                <div className="content-box">
                                    <h3><Link href="/doctor-details">Guy Hawkins</Link></h3>
                                    <span className="designation">Cataract surgery</span>
                                    <ul className="social-links clearfix">
                                        <li><Link href="/"><i className="fab fa-facebook-f"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-twitter"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-dribbble"></i></Link></li>
                                        <li><Link href="/"><i className="fab fa-behance"></i></Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
  );
}
