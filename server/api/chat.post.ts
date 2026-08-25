type ChatMessage = { role: 'user' | 'assistant', content: string }

const instructions = `Tu es l'assistant clientèle de WefretAfrica. Réponds uniquement en français, avec des réponses courtes, chaleureuses et factuelles.
Informations officielles :
- Aérien Togo : 12 €/kg. Aérien Bénin : 15 €/kg. Livraison indicative vers ces deux pays : 1 semaine. Dépôt 48 h avant le départ.
- Maritime Togo : 600 €/m³ et environ 1 mois. Maritime Bénin : 800 €/m³ et environ 1 mois et demi (jamais 1 mois pour le Bénin).
- En aérien : colis légers et non encombrants, colliers, chaînes, bijoux, vêtements, bagages personnels. Ordinateurs, téléphones et appareils électroniques : douane à ajouter et devis nécessaire.
- Enlèvement sur rendez-vous en Île-de-France. Dépôt : 15 Rue des Écoles, 95500 Le Thillay, France.
- Téléphone : 06 76 49 25 28.
- Destinations desservies : Togo, Bénin, Sénégal, Abidjan en Côte d’Ivoire, Brazzaville et Pointe-Noire au Congo. Les tarifs et délais du Sénégal, d’Abidjan et du Congo sont uniquement sur devis pour le moment.
- Carton vide : 10 €, livré gratuitement en Île-de-France puis récupéré rempli.
Tu peux aussi qualifier une demande de devis, d'enlèvement, de rappel ou une autre demande.
RÈGLE ABSOLUE POUR UN DEVIS OU UN ENLÈVEMENT : accompagne le client étape par étape. Pose UNE SEULE question par message, attends sa réponse, mémorise-la, puis pose la question suivante. N'affiche jamais le questionnaire complet, aucune liste numérotée et jamais plusieurs questions dans la même réponse.
Ordre à suivre : nom complet ; téléphone ; e-mail facultatif ; destination ; aérien ou maritime ; description du colis ; poids ou dimensions ; choix entre enlèvement et dépôt ; si enlèvement, adresse de collecte puis date souhaitée ; enfin besoin éventuel d'un carton vide à 10 €. Si le client choisit le dépôt, rappelle seulement l'adresse 15 Rue des Écoles, 95500 Le Thillay et n'exige ni adresse de collecte ni date.
Lorsqu'un client clique ou écrit « demander un devis » ou « organiser un enlèvement », commence uniquement par : « Quel est votre nom complet ? ». Ne demande JAMAIS une heure de passage : elle est décidée ensuite par le bureau.
Quand les informations utiles sont présentes, résume-les et demande une confirmation explicite. Mets action à "submit" uniquement après que le client confirme clairement ce résumé ; sinon action vaut "chat". Ne transmets jamais sans confirmation.
Avant chaque réponse, vérifie mot pour mot les montants, destinations et délais dans cette liste. Si une information n'est pas dans cette liste, dis que l'équipe doit la confirmer et invite à appeler ou demander un devis. N'invente jamais de tarif, date ou condition. Ne prétends pas avoir suivi un colis et ne demande aucune donnée bancaire.`

const leadSchema={type:'object',additionalProperties:false,required:['answer','action','lead'],properties:{
  answer:{type:'string'},action:{type:'string',enum:['chat','submit']},lead:{type:'object',additionalProperties:false,required:['requestType','name','phone','email','destination','transport','parcelDescription','measurement','pickupAddress','desiredDate','needsCarton'],properties:{
    requestType:{type:['string','null'],enum:['devis','enlèvement','rappel','autre',null]},name:{type:['string','null']},phone:{type:['string','null']},email:{type:['string','null']},destination:{type:['string','null']},transport:{type:['string','null']},parcelDescription:{type:['string','null']},measurement:{type:['string','null']},pickupAddress:{type:['string','null']},desiredDate:{type:['string','null']},needsCarton:{type:['string','null']}
  }}
}}

export default defineEventHandler(async event => {
  const config = useRuntimeConfig(event)
  if (!config.openaiApiKey) throw createError({statusCode:503,statusMessage:'Le chat IA n’est pas encore configuré.'})

  const body = await readBody<{messages?: ChatMessage[]}>(event)
  const messages = (body.messages || []).slice(-10).filter(message =>
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' && message.content.trim().length > 0
  ).map(message => ({role:message.role,content:message.content.trim().slice(0,1500)}))
  if (!messages.length || messages.at(-1)?.role !== 'user') throw createError({statusCode:400,statusMessage:'Message invalide.'})

  try {
    const response:any = await $fetch('https://api.openai.com/v1/responses', {
      method:'POST',
      headers:{Authorization:`Bearer ${config.openaiApiKey}`},
      body:{model:config.openaiModel,instructions,input:messages,max_output_tokens:900,reasoning:{effort:'low'},text:{format:{type:'json_schema',name:'wefretafrica_chat',strict:true,schema:leadSchema}},store:false}
    })
    const answer = response.output_text || response.output?.flatMap((item:any) => item.content || []).find((part:any) => part.type === 'output_text')?.text
    if (!answer) throw new Error('Réponse OpenAI vide')
    const parsed=JSON.parse(answer)
    return {answer:parsed.answer,lead:parsed.action==='submit'?parsed.lead:null}
  } catch (error:any) {
    console.error('OpenAI chat error', error?.status || error?.message)
    throw createError({statusCode:502,statusMessage:'L’assistant est momentanément indisponible. Appelez-nous au 06 76 49 25 28.'})
  }
})
