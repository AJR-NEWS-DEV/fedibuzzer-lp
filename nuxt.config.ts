export default defineNuxtConfig({
  extends: 'content-wind',
  experimental: {
    payloadExtraction: true,
    inlineSSRStyles: false,
  },
  modules: [
    '@nuxtjs/google-adsense'
  ],
  'google-adsense': {
    id: 'ca-pub-6974593739286119',
  },
})
