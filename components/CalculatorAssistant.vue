<script setup lang="ts">
const open=ref(false),step=ref<'mode'|'destination'|'details'|'result'>('mode')
type Destination='Togo'|'Bénin'|'Sénégal'|'Abidjan / Côte d’Ivoire'|'Congo – Brazzaville / Pointe-Noire'
const mode=ref<'air'|'sea'>('sea'),destination=ref<Destination>('Togo')
const weight=ref(10),length=ref(100),width=ref(50),height=ref(50),quantity=ref(1)
const volume=computed(()=>length.value*width.value*height.value*quantity.value/1_000_000)
const rate=computed(()=>mode.value==='air'?(destination.value==='Togo'?12:15):(destination.value==='Togo'?600:800))
const price=computed(()=>Math.round((mode.value==='air'?weight.value:volume.value)*rate.value))
const needsQuote=computed(()=>!['Togo','Bénin'].includes(destination.value))
const quoteLink=computed(()=>({path:'/devis-en-ligne',query:{transport:mode.value==='air'?'Aérien':'Maritime',destination:destination.value,type:mode.value==='air'?'Colis légers et non encombrants':'Envoi maritime',mesure:mode.value==='air'?`${weight.value} kg`:`${volume.value.toFixed(3)} m³`}}))
</script>
<template><div class="calc-ai">
  <button class="calc-ai-toggle" type="button" @click="open=!open"><span>✦</span> {{open?'Fermer l’assistant':'Calculer avec le chat IA'}}</button>
  <div v-if="open" class="calc-ai-panel"><p class="ai-bubble">Je vous pose les questions, puis je calcule votre tarif.</p>
    <template v-if="step==='mode'"><p><b>Comment envoyez-vous votre colis ?</b></p><div class="ai-choices"><button type="button" @click="mode='sea';step='destination'">▰ Maritime</button><button type="button" @click="mode='air';step='destination'">✈ Aérien</button></div></template>
    <template v-else-if="step==='destination'"><p><b>Quelle est la destination ?</b></p><div class="ai-choices vertical"><button type="button" @click="destination='Togo';step='details'">Togo</button><button type="button" @click="destination='Bénin';step='details'">Bénin</button><button type="button" @click="destination='Sénégal';step='details'">Sénégal</button><button type="button" @click="destination='Abidjan / Côte d’Ivoire';step='details'">Abidjan</button><button type="button" @click="destination='Congo – Brazzaville / Pointe-Noire';step='details'">Congo : Brazzaville / Pointe-Noire</button></div></template>
    <template v-else-if="step==='details'">
      <form v-if="mode==='air'" class="ai-form" @submit.prevent="step='result'"><p>Quel est le poids du colis ?</p><label>Poids (kg)<input v-model.number="weight" type="number" min="1" step="0.1" required></label><button type="submit">Calculer</button></form>
      <form v-else class="ai-form ai-dimensions" @submit.prevent="step='result'"><p>Quelles sont les dimensions d’un colis ?</p><label>Longueur (cm)<input v-model.number="length" type="number" min="1" required></label><label>Largeur (cm)<input v-model.number="width" type="number" min="1" required></label><label>Hauteur (cm)<input v-model.number="height" type="number" min="1" required></label><label>Quantité<input v-model.number="quantity" type="number" min="1" required></label><button type="submit">Calculer le volume et le tarif</button></form>
    </template>
    <template v-else><div class="ai-bubble result"><span>{{mode==='sea'?`Volume : ${volume.toFixed(3)} m³`:`Poids : ${weight} kg`}}</span><b>{{needsQuote?'Sur devis':`${price} €`}}</b><small v-if="!needsQuote">Estimation à {{rate}} {{mode==='sea'?'€/m³':'€/kg'}}</small><small v-else>Notre équipe confirmera le tarif pour cette destination.</small></div><NuxtLink class="ai-quote-link" :to="quoteLink">Recevoir mon devis →</NuxtLink><button class="ai-restart" type="button" @click="step='mode'">Recommencer</button></template>
  </div>
</div></template>
