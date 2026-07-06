import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        
        {/* Inject langsung dari CDN, aman dari sanitizer Cloudflare */}
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const fontStyles = `
  @font-face {
    font-family: 'material-community';
    src: url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/fonts/materialdesignicons-webfont.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'feather';
    src: url('https://cdn.jsdelivr.net/npm/feather-font@1.0.0/src/fonts/feather.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;
