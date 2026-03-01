The write requires your approval since CLAUDE.md exists and would be overwritten. Here's a summary of what I found and what the new file contains:

**Key improvements over the existing auto-generated CLAUDE.md:**

1. **Two distinct event structures documented** — the existing file never mentions that product/search events use `eventId`/`payload` (not `correlationId`/`data`). This is a critical gotcha for anyone adding new event types.

2. **Concrete schema tables** — exact `data` fields for every event type in scannable table form, not just names.

3. **Factory function signatures** — shows what parameters each factory takes and that `createProductCreatedEvent` only takes `payload`, not the full event shape.

4. **Commands section** — the existing file has none. Includes the important note that `prepare` auto-runs `build` on `npm install`.

5. **Coverage requirement** — 80% threshold is enforced by Jest config, relevant to know when adding tests.

6. **Validation rules table** — the Zod rules applied to each field category.

7. **`validateEvent` vs factory function guidance** — explicitly says use `validateEvent` in consumers, factories in producers.

8. **Added Analytics Service and Search Indexer Worker** to the connections (they were missing from the existing file).

Would you like me to write this file?