<script setup lang="ts">
type Message={role:'user'|'assistant',content:string}
type RequestType='devis'|'enlèvement'
type Lead={requestType:RequestType|null,name:string|null,phone:string|null,email:string|null,destination:string|null,transport:string|null,parcelDescription:string|null,measurement:string|null,pickupAddress:string|null,desiredDate:string|null,needsCarton:string|null}
type Step=keyof Omit<Lead,'requestType'>|'deliveryMode'|'confirmation'
const open=ref(false),input=ref(''),sending=ref(false),error=ref(''),step=ref<Step|null>(null)
const messages=ref<Message[]>([{role:'assistant',content:'Bonjour 👋 Je peux organiser votre enlèvement ou votre devis étape par étape. Vous pouvez aussi me poser une question sur nos tarifs, délais et destinations.'}])
const suggestions=['Organiser l’enlèvement de mon colis','Demander un devis','Quels sont vos tarifs ?','Quel est le délai vers le Bénin ?']
const emptyLead=():Lead=>({requestType:null,name:null,phone:null,email:null,destination:null,transport:null,parcelDescription:null,measurement:null,pickupAddress:null,desiredDate:null,needsCarton:null})
const lead=ref<Lead>(emptyLead())
const assistant=(content:string)=>messages.value.push({role:'assistant',content})

function startWizard(requestType:RequestType){
  error.value='';lead.value=emptyLead();lead.value.requestType=requestType;step.value='name'
  messages.value.push({role:'user',content:requestType==='enlèvement'?'Je souhaite organiser un enlèvement.':'Je souhaite demander un devis.'})
  assistant('Quel est votre nom complet ?')
}
function summary(){const l=lead.value;return `Merci de vérifier votre demande :\nNom : ${l.name}\nTéléphone : ${l.phone}\nE-mail : ${l.email||'Non renseigné'}\nDestination : ${l.destination}\nTransport : ${l.transport}\nColis : ${l.parcelDescription}\nPoids ou dimensions : ${l.measurement}\nMode : ${l.pickupAddress?'Enlèvement':'Dépôt au Thillay'}${l.pickupAddress?`\nAdresse : ${l.pickupAddress}\nDate souhaitée : ${l.desiredDate}`:''}\nCarton vide à 10 € : ${l.needsCarton}\n\nConfirmez-vous l’envoi de cette demande ? Répondez oui ou non.`}
async function submitLead(){
  const sent=await $fetch<{results:{firebase:boolean,airtable:boolean,sms:boolean}}>('/api/chat-lead',{method:'POST',body:{lead:lead.value}})
  const channels=[sent.results.firebase?'Firebase':'',sent.results.sms?'SMS':''].filter(Boolean).join(' et ')
  assistant(`✓ Votre demande a bien été transmise à notre équipe${channels?` via ${channels}`:''}. Le bureau vous contactera pour confirmer la suite et, pour un enlèvement, l’heure de passage.`);step.value=null
}
async function wizardAnswer(value:string){
  messages.value.push({role:'user',content:value});input.value='';error.value='';const current=step.value
  if(current==='confirmation'){
    if(/^(oui|ok|d'accord|je confirme)\b/i.test(value)){sending.value=true;try{await submitLead()}catch(e:any){error.value=e?.data?.statusMessage||'La transmission a échoué. Appelez-nous au 06 76 49 25 28.'}finally{sending.value=false};return}
    if(/^(non|modifier|annuler)\b/i.test(value)){step.value=null;assistant('La demande n’a pas été envoyée. Vous pouvez recommencer avec un des boutons ci-dessous.');return}
    assistant('Merci de répondre « oui » pour transmettre la demande ou « non » pour l’annuler.');return
  }
  if(current==='name'){lead.value.name=value;step.value='phone';assistant('Quel est votre numéro de téléphone ?')}
  else if(current==='phone'){lead.value.phone=value;step.value='email';assistant('Quelle est votre adresse e-mail ? Vous pouvez répondre « passer ».')}
  else if(current==='email'){lead.value.email=/^(passer|aucun|non)$/i.test(value)?null:value;step.value='destination';assistant('Quelle est la destination du colis ?')}
  else if(current==='destination'){lead.value.destination=value;step.value='transport';assistant('Souhaitez-vous un transport aérien ou maritime ?')}
  else if(current==='transport'){lead.value.transport=value;step.value='parcelDescription';assistant('Que contient le colis ?')}
  else if(current==='parcelDescription'){lead.value.parcelDescription=value;step.value='measurement';assistant('Quel est son poids ou quelles sont ses dimensions ?')}
  else if(current==='measurement'){lead.value.measurement=value;step.value='deliveryMode';assistant('Préférez-vous un enlèvement en Île-de-France ou un dépôt au 15 Rue des Écoles, 95500 Le Thillay ?')}
  else if(current==='deliveryMode'){
    if(/d[eé]p[oô]t/i.test(value)){lead.value.pickupAddress=null;lead.value.desiredDate=null;step.value='needsCarton';assistant('Avez-vous besoin d’un carton vide à 10 €, livré gratuitement en Île-de-France puis récupéré rempli ?')}
    else{step.value='pickupAddress';assistant('Quelle est l’adresse complète de collecte en Île-de-France ?')}
  } else if(current==='pickupAddress'){lead.value.pickupAddress=value;step.value='desiredDate';assistant('Quelle date d’enlèvement souhaitez-vous ? L’heure sera confirmée par le bureau.')}
  else if(current==='desiredDate'){lead.value.desiredDate=value;step.value='needsCarton';assistant('Avez-vous besoin d’un carton vide à 10 €, livré gratuitement en Île-de-France puis récupéré rempli ?')}
  else if(current==='needsCarton'){lead.value.needsCarton=value;step.value='confirmation';assistant(summary())}
}
async function askAI(content:string){
  messages.value.push({role:'user',content});input.value='';sending.value=true;error.value=''
  try{const response=await $fetch<{answer:string}>('/api/chat',{method:'POST',body:{messages:messages.value}});assistant(response.answer)}
  catch(e:any){error.value=e?.data?.statusMessage||'L’IA est momentanément indisponible. Les demandes de devis et d’enlèvement restent accessibles.'}finally{sending.value=false}
}
async function send(text=input.value){
  const content=text.trim();if(!content||sending.value)return
  if(step.value)return wizardAnswer(content)
  if(/organiser.*enl[eè]vement|faire enlever/i.test(content))return startWizard('enlèvement')
  if(/demander.*devis/i.test(content))return startWizard('devis')
  return askAI(content)
}
</script>
<template>
  <button class="ai-launcher" type="button" :aria-expanded="open" aria-label="Organiser l’enlèvement de mon colis" @click="open=!open"><span>✦</span>{{open?'Fermer':'Faire enlever mon colis'}}</button>
  <section v-if="open" class="ai-chat" aria-live="polite"><header><div><span>✦</span><b>Assistant WefretAfrica</b></div><button type="button" aria-label="Fermer" @click="open=false">×</button></header>
    <div class="ai-chat-body"><div class="ai-messages"><p v-for="(message,index) in messages" :key="index" :class="message.role==='assistant'?'ai-bubble':'user-bubble'">{{message.content}}</p><p v-if="sending" class="ai-bubble ai-typing">Traitement en cours…</p></div>
      <div v-if="messages.length===1" class="ai-suggestions"><button v-for="suggestion in suggestions" :key="suggestion" type="button" @click="send(suggestion)">{{suggestion}}</button></div>
      <p v-if="error" class="ai-error">{{error}}</p>
      <div v-if="!step" class="ai-chat-actions"><button class="primary" type="button" @click="startWizard('devis')">Demander un devis →</button><button type="button" @click="startWizard('enlèvement')">Organiser un enlèvement</button></div>
      <form class="ai-input" @submit.prevent="send()"><input v-model="input" maxlength="1500" autocomplete="off" :placeholder="step?'Votre réponse…':'Posez votre question…'" aria-label="Votre réponse"><button type="submit" :disabled="sending||!input.trim()" aria-label="Envoyer">➜</button></form>
      <small class="ai-disclaimer">Les demandes sont transmises uniquement après votre confirmation.</small>
    </div>
  </section>
</template>
