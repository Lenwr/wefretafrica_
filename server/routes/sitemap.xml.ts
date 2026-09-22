import {articles} from '../../data/articles'

const baseUrl='https://www.wefretafrica.com'
const fixedPages=['/','/fret-aerien','/fret-maritime','/devis-en-ligne','/envois-colis-paris-lome','/envois-colis-paris-cotonou','/blog']
const escapeXml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')

export default defineEventHandler(event=>{
  setResponseHeader(event,'content-type','application/xml; charset=utf-8')
  setResponseHeader(event,'cache-control','public, max-age=3600, s-maxage=86400')
  const urls=[
    ...fixedPages.map(path=>({loc:`${baseUrl}${path}`,lastmod:null})),
    ...articles.map(article=>({loc:`${baseUrl}/blog/${article.slug}`,lastmod:article.date}))
  ]
  const entries=urls.map(({loc,lastmod})=>`  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmod?`\n    <lastmod>${lastmod}</lastmod>`:''}\n  </url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`
})
