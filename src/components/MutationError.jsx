// Shared inline error banner for admin CRUD mutations. Backend failures
// (e.g. the DEF-12 503 outage) previously produced no visible feedback at
// all here — the UI silently stayed on "No ... found/yet" or did nothing on
// Save, indistinguishable from "there is no data". Pass whichever mutation
// errors are relevant on a given page.
export default function MutationError({ errors }) {
  // The generated ApiClient (src/lib/api-client) reshapes axios errors to
  // `{ response: { status, body, header } }` — body, not axios's usual
  // `data` — so that's the shape to read the server's message from here.
  // NestJS's ValidationPipe also returns `message` as an array of per-field
  // strings rather than a single string, so normalize that too.
  const raw = errors.map((e) => e?.response?.body?.message ?? e?.message).find(Boolean);
  const message = Array.isArray(raw) ? raw.join('; ') : raw;
  if (!message) return null;
  return (
    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}
