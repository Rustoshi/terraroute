"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export function JivoChatWidget() {
    const pathname = usePathname();

    // Don't render on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <Script
            src="//code.jivosite.com/widget/VqwMENR8nK"
            strategy="afterInteractive"
            async
        />

    );
}
