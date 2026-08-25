<script setup lang="ts">
import {getArticle} from '~/data/articles'
const route=useRoute()
const article=getArticle(String(route.params.slug))
if(!article) throw createError({statusCode:404,statusMessage:'Article introuvable'})
useSeoMeta({title:article.title,description:article.description,keywords:article.keywords,ogTitle:article.title,ogDescription:article.description,ogImage:article.image,ogType:'article'})
useHead({link:[{rel:'canonical',href:`https://www.wefretafrica.com/blog/${article.slug}`} ]})
const escapeHtml=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
function inline(value:string){return escapeHtml(value).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')}
function markdown(value:string){
  const lines=value.trim().split('\n');let html='';let list:''
  const close=()=>{if(list){html+=`</${list}>`;list=''}}
  for(const raw of lines){const line=raw.trim();if(!line){close();continue}
    if(line.startsWith('## ')){close();html+=`<h2>${inline(line.slice(3))}</h2>`}
    else if(line.startsWith('### ')){close();html+=`<h3>${inline(line.slice(4))}</h3>`}
    else if(/^\d+\. /.test(line)){if(list!=='ol'){close();list='ol';html+='<ol>'}html+=`<li>${inline(line.replace(/^\d+\. /,''))}</li>`}
    else if(line.startsWith('- ')){if(list!=='ul'){close();list='ul';html+='<ul>'}html+=`<li>${inline(line.slice(2))}</li>`}
    else{close();html+=`<p>${inline(line)}</p>`}
  }close();return html
}
const formattedContent=markdown(article.content)
</script>
<template><main><div class="topbar"><span>Transport France → Afrique</span><span>Conseils & actualités</span></div><header><NuxtLink class="brand" to="/"><img src="/logo.png" alt="Logo WefretAfrica"><b>WeFret<span>Africa</span></b></NuxtLink><nav><NuxtLink to="/">Accueil</NuxtLink><NuxtLink to="/fret-aerien">Fret aérien</NuxtLink><NuxtLink to="/fret-maritime">Fret maritime</NuxtLink><NuxtLink to="/blog">Blog</NuxtLink></nav><NuxtLink class="btn small" to="/devis-en-ligne">Estimer mon envoi</NuxtLink></header>
  <article class="blog-detail"><NuxtLink class="text-link" to="/blog">← Tous les articles</NuxtLink><div class="blog-detail-head"><p class="kicker">{{article.category}}</p><h1>{{article.title}}</h1><p>{{article.description}}</p><small>Par {{article.author}} · {{new Date(article.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}}</small></div><img class="blog-cover" :src="article.image" :alt="article.imageAlt"><div class="blog-content" v-html="formattedContent"></div></article>
  <section class="cta"><h2>Préparez votre <em>propre envoi</em></h2><NuxtLink class="btn white" to="/devis-en-ligne">Demander un devis →</NuxtLink></section><footer><div class="brand"><img src="/logo.png" alt=""><b>WeFret<span>Africa</span></b></div><p>Votre partenaire pour l’envoi de colis entre la France et l’Afrique.</p><small>© 2026 WefretAfrica. Tous droits réservés.</small></footer></main></template>
