// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { publicRequest, handoffPublicService } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "requestStatus": "withdrawn"
};
const casPrincipal = {
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
const casÀRevoir = {
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
test("exige une source", () => assert.throws(() => publicRequest({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await handoffPublicService(casLimite, provider)).decision, "no_handoff");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "local_service", probabilities: {
  "local_service": 0.82,
  "national_service": 0.036,
  "jurisdiction": 0.036,
  "independent_authority": 0.036,
  "clarification_required": 0.036,
  "no_handoff": 0.036
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await handoffPublicService(casPrincipal, provider);
  assert.equal(résultat.decision, "local_service");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "clarification_required", probabilities: {
  "local_service": 0.096,
  "national_service": 0.096,
  "jurisdiction": 0.096,
  "independent_authority": 0.096,
  "clarification_required": 0.52,
  "no_handoff": 0.096
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await handoffPublicService(casÀRevoir, provider);
  assert.equal(résultat.decision, "clarification_required");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
