export default defineEventHandler(event=>{
  setResponseHeader(event,'content-type','text/plain; charset=utf-8')
  setResponseHeader(event,'cache-control','public, max-age=3600')
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://www.wefretafrica.com/sitemap.xml
`
})
