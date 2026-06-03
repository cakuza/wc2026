import Script from "next/script";

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <>
      {gaId ? (
        <>
          {/* Google Analytics is disabled unless NEXT_PUBLIC_GA_ID is set. */}
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-placeholder" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}
      {plausibleDomain ? (
        <>
          {/* Plausible is disabled unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set. */}
          <Script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js" strategy="afterInteractive" />
        </>
      ) : null}
    </>
  );
}
