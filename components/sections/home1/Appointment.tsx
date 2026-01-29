import Image from "next/image";
export default function Appointment() {
  return (
        <section className="appointment-section">
            <div className="pattern-layer" style={{ backgroundImage: "url(assets/images/shape/shape-17.png)" }}></div>
            <figure className="image-layer"><Image src="/assets/images/resource/women-1.png" alt="Image" width={488} height={591} priority /></figure>
            <div className="outer-container clearfix">
                <div className="left-column">
                    <div className="bg-layer" style={{ backgroundImage: "url(assets/images/background/appointment-bg.jpg)" }}></div>
                    <div className="content-box">
                        <div className="icon-box"><Image src="/assets/images/icons/icon-4.svg" alt="Icon" width={88} height={88} priority /></div>
                        <h3>Need a Doctor for Check-up? Call for an Emergency Service!</h3>
                        <span><a href="tel:112345615523">Call: +1 (123)-456-155-23</a></span>
                    </div>
                </div>
                <div className="right-column">
                    <div className="form-inner">
                        <div className="shape" style={{ backgroundImage: "url(assets/images/shape/shape-16.png)" }}></div>
                        <h3>Make an Appointment </h3>
                        <form action="index.html" method="post">
                            <div className="form-group">
                                <div className="icon"><i className="icon-45"></i></div>
                                <input type="text" name="name" placeholder="Name" required/>
                            </div>
                            <div className="form-group">
                                <div className="icon"><i className="icon-46"></i></div>
                                <input type="email" name="email" placeholder="Email" required/>
                            </div>
                            <div className="form-group">
                                <div className="icon"><i className="icon-48"></i></div>
                                <textarea name="message" placeholder="Message"></textarea>
                            </div>
                            <div className="message-btn">
                                <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
  );
}
