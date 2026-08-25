<script setup lang="ts">
type Message={role:'user'|'assistant',content:string}
type Lead={requestType:string|null,name:string|null,phone:string|null,email:string|null,destination:string|null,transport:string|null,parcelDescription:string|null,measurement:string|null,pickupAddress:string|null,desiredDate:string|null,needsCarton:string|null}
const open=ref(false),input=ref(''),sending=ref(false),error=ref('')
const messages=ref<Message[]>([{role:'assistant',content:'Bonjour 👋 Votre colis est prêt ? Je peux organiser son enlèvement avec vous. Je peux aussi vous renseigner sur nos tarifs, délais et destinations.'}])
const suggestions=['Organiser l’enlèvement de mon colis','Demander un devis','Quels sont vos tarifs ?','Quel est le délai vers le Bénin ?']
async function send(text=input.value){
  const content=text.trim()
  if(!content||sending.value)return
  messages.value.push({role:'user',content});input.value='';sending.value=true;error.value=''
  try{
    const response=await $fetch<{answer:string,lead:Lead|null}>('/api/chat',{method:'POST',body:{messages:messages.value}})
    messages.value.push({role:'assistant',content:response.answer})
    if(response.lead){
      const sent=await $fetch<{success:boolean,results:{firebase:boolean,airtable:boolean,sms:boolean}}>('/api/chat-lead',{method:'POST',body:{lead:response.lead}})
      const channels=[sent.results.firebase?'Firebase':'',sent.results.sms?'SMS':''].filter(Boolean).join(' et ')
      messages.value.push({role:'assistant',content:`✓ Votre demande a bien été transmise à notre équipe${channels?` via ${channels}`:''}. Le bureau vous contactera pour confirmer la suite et, pour un enlèvement, l’heure de passage.`})
    }
  }catch(e:any){
    error.value=e?.data?.statusMessage||'L’assistant est momentanément indisponible.'
  }finally{sending.value=false}
}
</script>
<template>
  <button class="ai-launcher" type="button" :aria-expanded="open" aria-label="Organiser l’enlèvement de mon colis" @click="open=!open"><span>✦</span>{{open?'Fermer':'Faire enlever mon colis'}}</button>
  <section v-if="open" class="ai-chat" aria-live="polite"><header><div><span>✦</span><b>Assistant WefretAfrica</b></div><button type="button" aria-label="Fermer" @click="open=false">×</button></header>
    <div class="ai-chat-body">
      <div class="ai-messages"><p v-for="(message,index) in messages" :key="index" :class="message.role==='assistant'?'ai-bubble':'user-bubble'">{{message.content}}</p><p v-if="sending" class="ai-bubble ai-typing">L’assistant écrit…</p></div>
      <div v-if="messages.length===1" class="ai-suggestions"><button v-for="suggestion in suggestions" :key="suggestion" type="button" @click="send(suggestion)">{{suggestion}}</button></div>
      <p v-if="error" class="ai-error">{{error}}</p>
      <div class="ai-chat-actions"><button class="primary" type="button" @click="send('Je souhaite demander un devis. Accompagnez-moi étape par étape.')">Demander un devis →</button><button type="button" @click="send('Je souhaite organiser un enlèvement. Accompagnez-moi étape par étape.')">Organiser un enlèvement</button></div>
      <form class="ai-input" @submit.prevent="send()"><input v-model="input" maxlength="1500" autocomplete="off" placeholder="Écrivez votre question…" aria-label="Votre question"><button type="submit" :disabled="sending||!input.trim()" aria-label="Envoyer">➜</button></form>
      <small class="ai-disclaimer">Les informations importantes sont confirmées par notre équipe.</small>
    </div>
  </section>
</template>
