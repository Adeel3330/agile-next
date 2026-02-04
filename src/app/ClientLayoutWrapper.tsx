'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ToggleBodyClass from "../../components/elements/Togglebtn";
import SwitcherMenu from "../../components/elements/ColorStyle";

export default function ClientLayoutWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render theme switchers on admin pages
  const isAdminPage = pathname?.startsWith('/admin');

  if (!mounted || isAdminPage) {
    return null;
  }

  return (
    <>
      {/* <ToggleBodyClass /> */}
      {/* <SwitcherMenu /> */}
    </>
  );
}
