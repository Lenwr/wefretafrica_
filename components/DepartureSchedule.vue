<script setup lang="ts">
const departures = [
  { destination: 'Lomé', country: 'Togo · maritime : retrait au dépôt vers Adéwui', date: 'Toutes les 2 semaines', duration: 'Environ 1 mois', status: 'Inscriptions ouvertes' },
  { destination: 'Cotonou', country: 'Bénin', date: 'Toutes les 2 semaines', duration: 'Environ 1 mois et demi', status: 'Inscriptions ouvertes' }
]
</script>
<template>
  <section id="departs" class="departures-section">
    <div class="departures-copy"><p class="kicker">Calendrier maritime</p><h2>Départs <em>toutes les deux semaines</em></h2><p>Les départs maritimes vers Lomé et Cotonou sont organisés toutes les deux semaines. Contactez notre équipe pour connaître la prochaine date disponible.</p><NuxtLink class="text-link" to="/devis-en-ligne?transport=Maritime">Préparer mon envoi →</NuxtLink></div>
    <div class="departure-list"><article v-for="departure in departures" :key="departure.destination"><div><span>{{departure.country}}</span><h3>France → {{departure.destination}}</h3></div><div><small>Fréquence</small><strong>{{departure.date}}</strong></div><div><small>Délai estimé</small><strong>{{departure.duration}}</strong></div><b>{{departure.status}}</b></article></div>
  </section>
</template>
