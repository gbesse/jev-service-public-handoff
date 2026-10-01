// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "local_service": "service_local",
  "national_service": "service_national",
  "jurisdiction": "juridiction",
  "independent_authority": "autorité_indépendante",
  "clarification_required": "précision_requise",
  "no_handoff": "aucune_orientation"
});
const CRITERIA = Object.freeze({
  "local_service": "service local",
  "national_service": "service national",
  "jurisdiction": "juridiction",
  "independent_authority": "autorité indépendante",
  "clarification_required": "précision requise",
  "no_handoff": "aucune orientation"
});
export function publicRequest(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function handoffPublicService(input, provider) {
  const record = publicRequest(input);
  if (record.requestStatus === "withdrawn") return { decision: "no_handoff", label: DECISIONS["no_handoff"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce demande citoyenne à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-service-public-handoff <dossier.json>");
  const dossier = publicRequest(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à handoffPublicService avec un fournisseur Jev configuré." }, null, 2));
}
