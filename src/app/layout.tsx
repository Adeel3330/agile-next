import type { Metadata } from "next";
import { Roboto, Caveat } from "next/font/google";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { getSettingsForServer } from "@/lib/get-settings-server";

import "../../public/assets/css/bootstrap.css";
import "../../public/assets/css/rtl.css";
import "../../public/assets/css/style.css";
import "../../public/assets/css/responsive.css";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "700"],
  variable: "--roboto",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&family=Caveat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${roboto.variable} ${caveat.variable}`}
      style={{ fontFamily: "'Source Sans Pro', sans-serif" }}
      >
        {children}
        <ClientLayoutWrapper />
      </body>
    </html>
  );
}
