# WefretAfrica

Site Nuxt 4 de WefretAfrica : fret aérien et maritime entre la France et l’Afrique, calculateur, blog, demandes de devis et assistant conversationnel.

## Développement

```bash
npm install
npm run dev
```

## Production

Le projet doit être déployé en mode serveur Node afin que les API Nuxt restent actives.

Variables privées à configurer chez l’hébergeur :

```env
NUXT_OPENAI_API_KEY=
NUXT_OPENAI_MODEL=gpt-5-mini
NUXT_FIREBASE_PROJECT_ID=wefretafrica-14c7d
NUXT_FIREBASE_CLIENT_EMAIL=
NUXT_FIREBASE_PRIVATE_KEY=
NUXT_TWILIO_ACCOUNT_SID=
NUXT_TWILIO_AUTH_TOKEN=
NUXT_TWILIO_FROM_NUMBER=
NUXT_NOTIFICATION_PHONE=
```

Ne jamais publier le fichier `.env` ni la clé privée Firebase.

## Vérification

```bash
npm run build
```

Les demandes du formulaire et du chat IA sont enregistrées dans la collection Firestore `demandes_devis`.
