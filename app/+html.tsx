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

        {/* Inject font dengan nama internal yang diminta oleh expo-vector-icons web */}
        <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// WAJIB menggunakan nama 'material-community' agar dibaca oleh library Expo Web
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
    src: url('https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/config/TeX-AMS-MML_HTMLorMML.js') format('truetype'); /* jadelivr / cdnjs feather ttf */
    src: url('https://cdn.jsdelivr.net/npm/feather-icons/dist/icons.svg') format('svg');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }
`;
