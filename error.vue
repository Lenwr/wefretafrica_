<script setup lang="ts">
const props=defineProps<{error:{statusCode?:number;statusMessage?:string}}>()
const is404=computed(()=>props.error?.statusCode===404)
useSeoMeta({title:()=>is404.value?'Page introuvable | WefretAfrica':'Une erreur est survenue | WefretAfrica',robots:'noindex, nofollow'})
</script>
<template>
  <main class="error-page">
    <NuxtLink class="brand" to="/"><img src="/logo.png" alt="Logo WefretAfrica"><b>WeFret<span>Africa</span></b></NuxtLink>
    <section><p class="kicker">Erreur {{error?.statusCode||500}}</p><h1>{{is404?'Cette page est introuvable':'Une erreur est survenue'}}</h1><p>{{is404?'L’adresse demandée n’existe pas ou a été déplacée.':'Veuillez réessayer dans quelques instants.'}}</p><div class="actions"><NuxtLink class="btn" to="/">Retour à l’accueil</NuxtLink><NuxtLink class="text-link" to="/devis-en-ligne">Demander un devis</NuxtLink></div></section>
  </main>
</template>
