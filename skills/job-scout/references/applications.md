# Local application tracker

Keep `applications.json` in a user-chosen private job-search directory, outside the public checkout. Read its current contents before every update and write atomically. Preserve existing record IDs, dates and evidence. Do not upload the tracker to a service or send it to a provider just to render a report.

Suggested shape:

```json
{
  "version": 1,
  "applications": [
    {
      "id": "user-approved-stable-id",
      "company": "Employer",
      "title": "Role",
      "url": "https://employer.example/careers/role-id",
      "requisitionId": "role-id",
      "stage": "saved",
      "savedAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "outcome": null,
      "notes": "User-confirmed next action",
      "runDirectory": "/absolute/path/to/saved-run",
      "resultId": "existing-result-id"
    }
  ]
}
```

Stages: `saved`, `preparing`, `applied`, `interviewing`, `offer`, `closed`. Applied means the user says they submitted it. Offer includes an accepted offer. Closed covers rejection, withdrawal, vacancy closure or a declined offer; preserve the particular user-stated outcome. A disappeared vacancy is not evidence that the candidate was rejected. Do not move stages from an inference or remove closed records.

Resolve ambiguous references against the tracker before editing. Use employer, vacancy ID, title and location for duplicate checks; URL equality alone is insufficient. Do not claim the update succeeded until the write is confirmed. Exclude already applied, interviewing, offer, closed or dismissed roles from new recommendations unless the user asks to reconsider or a material change is evidenced. An ordinary chat reply or a report top pick does not create an application record automatically.
