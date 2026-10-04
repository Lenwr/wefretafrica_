<script setup lang="ts">
const mode = ref<'air'|'sea'>('air')
const destination = ref<'Togo'|'Bénin'|'Sénégal'|'Abidjan / Côte d’Ivoire'|'Congo – Brazzaville / Pointe-Noire'|'Autre'>('Togo')
const category = ref<'standard'|'electronic'>('standard')
const pickup = ref<'home'|'depot'>('home')
const weight = ref(10)
const length = ref(100)
const width = ref(50)
const height = ref(50)
const quantity = ref(1)

const volume = computed(() => Math.max(0, length.value * width.value * height.value * quantity.value / 1_000_000))

const needsQuote = computed(() => !['Togo','Bénin'].includes(destination.value) || (mode.value === 'air' && category.value === 'electronic'))
const rate = computed(() => {
  if (mode.value === 'air') return destination.value === 'Togo' ? 12 : 15
  if (destination.value === 'Togo') return 500
  if (destination.value === 'Bénin') return 750
  return 600
})
const seaCartonRate = computed(() => pickup.value === 'depot' ? (destination.value === 'Togo' ? 90 : destination.value === 'Bénin' ? 140 : 110) : (destination.value === 'Togo' ? 100 : destination.value === 'Bénin' ? 150 : 120))
const estimate = computed(() => mode.value === 'air'
  ? Math.round(weight.value * rate.value)
  : Math.round(volume.value * rate.value))
const quoteLink = computed(() => ({ path: '/devis-en-ligne', query: {
  transport: mode.value === 'air' ? 'Aérien' : 'Maritime',
  destination: destination.value,
  type: mode.value === 'air'
    ? (category.value === 'electronic' ? 'Ordinateurs, téléphones et appareils électroniques' : 'Colis légers et non encombrants')
    : 'Envoi maritime',
  mesure: mode.value === 'air' ? `${weight.value} kg` : `${volume.value} m³`
}}))
</script>
<template>
  <div class="calculator-card">
    <div class="mode-toggle"><button type="button" :class="{active:mode==='air'}" @click="mode='air'">✈ Aérien</button><button type="button" :class="{active:mode==='sea'}" @click="mode='sea'">▰ Maritime</button></div>
    <div class="calculator-fields">
      <label>Destination<select v-model="destination"><option>Togo</option><option>Bénin</option><option>Sénégal</option><option>Abidjan / Côte d’Ivoire</option><option>Congo – Brazzaville / Pointe-Noire</option><option value="Autre">Autre destination</option></select></label>
      <label v-if="mode==='air'">Type d’envoi<select v-model="category"><option value="standard">Colis légers et non encombrants</option><option value="electronic">Ordinateurs, téléphones et appareils électroniques</option></select></label>
    </div>
    <label v-if="mode==='air'">Poids estimé <span>{{weight}} kg</span><input v-model.number="weight" type="range" min="1" max="100"><small>1 kg <i>100 kg</i></small></label>
    <div v-else class="volume-calculator">
      <div class="pickup-toggle"><button type="button" :class="{active:pickup==='home'}" @click="pickup='home'">Collecte à domicile</button><button type="button" :class="{active:pickup==='depot'}" @click="pickup='depot'">Dépôt à l’entrepôt</button></div>
      <div class="volume-heading"><b>Calculez votre volume</b><span>{{volume.toFixed(3)}} m³</span></div>
      <p>Indiquez les dimensions extérieures d’un colis en centimètres.</p>
      <div class="volume-fields">
        <label>Longueur (cm)<input v-model.number="length" type="number" min="1" step="1" inputmode="decimal"></label>
        <label>Largeur (cm)<input v-model.number="width" type="number" min="1" step="1" inputmode="decimal"></label>
        <label>Hauteur (cm)<input v-model.number="height" type="number" min="1" step="1" inputmode="decimal"></label>
        <label>Quantité<input v-model.number="quantity" type="number" min="1" step="1" inputmode="numeric"></label>
      </div>
      <small>Formule : longueur × largeur × hauteur × quantité ÷ 1 000 000</small>
    </div>
    <div v-if="!needsQuote" class="estimate"><span>Estimation indicative</span><strong>{{estimate}} €</strong><small>{{mode==='air' ? `${rate} €/kg` : `${rate} €/m³`}}<template v-if="mode==='sea'"> — grand carton : {{seaCartonRate}} €</template> — tarif final après contrôle du colis.</small></div>
    <div v-else class="estimate manual"><span>Tarification spécifique</span><strong>Sur devis</strong><small>Les appareils électroniques (douane à ajouter) et les autres destinations nécessitent une vérification manuelle.</small></div>
    <NuxtLink class="btn full" :to="quoteLink">Recevoir mon devis détaillé →</NuxtLink>
    <CalculatorAssistant />
  </div>
</template>
