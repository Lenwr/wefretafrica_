export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.NUXT_OPENAI_MODEL || 'gpt-5-mini',
    firebaseProjectId: process.env.NUXT_FIREBASE_PROJECT_ID || 'wefretafrica-14c7d',
    firebaseClientEmail: process.env.NUXT_FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: process.env.NUXT_FIREBASE_PRIVATE_KEY || '',
    airtableToken: process.env.NUXT_AIRTABLE_TOKEN || '',
    airtableBaseId: process.env.NUXT_AIRTABLE_BASE_ID || 'appZ9xReOhumTuJYL',
    airtableQuotesTableId: process.env.NUXT_AIRTABLE_QUOTES_TABLE_ID || 'tblpJ2fNdFoPxfdza',
    twilioAccountSid: process.env.NUXT_TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.NUXT_TWILIO_AUTH_TOKEN || '',
    twilioFromNumber: process.env.NUXT_TWILIO_FROM_NUMBER || '',
    notificationPhone: process.env.NUXT_NOTIFICATION_PHONE || '+33676492528',
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    quoteToEmail: process.env.NUXT_QUOTE_TO_EMAIL || 'wefretafrica@gmail.com',
    quoteFromEmail: process.env.NUXT_QUOTE_FROM_EMAIL || 'WefretAfrica <onboarding@resend.dev>'
  },
  routeRules: {
    '/': { prerender: true },
    '/fret-aerien': { prerender: true },
    '/fret-maritime': { prerender: true },
    '/envois-colis-paris-lome': { prerender: true },
    '/envois-colis-paris-cotonou': { prerender: true },
    '/blog': { prerender: true },
    '/blog/**': { prerender: true },
    '/devis-en-ligne': { prerender: true },
    '/bons-plans': { redirect: { to: '/blog', statusCode: 301 } }
  },
  app: { head: { htmlAttrs: { lang: 'fr' }, titleTemplate: '%s', meta: [{ name: 'application-name', content: 'WefretAfrica' }, { name: 'theme-color', content: '#071a27' }], link: [{ rel: 'icon', href: '/favicon.png' }] } }
})
