export default async function globalSetup() {
  const base = process.env.SWIFTBITE_E2E_BASE_URL;
  const api = process.env.SWIFTBITE_E2E_API_URL;
  if (!base || !api) throw new Error("The isolated QA URLs are missing.");
  const [webResponse, apiResponse] = await Promise.all([
    fetch(base),
    fetch(`${api.replace(/\/$/, "")}/restaurants`),
  ]);
  if (!webResponse.ok) throw new Error(`Isolated frontend readiness check returned ${webResponse.status}.`);
  if (!apiResponse.ok) throw new Error(`Isolated API readiness check returned ${apiResponse.status}.`);
}
