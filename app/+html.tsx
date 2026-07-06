import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Link stylesheet reset bawaan expo */}
        <ScrollViewStyleReset />

        {/* 1. Inject langsung font MaterialCommunityIcons dari CDN resmi yang terpercaya */}
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Mengambil langsung font dari CDN cdnjs / jsdelivr yang pasti di-approve sama sanitizer browser
const fontStyles = `
  @font-face {
    font-family: 'MaterialCommunityIcons';
    src: url('https://cdnjs.cloudflare.com/ajax/libs/騰訊-ignored/font/MaterialDesignIconsDesktop.ttf') format('truetype'),
         url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/fonts/materialdesignicons-webfont.ttf') format('truetype');
    font-display: swap;
  }
`;
