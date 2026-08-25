<script setup lang="ts">
const route = useRoute()
useSeoMeta({title:'Demander un devis | WefretAfrica',description:'Recevez un devis personnalisé pour votre envoi vers le Togo, le Bénin ou un autre pays d’Afrique de l’Ouest.'})
useHead({link:[{rel:'canonical',href:'https://www.wefretafrica.com/devis-en-ligne'}]})

const form = reactive({
  name:'', email:'', phone:'',
  destination:String(route.query.destination || 'Togo'),
  transport:String(route.query.transport || 'Aérien'),
  parcelType:String(route.query.type || 'Colis standard'),
  measurement:String(route.query.mesure || ''),
  pickup:'Oui', city:'', message:'', website:''
})
const sending=ref(false)
const success=ref(false)
const error=ref('')
async function submit(){
  sending.value=true; error.value=''; success.value=false
  try{ await $fetch('/api/devis',{method:'POST',body:form}); success.value=true }
  catch(e:any){ error.value=e?.data?.statusMessage || 'Impossible d’envoyer la demande. Réessayez ou contactez-nous directement.' }
  finally{ sending.value=false }
}
</script>
<template><main>
  <div class="topbar"><span>France → Togo & Bénin</span><span class="topbar-contact"><a href="tel:+33676492528">☎ 06 76 49 25 28</a><a href="https://www.google.com/maps/search/?api=1&query=15+Rue+des+Écoles+95500+Le+Thillay" target="_blank" rel="noopener">⌖ Le Thillay</a></span></div>
  <header><NuxtLink class="brand" to="/"><img src="/logo.png" alt="Logo WefretAfrica"><b>WeFret<span>Africa</span></b></NuxtLink><NuxtLink class="text-link" to="/">← Retour à l’accueil</NuxtLink></header>
  <section class="quote-page"><div class="quote-intro"><p class="kicker">Devis personnalisé</p><h1>Parlez-nous de <em>votre envoi</em></h1><p>Remplissez ce formulaire. Votre demande sera transmise à l’équipe WefretAfrica avec toutes les informations utiles pour vous répondre.</p><ul><li>✓ Togo et Bénin en priorité</li><li>✓ Aérien ou maritime</li><li>✓ Électronique étudiée séparément</li><li>✓ Enlèvement en Île-de-France</li></ul></div>
    <form class="quote-form" @submit.prevent="submit">
      <div class="form-grid"><label>Nom et prénom *<input v-model="form.name" required autocomplete="name"></label><label>Téléphone *<input v-model="form.phone" required type="tel" autocomplete="tel"></label><label class="wide">Adresse e-mail *<input v-model="form.email" required type="email" autocomplete="email"></label><label>Destination *<select v-model="form.destination" required><option>Togo</option><option>Bénin</option><option>Sénégal</option><option>Abidjan / Côte d’Ivoire</option><option>Congo – Brazzaville / Pointe-Noire</option><option>Autre destination</option></select></label><label>Transport souhaité *<select v-model="form.transport" required><option>Aérien</option><option>Maritime</option><option>À conseiller</option></select></label><label>Type de colis *<select v-model="form.parcelType" required><option>Colis standard</option><option>Vêtements / effets personnels</option><option>Télévision / appareil électronique</option><option>Électroménager / objet volumineux</option><option>Carton / barrique</option><option>Autre</option></select></label><label>Poids ou volume<input v-model="form.measurement" placeholder="Ex. 20 kg ou 0,5 m³"></label><label>Enlèvement à domicile<select v-model="form.pickup"><option>Oui</option><option>Non, dépôt à l’entrepôt</option></select></label><label>Ville de collecte<input v-model="form.city" placeholder="Ex. Paris, Saint-Denis…"></label><label class="wide">Précisions sur le contenu *<textarea v-model="form.message" required rows="5" placeholder="Nature, quantité, dimensions, modèle de l’appareil électronique…"></textarea></label><label class="honeypot" aria-hidden="true">Ne pas remplir<input v-model="form.website" tabindex="-1" autocomplete="off"></label></div>
      <p class="privacy">En envoyant ce formulaire, vous acceptez d’être recontacté au sujet de cette demande.</p><button class="btn full" type="submit" :disabled="sending">{{sending?'Envoi en cours…':'Envoyer ma demande de devis →'}}</button><p v-if="success" class="form-success">✓ Votre demande a bien été envoyée. Nous vous répondrons rapidement.</p><p v-if="error" class="form-error">{{error}}</p>
    </form>
  </section>
</main></template>
