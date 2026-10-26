export const environment = {
  // Production build (ng build). `/api` expects the API behind the same domain as the site (reverse proxy).
  // If the API lives on its own domain, put the full URL here, e.g. 'https://api.example.com/api',
  // and set COOKIE_SAMESITE=none and CORS_ORIGINS in backend/.env.
  apiUrl: '/api',
  contact: {
    // Passed to the EmailJS template as {{email}} / {{name}}. Change the recipient here, not in the component.
    recipientEmail: 'a.elshiekh@linex.sa',
    senderName: 'line-x',
  },
  emailjs: {
    serviceId: 'service_qu3lp2s',
    templateId: 'template_7o60nll',
    publicKey: '3OCWh2z8dK60p4sGd',
  },
  map: {
    // Optional. CARTO basemaps now require an API key (tiles come back
    // watermarked "API KEY REQUIRED" otherwise). Leave empty to use the
    // keyless Esri / OpenStreetMap basemaps instead.
    cartoApiKey: '',
  },
};
