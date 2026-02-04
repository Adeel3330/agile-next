import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BreadcrumbProps {
  breadcrumbTitle: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbTitle }) => {
  return (

    <section className="page-title p_relative centred">
            <div className="bg-layer" style={{ backgroundImage: "url(/assets/images/background/page-title.jpg)" }}
      ></div>
            <figure className="image-layer"><Image src="/assets/images/background/page-title-1.png" alt="Image" width={510} height={502} priority /></figure>
            <div className="auto-container">
                <div className="content-box">
                    <h1>{breadcrumbTitle}</h1>
                    <ul className="bread-crumb clearfix">
                        <li><Link href="/">Home</Link></li>
                        <li>{breadcrumbTitle}</li>
                    </ul>
                </div>
            </div>
        </section>
  );
};

export default Breadcrumb;
