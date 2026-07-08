import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="google-site-verification" content="wBC-yYb6c2zy_SOiVKrPibVaGBIF-Pyfu3ZABH-BfzI" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        
        {/* Inject langsung dari CDN, aman dari sanitizer Cloudflare */}
      </head>
      <body>{children}</body>
    </html>
  );
}
