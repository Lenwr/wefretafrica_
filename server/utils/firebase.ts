import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

export const saveFirebaseRequest = async (
  config: ReturnType<typeof useRuntimeConfig>,
  data: Record<string, unknown>
) => {
  if (!config.firebaseClientEmail || !config.firebasePrivateKey) return false

  const app = getApps()[0] || initializeApp({
    credential: cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey: config.firebasePrivateKey.replace(/\\n/g, '\n')
    })
  })

  await getFirestore(app).collection('demandes_devis').add({
    ...data,
    statut: 'Nouveau',
    creeLe: FieldValue.serverTimestamp()
  })
  return true
}
