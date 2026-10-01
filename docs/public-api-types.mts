// Objectif : vérifier que les types publics sont importables.
import { publicRequest, handoffPublicService } from "../src/index.mjs";
const dossier = publicRequest({
  "id": "exemple-1",
  "text": "Je veux obtenir un acte de naissance dans la commune où je suis né.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
});
void handoffPublicService(dossier, { decide: async () => ({}) });
