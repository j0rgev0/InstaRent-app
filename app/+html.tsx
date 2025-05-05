import { ScrollViewStyleReset } from 'expo-router/html'
import React, { type PropsWithChildren } from 'react'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

declare global {
  interface Window {
    googleMapsLoaded: boolean
    onGoogleMapsLoaded: () => void
  }
}

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {GOOGLE_MAPS_API_KEY && (
          <React.Fragment>
            <script
              src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geocoding`}
              async
              defer
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.initGoogleMaps = function() {
                    window.googleMapsLoaded = true;
                    if (window.onGoogleMapsLoaded) {
                      window.onGoogleMapsLoaded();
                    }
                  };
                `
              }}
            />
          </React.Fragment>
        )}

        {/* Desactiva el scroll del body para que ScrollView funcione como en móvil */}
        <ScrollViewStyleReset />
        <style
          id="expo-reset"
          dangerouslySetInnerHTML={{
            __html: `
              body,html{height:100%}
              #root{min-height:100%;display:flex}
              .pac-container {
                z-index: 9999 !important;
              }
            `
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
