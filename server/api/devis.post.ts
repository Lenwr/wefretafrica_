export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body.website) return {ok:true}
  const required=['name','email','phone','destination','transport','parcelType','message']
  if(required.some(field=>!String(body[field]||'').trim())) throw createError({statusCode:400,statusMessage:'Merci de remplir tous les champs obligatoires.'})
  const config=useRuntimeConfig(event)
  const clean=(value:unknown)=>String(value||'').replace(/[<>]/g,'')

  if (!config.firebaseClientEmail && !config.airtableToken && !config.resendApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Le service de réception des devis doit encore être configuré par l’administrateur.'
    })
  }

  const details = [
    `Type de colis : ${clean(body.parcelType)}`,
    `Enlèvement souhaité : ${clean(body.pickup) || 'Non renseigné'}`,
    `Ville de collecte : ${clean(body.city) || 'Non renseignée'}`,
    '',
    `Message : ${clean(body.message)}`
  ].join('\n')

  let airtableSaved = false
  let firebaseSaved = false
  let emailSent = false

  try {
    firebaseSaved = await saveFirebaseRequest(config, {
      source: 'Formulaire site',
      typeDemande: 'Devis',
      nom: clean(body.name),
      email: clean(body.email),
      telephone: clean(body.phone),
      destination: clean(body.destination),
      transport: clean(body.transport),
      typeColis: clean(body.parcelType),
      poidsVolume: clean(body.measurement) || 'Non renseigné',
      enlevement: clean(body.pickup) || 'Non renseigné',
      villeCollecte: clean(body.city) || 'Non renseignée',
      message: clean(body.message)
    })
  } catch (error) {
    console.error('Firebase a refusé le devis :', error)
  }

  if (config.airtableToken) {
    const airtableResponse = await fetch(
      `https://api.airtable.com/v0/${config.airtableBaseId}/${config.airtableQuotesTableId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.airtableToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          typecast: true,
          fields: {
            fldHzNhLGwH7ntTUn: clean(body.name),
            fldA30vP8uubB5eN2: 'Formulaire site',
            fldhv6Tr3RSC8Okd4: clean(body.email),
            fldrgWiLhDekCLECf: clean(body.phone),
            fldJy1tJGG62m2xyy: clean(body.destination),
            fldXNy6QuQf9b9VT7: details,
            fldmu6iCkJLeIL0m4: clean(body.transport),
            fld3IJN7NzH9jFj4S: clean(body.measurement) || 'Non renseigné'
          }
        })
      }
    )

    airtableSaved = airtableResponse.ok
    if (!airtableSaved) {
      console.error('Airtable a refusé le devis :', airtableResponse.status, await airtableResponse.text())
    }
  }

  if (config.resendApiKey) {
    const emailResponse=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.resendApiKey}`,'Content-Type':'application/json'},body:JSON.stringify({
      from:config.quoteFromEmail,
      to:[config.quoteToEmail],
      reply_to:clean(body.email),
      subject:`Nouveau devis ${clean(body.destination)} — ${clean(body.name)}`,
      text:[`Nom : ${clean(body.name)}`,`E-mail : ${clean(body.email)}`,`Téléphone : ${clean(body.phone)}`,`Destination : ${clean(body.destination)}`,`Transport : ${clean(body.transport)}`,`Type : ${clean(body.parcelType)}`,`Poids / volume : ${clean(body.measurement)}`,`Enlèvement : ${clean(body.pickup)}`,`Ville : ${clean(body.city)}`,'',`Message : ${clean(body.message)}`].join('\n')
    })})
    emailSent = emailResponse.ok
    if (!emailSent) console.error('Resend a refusé le devis :', emailResponse.status, await emailResponse.text())
  }

  if (!firebaseSaved && !airtableSaved && !emailSent) {
    throw createError({
      statusCode: 502,
      statusMessage: 'La demande n’a pas pu être enregistrée. Vérifiez la configuration Firebase.'
    })
  }

  return {ok:true, firebaseSaved, airtableSaved, emailSent}
})
