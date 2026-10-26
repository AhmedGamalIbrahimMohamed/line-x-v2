export const environment = {
  // Base URL of the backend/ API. Point this at the deployed API for production builds.
  apiUrl: 'http://localhost:4000/api',
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
