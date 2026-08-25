type Lead={requestType:string|null,name:string|null,phone:string|null,email:string|null,destination:string|null,transport:string|null,parcelDescription:string|null,measurement:string|null,pickupAddress:string|null,desiredDate:string|null,needsCarton:string|null}

export default defineEventHandler(async event=>{
  const config=useRuntimeConfig(event)
  const body=await readBody<{lead?:Lead}>(event)
  const lead=body.lead
  if(!lead?.name||!lead.phone||!lead.requestType) throw createError({statusCode:400,statusMessage:'Informations de contact incomplètes.'})
  const clean=(value:string|null,max=500)=>String(value||'Non renseigné').trim().slice(0,max)
  const description=[`Demande : ${clean(lead.requestType)}`,`Colis : ${clean(lead.parcelDescription,1200)}`,`Poids / volume : ${clean(lead.measurement)}`,`Adresse de collecte : ${clean(lead.pickupAddress,800)}`,`Date souhaitée : ${clean(lead.desiredDate)} (horaire à confirmer par le bureau)`,`Carton vide à 10 € : ${clean(lead.needsCarton)}`].join('\n')
  const results={firebase:false,airtable:false,sms:false}

  try{
    results.firebase=await saveFirebaseRequest(config,{
      source:'Chat IA',
      typeDemande:clean(lead.requestType),
      nom:clean(lead.name),
      telephone:clean(lead.phone),
      email:lead.email||'Non renseigné',
      destination:clean(lead.destination),
      transport:clean(lead.transport),
      descriptionColis:clean(lead.parcelDescription,1200),
      poidsVolume:clean(lead.measurement),
      adresseCollecte:clean(lead.pickupAddress,800),
      dateSouhaitee:clean(lead.desiredDate),
      cartonVide10Euros:clean(lead.needsCarton)
    })
  }catch(error:any){console.error('Firebase lead error',error?.code||error?.message)}

  if(config.airtableToken){
    try{
      await $fetch(`https://api.airtable.com/v0/${config.airtableBaseId}/${config.airtableQuotesTableId}`,{
        method:'POST',
        headers:{Authorization:`Bearer ${config.airtableToken}`},
        body:{typecast:true,fields:{Nom:clean(lead.name),Prenoms:'Demande via chat IA',Mail:lead.email||undefined,Telephone:clean(lead.phone),Destination:lead.destination||undefined,'Description du colis':description,Fret:lead.transport||undefined,'Estimation de produits':lead.measurement||undefined}}
      })
      results.airtable=true
    }catch(error:any){console.error('Airtable lead error',error?.status||error?.message)}
  }

  if(config.twilioAccountSid&&config.twilioAuthToken&&config.twilioFromNumber){
    try{
      const sms=new URLSearchParams({To:config.notificationPhone,From:config.twilioFromNumber,Body:`WefretAfrica — nouvelle demande ${clean(lead.requestType)}\n${clean(lead.name)} · ${clean(lead.phone)}\nDestination : ${clean(lead.destination)}\nFret : ${clean(lead.transport)}\nDate souhaitée : ${clean(lead.desiredDate)}\nConsultez Firebase pour les détails.`})
      await $fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:sms.toString()})
      results.sms=true
    }catch(error:any){console.error('Twilio SMS error',error?.status||error?.message)}
  }

  if(!results.firebase&&!results.airtable&&!results.sms) throw createError({statusCode:503,statusMessage:'La transmission n’est pas encore configurée. Appelez-nous au 06 76 49 25 28.'})
  return {success:true,results}
})
