// Objectif : montrer qu’une décision incertaine est explicitement envoyée en revue humaine.
import assert from "node:assert/strict";
import { handoffPublicService } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "revue-1",
  "text": "Je conteste une décision reçue récemment, mais le message ne précise ni l’organisme ni la nature de la décision.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "clarification_required", probabilities: {
  "local_service": 0.096,
  "national_service": 0.096,
  "jurisdiction": 0.096,
  "independent_authority": 0.096,
  "clarification_required": 0.52,
  "no_handoff": 0.096
}, confidence: 0.62 } }, usage: { input_tokens: 140, output_tokens: 0 } }));
const résultat = await handoffPublicService(dossier, provider);
assert.equal(résultat.decision, "clarification_required");
assert.equal(résultat.review, true);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · revue humaine : ${résultat.review} · confiance : ${résultat.confidence}`);
