# Plan and output contract

## Plan

`example-plan.json` is a complete editable example. Run `example --out plan.json` to copy it. Author the plan for the actual user; do not run the example as if it were their request.

Top-level fields: `version: 1`, `title`, `brief`, `offer`, `territory`, `exclusions: string[]`, and `collections` (one to six).

Each collection has a unique lowercase `id`, `kind` (`companies`, `people`, `events`, `news`, `jobs` or `places`), `title`, `unit`, `criteria`, and `searches`. Do not combine different entity types in one ranked collection. The unit must match what the source returns: profile pages, company pages, news articles, vacancy pages, venue/activity sources or event listing pages. Event discovery alone does not establish individual attendance or occurrence dates.

Each criterion has `id`, `label`, `question`, `weight` (above zero, at most ten), optional `required` boolean, and `levels`: two to five descriptions ordered from weakest to strongest fit. A collection needs three to eight nonredundant criteria for its radar. Do not invent dimensions just to reach eight. Keep uncertainty separate from levels. A required criterion is reported as met at a supported score of at least 0.75, not met below that, and unverified without supporting evidence.

Each search has `query`, `numResults` (1–100; defaults to 25), and optional `since` (ISO timestamp). At most twenty searches per collection and sixty per plan. Exa's company and people categories do not accept publication-date filters, so do not supply `since` for them. The runner uses the company/people/news categories as appropriate and ordinary web discovery for event, job and place sources. A publication-date filter does not verify an event's occurrence date or a vacancy's open status.

All searches finish before evaluation. Each result retains source text (up to 12,000 characters per returned page), query provenance and retrieval/publication dates where available. Exact canonical URLs merge within a collection; tracking parameters are removed while identity-bearing query parameters remain. This is not entity resolution across unrelated URLs. Parent and subsidiary records are not automatically merged.

The evaluator answers a subject-scope question and two questions per criterion: a fit score and whether evidence supports scoring it. Unsupported scores stay null. Report fit is the weighted mean over supported criteria. Evidence coverage is the fraction of criterion weight with evidence. Sorting uses fit × coverage. Excluded records remain inspectable behind the Outside scope filter. Low fit and missing evidence do not silently remove a result.

The runner saves `run.json` after every paid request and state change. A directory belongs to one frozen plan and evaluator. Do not modify those fields to resume a different request. A broader follow-up is a new plan and directory; focused follow-ups read saved evidence with `results`.

## Written findings

Optionally write a separate notes JSON after inspecting saved evidence:

```json
{
  "collections": [
    {
      "id": "jobs",
      "summary": "A short interpretation supported by this collection's evidence.",
      "topPickIds": ["existing-item-id"]
    }
  ],
  "results": [
    { "id": "existing-item-id", "note": "Why this result matters, based on saved evidence." }
  ],
  "approach": "A concise recommended next step.",
  "references": ["existing-item-id"]
}
```

Top picks reference at most six existing non-excluded results within their own collection. Usually select three; fewer when the evidence supports fewer. They do not change scores or replace the full collection. Each written approach needs result references. The host is responsible for whether statements follow from the cited evidence; identifier validation cannot prove factual accuracy.

Generate the report with `report --run DIRECTORY --notes /absolute/notes.json`. Notes are saved to that directory for offline regeneration. Use collection IDs from the actual run and existing result IDs, replacing the example placeholders. Do not add new subjects or unsupported facts through notes.

## Report and follow-up

The report embeds the saved data, React, styles and interaction code in one HTML file. It makes no API requests. Filtering, searching, result selection, evidence browsing, CSV export and printing operate locally. Scripts and credentials are not required by a report recipient. Links open the original sources. CSV exports the currently filtered collection and escapes spreadsheet formula prefixes.

The checkpoint retains the full evidence. The report shows all saved results, incrementally adding fifty at a time inside its scrollable list. Evidence has its own bounded reading area. A partial run remains partial in the report; the report never invents progress or replays it as if research were live.
