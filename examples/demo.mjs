// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { handoffPublicService } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
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
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "local_service", probabilities: {
  "local_service": 0.82,
  "national_service": 0.036,
  "jurisdiction": 0.036,
  "independent_authority": 0.036,
  "clarification_required": 0.036,
  "no_handoff": 0.036
}, confidence: 0.82 } }, usage: { input_tokens: 120, output_tokens: 0 } }));
const résultat = await handoffPublicService(dossier, provider);
assert.equal(résultat.decision, "local_service");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
