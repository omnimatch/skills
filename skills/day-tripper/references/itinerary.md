# Itinerary notes

Use `report --run DIRECTORY --notes /absolute/notes.json` after reading the saved collection. The ordinary collection/result notes and `approach` fields remain available. Add an `itinerary` object when a dated plan is useful:

```json
{
  "itinerary": {
    "date": "Saturday 24 October 2026",
    "timezone": "Europe/London",
    "stops": [
      {
        "id": "existing-result-id",
        "time": "10:30–12:00",
        "note": "A source-grounded stop, booking detail and realistic travel allowance.",
        "coordinates": {
          "lat": 51.5,
          "lon": -0.13,
          "sourceUrl": "https://venue.example/visitor-information"
        }
      }
    ],
    "indoorSwap": "An evidenced indoor replacement near the outdoor stop.",
    "nextAction": "The single useful booking or departure action."
  }
}
```

The example numbers and URLs are placeholders, not a suggested real stop. Use one to five distinct saved results, in visiting order. Every stop references an existing in-scope item. Time and note are plain text, with source dates, bookings and costs verified by the host from the saved evidence and current official pages. Do not imply ticket availability from a published price alone.

Coordinates are optional. When present, latitude/longitude must be valid numbers and `sourceUrl` must be one of that stop's saved evidence URLs. The source must actually establish those coordinates; validator provenance checks cannot prove that the value follows from the page. Use a source which supplies coordinates or the venue's official linked map, never guess them from a place name. If no supported coordinates are available, omit them. The report numbers known positions and discloses how many stops are located. It needs at least two located stops to draw the sketch.

The route sketch plots point order with straight schematic legs. It provides no basemap, live routing, journey-time calculation or traffic data. Verify actual walking/transit legs separately with current public transport or mapping sources. A sketch does not establish that a path is walkable.

Generate a new plan for materially different discovery scope; do not edit a frozen checkpoint to pretend new evidence or a different date was researched. Follow-ups can revise notes from supported saved evidence without another evaluator call. Recheck time-sensitive details when the user changes the travel date.
