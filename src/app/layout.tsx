import type { Metadata } from "next";
import { Roboto, Caveat, Source_Sans_3 } from "next/font/google";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { getSettingsForServer } from "@/lib/get-settings-server";

import "../../public/assets/css/bootstrap.css";
import "../../public/assets/css/rtl.css";
import "../../public/assets/css/animate.css";
import "../../public/assets/css/color/theme-color.css";
import "../../public/assets/css/color.css";
import "../../public/assets/css/elpath.css";
import "../../public/assets/css/flaticon.css";
import "../../public/assets/css/font-awesome-all.css";
import "../../public/assets/css/switcher-style.css";
import "../../public/assets/css/module-css/about.css";
import "../../public/assets/css/module-css/appointment.css";
import "../../public/assets/css/module-css/banner.css";
import "../../public/assets/css/module-css/blog-details.css";
import "../../public/assets/css/module-css/blog.css";
import "../../public/assets/css/module-css/chooseus.css";
import "../../public/assets/css/module-css/clients.css";
import "../../public/assets/css/module-css/contact-info.css";
import "../../public/assets/css/module-css/contact.css";
import "../../public/assets/css/module-css/cta.css";
import "../../public/assets/css/module-css/download.css";
import "../../public/assets/css/module-css/error.css";
import "../../public/assets/css/module-css/faq.css";
import "../../public/assets/css/module-css/funfact.css";
import "../../public/assets/css/module-css/news.css";
import "../../public/assets/css/module-css/page-title.css";
import "../../public/assets/css/module-css/portfolio.css";
import "../../public/assets/css/module-css/pricing.css";
import "../../public/assets/css/module-css/service-details.css";
import "../../public/assets/css/module-css/service.css";
import "../../public/assets/css/module-css/sidebar.css";
import "../../public/assets/css/module-css/subscribe.css";
import "../../public/assets/css/module-css/team-details.css";
import "../../public/assets/css/module-css/team.css";
import "../../public/assets/css/module-css/testimonial.css";
import "../../public/assets/css/module-css/video.css";
import "../../public/assets/css/module-css/working.css";
import "../../public/assets/css/style.css";
import "../../public/assets/css/responsive.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--roboto",
  display: "swap",
  preload: true,
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-source-sans",
  display: "swap",
  preload: true,
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
  preload: true,
});

const DEFAULT_TITLE = "Agile Nexus Solutions - The Most Affordable Medical Billing Company in USA";
const DEFAULT_DESCRIPTION = "Agile Nexus Solutions provides affordable medical billing and healthcare solutions across the USA.";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettingsForServer();
    const title = settings.seoDefaultTitle?.trim() || DEFAULT_TITLE;
    const description = settings.seoDefaultDescription?.trim() || DEFAULT_DESCRIPTION;
    const keywords = settings.seoDefaultKeywords?.trim() || undefined;
    const openGraphImage = settings.seoDefaultImage || undefined;

    return {
      title,
      description,
      ...(keywords && { keywords: keywords.split(/,\s*/).filter(Boolean) }),
      openGraph: {
        title,
        description,
        ...(openGraphImage && { images: [openGraphImage] }),
      },
    };
  } catch {
    return {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} ${sourceSans.variable} ${caveat.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={roboto.className}
        style={{ fontFamily: "var(--roboto), 'Roboto', sans-serif" }}
      >
        {children}
        <ClientLayoutWrapper />
      </body>
    </html>
  );
}
