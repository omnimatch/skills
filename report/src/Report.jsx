import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const pct = (n) =>
  n === null || !Number.isFinite(n) ? 'Unknown' : `${Math.round(n * 100)}`;
const date = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Not recorded';
const safeUrl = (value) => {
  try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) &&
      !u.username &&
      !u.password
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
};
const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Source';
  }
};
const part = (item, criterion) => item.assessment?.scores?.[criterion.id];
function Icon({ name }) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14m-6-6 6 6-6 6" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6m0-6L10 14M9 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" />
      </>
    ),
    print: (
      <>
        <path d="M7 7V3h10v4M7 17H4V8h16v9h-3M7 14h10v7H7z" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
function Radar({ collection, items, active }) {
  const axes = collection.criteria;
  const point = (i, score = 1, radius = 108) => {
    const angle = (i * Math.PI * 2) / axes.length - Math.PI / 2;
    return [
      220 + Math.cos(angle) * radius * score,
      177 + Math.sin(angle) * radius * score,
    ];
  };
  const shape = (item) =>
    axes.map((c, i) =>
      part(item, c)?.supported ? point(i, part(item, c).score) : null,
    );
  const activePoints = active ? shape(active) : [];
  const label = (c) =>
    c.label.length > 23 ? `${c.label.slice(0, 21)}…` : c.label;
  return (
    <svg
      className="radar"
      viewBox="0 0 440 355"
      role="img"
      aria-label={`${active?.title || collection.title}: fit by criterion. Unknown scores have gaps. Exact values follow below.`}
    >
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="var(--accent)" stopOpacity=".30" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity=".03" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((n) => (
        <polygon
          key={n}
          points={axes.map((_, i) => point(i, n).join(',')).join(' ')}
          fill="none"
          stroke="var(--grid)"
          strokeWidth="1"
        />
      ))}
      {axes.map((c, i) => {
        const [x, y] = point(i),
          [tx, ty] = point(i, 1.31);
        const words = label(c).split(' '),
          half = Math.ceil(words.length / 2),
          lines =
            words.length > 2
              ? [words.slice(0, half).join(' '), words.slice(half).join(' ')]
              : [label(c)];
        return (
          <g key={c.id}>
            <line x1="220" y1="177" x2={x} y2={y} stroke="var(--grid)" />
            <text
              x={tx}
              y={ty - (lines.length - 1) * 9}
              textAnchor={tx > 240 ? 'start' : tx < 200 ? 'end' : 'middle'}
              dominantBaseline="middle"
              className="axis-label"
            >
              <title>{c.label}</title>
              {lines.map((line, j) => (
                <tspan key={line} x={tx} dy={j ? 18 : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
      <g className="radar-population">
        {items
          .filter((i) => i.assessment?.subject !== 'excluded')
          .slice(0, 80)
          .map((item) => {
            const points = shape(item);
            return (
              <g key={item.id}>
                {points.map((p, i) =>
                  p && points[(i + 1) % axes.length] ? (
                    <line
                      key={axes[i].id}
                      x1={p[0]}
                      y1={p[1]}
                      x2={points[(i + 1) % axes.length][0]}
                      y2={points[(i + 1) % axes.length][1]}
                      stroke="var(--accent)"
                      strokeOpacity=".10"
                    />
                  ) : null,
                )}
              </g>
            );
          })}
      </g>
      {active && (
        <g className="radar-selection" key={active.id}>
          {activePoints.every(Boolean) && (
            <polygon
              points={activePoints.map((p) => p.join(',')).join(' ')}
              fill="url(#radar-fill)"
            />
          )}
          {activePoints.map((p, i) => {
            const next = activePoints[(i + 1) % axes.length];
            return p ? (
              <g key={axes[i].id}>
                {next && (
                  <line
                    x1={p[0]}
                    y1={p[1]}
                    x2={next[0]}
                    y2={next[1]}
                    stroke="var(--accent)"
                    strokeWidth="2.4"
                  />
                )}
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r="3.8"
                  fill="var(--accent)"
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
              </g>
            ) : null;
          })}
        </g>
      )}
      <circle cx="220" cy="177" r="2" fill="var(--muted)" />
    </svg>
  );
}
function exportCsv(collection, items) {
  const escapeCell = (value) => {
    let s = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replaceAll('"', '""')}"`;
  };
  const rows = [
    [
      'Name',
      'URL',
      'Fit score (0–100)',
      'Evidence coverage (%)',
      'Scope',
      ...collection.criteria.map((c) => c.label),
    ],
    ...items.map((i) => [
      i.title,
      safeUrl(i.url) || '',
      i.summary.score === null ? '' : pct(i.summary.score),
      pct(i.summary.coverage),
      i.assessment?.subject || 'unassessed',
      ...collection.criteria.map((c) =>
        part(i, c)?.supported ? pct(part(i, c).score) : '',
      ),
    ]),
  ];
  const url = URL.createObjectURL(
    new Blob([rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')], {
      type: 'text/csv;charset=utf-8',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `rainmaker-${collection.id}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Report({ data }) {
  const [lane, setLane] = useState(data.collections[0]?.id);
  const [selected, setSelected] = useState(null);
  const [destination, setDestination] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('fit');
  const [pageSize, setPageSize] = useState(50);
  const collection =
    data.collections.find((c) => c.id === lane) || data.collections[0];
  const laneNotes = data.notes?.collections?.find((c) => c.id === lane);
  const all = collection?.items || [];
  const items = useMemo(
    () =>
      all
        .filter((i) => {
          const searchable =
            `${i.title} ${i.url} ${i.evidence.map((e) => e.text).join(' ')}`.toLowerCase();
          const state = i.assessment?.subject;
          return (
            searchable.includes(query.toLowerCase()) &&
            (filter === 'all'
              ? state !== 'excluded'
              : filter === 'excluded'
                ? state === 'excluded'
                : filter === 'supported'
                  ? state === 'eligible' && i.summary.coverage === 1
                  : state !== 'excluded' &&
                    (!i.assessment ||
                      i.summary.coverage < 1 ||
                      state === 'uncertain'))
          );
        })
        .sort((a, b) =>
          sort === 'name'
            ? a.title.localeCompare(b.title)
            : b.summary.rank - a.summary.rank || a.title.localeCompare(b.title),
        ),
    [all, query, filter, sort],
  );
  const active = items.find((i) => i.id === selected) || items[0] || null;
  const assessed = all.filter((i) => i.assessment).length;
  const radarPopulation = all.filter(
    (i) => i.assessment && i.assessment.subject !== 'excluded',
  );
  const searches = data.searches.filter((s) => s.collectionId === lane);
  const excluded = all.filter(
    (i) => i.assessment?.subject === 'excluded',
  ).length;
  // biome-ignore lint/correctness/useExhaustiveDependencies: A changed facet resets incremental result pagination.
  useEffect(() => {
    setPageSize(50);
  }, [lane, query, filter, sort]);
  useEffect(() => {
    document.title = `${data.title} · Rainmaker`;
  }, [data.title]);
  useEffect(() => {
    if (!destination || destination !== active?.id) return;
    const heading = document.getElementById('selected-assessment');
    if (heading) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
    }
    setDestination(null);
  }, [destination, active?.id]);
  if (!collection)
    return (
      <main>
        <h1>No research collections</h1>
        <p>This report contains no saved collections.</p>
      </main>
    );
  return (
    <div className="report-shell">
      <header className="masthead">
        <a
          href="https://omnimatch.ai"
          target="_blank"
          rel="noreferrer"
          className="brand"
        >
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span>
            Rainmaker<span className="byline">by Omnimatch</span>
          </span>
        </a>
        <div className="report-actions">
          <span
            className={`status ${data.status === 'completed' ? '' : 'partial'}`}
          >
            <span />
            {data.status === 'completed'
              ? 'Research complete'
              : 'Partial research'}
          </span>
          <button type="button" onClick={() => window.print()}>
            <Icon name="print" />
            Print
          </button>
        </div>
      </header>
      {data.demo && (
        <p className="demo-notice">
          Interactive demonstration. All companies, people and events are
          fictional. No API calls were made.
        </p>
      )}
      <section className="report-intro">
        <div>
          <h1>{data.title}</h1>
          <p className="brief">{data.brief}</p>
        </div>
        <dl className="report-meta">
          <div>
            <dt>Territory</dt>
            <dd>{data.territory}</dd>
          </div>
          <div>
            <dt>Researched</dt>
            <dd>{date(data.finishedAt || data.createdAt)}</dd>
          </div>
        </dl>
      </section>
      {data.pauseReason && (
        <p className="pause-notice" role="status">
          {data.pauseReason}
        </p>
      )}
      <nav className="collections" aria-label="Research collections">
        {data.collections.map((c) => (
          <button
            type="button"
            key={c.id}
            aria-pressed={c.id === lane}
            onClick={() => {
              setLane(c.id);
              setSelected(null);
              setQuery('');
              setFilter('all');
            }}
          >
            {c.title}
            <span>
              {
                c.items.filter((i) => i.assessment?.subject !== 'excluded')
                  .length
              }
            </span>
          </button>
        ))}
      </nav>
      <div className="research-toolbar">
        <label className="search-field">
          <Icon name="search" />
          <span className="sr-only">Search research</span>
          <input
            type="search"
            placeholder={`Search ${collection.title.toLowerCase()} and evidence`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter results</span>
          <select
            aria-label="Filter results"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All in scope</option>
            <option value="supported">Fully evidenced</option>
            <option value="uncertain">Needs evidence</option>
            <option value="excluded">Outside scope ({excluded})</option>
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Sort results</span>
          <select
            aria-label="Sort results"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="fit">Fit × coverage</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <button type="button" onClick={() => exportCsv(collection, items)}>
          <Icon name="download" />
          CSV
        </button>
      </div>
      {laneNotes?.summary && (
        <p className="collection-summary">{laneNotes.summary}</p>
      )}
      <section
        className="research-layout"
        aria-label={`${collection.title} research`}
      >
        <div className="plot-column">
          <div className="plot-heading">
            <h2>How they compare</h2>
            <span>
              {assessed} assessed · {all.length} collected
            </span>
          </div>
          <Radar
            collection={collection}
            items={radarPopulation}
            active={active}
          />
          <div className="plot-legend">
            <span>
              <i />
              Selected result
            </span>
            <span>
              <i />
              {radarPopulation.length > 80
                ? `80 of ${radarPopulation.length} assessed results plotted`
                : 'Research population'}
            </span>
            <span>Unknown scores have gaps</span>
          </div>
          {active ? (
            <article className="selected-detail" aria-label="Selected result">
              <div className="detail-heading">
                <div>
                  <p className="source-domain">{host(active.url)}</p>
                  <h2 id="selected-assessment" tabIndex={-1}>
                    {active.title}
                  </h2>
                </div>
                <a
                  className="source-action"
                  href={safeUrl(active.url)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open source for ${active.title}`}
                >
                  <Icon name="external" />
                </a>
              </div>
              <div className="score-summary">
                <span>
                  <strong>{pct(active.summary.score)}</strong> / 100 fit
                </span>
                <span>{pct(active.summary.coverage)}% evidence coverage</span>
              </div>
              {active.evaluationError && (
                <p className="evidence-note">{active.evaluationError}</p>
              )}
              {active.assessment?.subject === 'uncertain' && (
                <p className="evidence-note">
                  The subject or a mandatory scope fact needs verification.
                </p>
              )}
              {data.notes?.results?.find((r) => r.id === active.id)?.note && (
                <p className="result-note">
                  {data.notes.results.find((r) => r.id === active.id).note}
                </p>
              )}
              <table className="criterion-table">
                <caption className="sr-only">
                  Saved criterion scores for {active.title}
                </caption>
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Fit / 100</th>
                  </tr>
                </thead>
                <tbody>
                  {collection.criteria.map((c) => (
                    <tr key={c.id}>
                      <th scope="row">
                        {c.label}
                        {c.required && (
                          <span className="required-mark">Required</span>
                        )}
                      </th>
                      <td>
                        {part(active, c)?.supported ? (
                          pct(part(active, c).score)
                        ) : (
                          <span className="unknown">Unknown</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {active.summary.requirements.some((r) => r.status !== 'met') && (
                <p className="evidence-note">
                  {active.summary.requirements
                    .filter((r) => r.status !== 'met')
                    .map((r) => `${r.label}: ${r.status}`)
                    .join(' · ')}
                </p>
              )}
              <p className="score-caption">
                Fit reflects the known criteria. Evidence coverage shows how
                much of the rubric is supported. Neither is a probability of a
                sale.
              </p>
              <details className="evidence-panel">
                <summary>
                  Read saved evidence{' '}
                  <span>
                    {active.evidence.length}{' '}
                    {active.evidence.length === 1 ? 'source' : 'sources'}
                  </span>
                </summary>
                <div className="evidence-scroll">
                  {active.evidence.map((e) => (
                    <section key={e.url + e.text}>
                      <a href={safeUrl(e.url)} target="_blank" rel="noreferrer">
                        {host(e.url)} <Icon name="external" />
                      </a>
                      <p className="evidence-date">
                        Retrieved {date(e.retrievedAt)}
                        {e.publishedAt
                          ? ` · Published ${date(e.publishedAt)}`
                          : ''}
                      </p>
                      <p className="evidence-text">
                        {e.text || 'No source text was returned.'}
                      </p>
                      {e.truncated && (
                        <p className="evidence-note">
                          Saved text is an excerpt. Open the source for the
                          complete page.
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              </details>
            </article>
          ) : (
            <div className="empty-state">
              <h2>
                {all.length ? 'No matching results' : 'No results collected'}
              </h2>
              <p>
                {all.length
                  ? 'Change the search or filter to explore the saved collection.'
                  : 'The research did not return usable sources for this collection.'}
              </p>
            </div>
          )}
        </div>
        <div className="results-column">
          <div className="results-heading">
            <h2>{collection.title}</h2>
            <span aria-live="polite">
              {items.length} {collection.unit}
            </span>
          </div>
          <section
            className="result-list"
            aria-label={`${collection.title} results`}
          >
            {items.slice(0, pageSize).map((item, index) => (
              <button
                type="button"
                key={item.id}
                className="result-row"
                aria-pressed={item.id === active?.id}
                onClick={() => {
                  setSelected(item.id);
                  if (window.matchMedia('(max-width: 700px)').matches)
                    setDestination(item.id);
                }}
              >
                <span className="result-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="result-copy">
                  <strong>{item.title}</strong>
                  <span>{host(item.url)}</span>
                  <small>
                    {laneNotes?.topPickIds?.includes(item.id)
                      ? 'Top pick · '
                      : ''}
                    {item.summary.coverage < 1
                      ? `${pct(item.summary.coverage)}% evidence coverage`
                      : 'Full rubric coverage'}
                    {item.assessment?.subject === 'uncertain'
                      ? ' · Scope unverified'
                      : ''}
                  </small>
                </span>
                <span className="result-score">
                  {item.summary.score === null ? (
                    <span className="unknown">—</span>
                  ) : (
                    pct(item.summary.score)
                  )}
                  <small>fit</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
            {items.length > pageSize && (
              <button
                type="button"
                className="load-more"
                onClick={() => setPageSize((n) => n + 50)}
              >
                Show 50 more
              </button>
            )}
            {!items.length && (
              <p className="list-empty">No results match this view.</p>
            )}
          </section>
          <p className="list-footnote">
            Ordered by fit × evidence coverage. Each result links to its saved
            assessment.
          </p>
        </div>
      </section>
      {data.notes?.approach && (
        <section className="recommended-approach">
          <h2>Recommended approach</h2>
          <p>{data.notes.approach}</p>
          <div>
            {data.notes.references.map((id) => {
              const item = data.collections
                .flatMap((c) => c.items)
                .find((i) => i.id === id);
              return item ? (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setLane(
                      data.collections.find((c) =>
                        c.items.some((i) => i.id === id),
                      ).id,
                    );
                    setSelected(id);
                    setDestination(id);
                    setQuery('');
                    setFilter(
                      item.assessment?.subject === 'excluded'
                        ? 'excluded'
                        : 'all',
                    );
                  }}
                >
                  {item.title}
                  <Icon name="arrow" />
                </button>
              ) : null;
            })}
          </div>
        </section>
      )}
      <details className="research-log">
        <summary>
          Research plan and coverage{' '}
          <span>{data.searches.length} searches completed</span>
        </summary>
        <div className="log-content">
          <h3>The brief</h3>
          <p>{data.offer}</p>
          {data.exclusions.length > 0 && (
            <p>Explicit exclusions: {data.exclusions.join('; ')}</p>
          )}
          <h3>Search coverage</h3>
          <p>
            {searches.length} of {collection.plannedSearches} planned searches
            completed for this collection. Counts refer to {collection.unit}.
            Returned pages do not establish complete market coverage.
          </p>
          <ul>
            {searches.map((s) => (
              <li key={s.query}>
                <span>{s.query}</span>
                <span>
                  {s.returned} returned
                  {s.atCapacity ? ' · provider result limit reached' : ''}
                </span>
              </li>
            ))}
          </ul>
          <h3>Assessment rubric</h3>
          <ul>
            {collection.criteria.map((c) => (
              <li key={c.id}>
                <span>
                  <strong>{c.label}</strong> · weight {c.weight}
                  {c.required ? ' · required' : ''}
                  <br />
                  {c.question}
                </span>
                <span>{c.levels.join(' → ')}</span>
              </li>
            ))}
          </ul>
          <h3>Method</h3>
          <p>
            Searches collect source text through Exa. Exact canonical URLs are
            deduplicated within each collection; distinct pages about one entity
            may remain separate. Assessments use{' '}
            {data.provider === 'fixture'
              ? 'fictional demonstration scores'
              : `${data.provider} (${data.model})`}
            . Unknown facts are preserved. Different providers' probabilities
            are not assumed to be calibrated alike.
          </p>
          <p>
            {data.duplicates} repeated URLs merged. Local cost accounting: $
            {Number(data.accountedUsd).toFixed(2)} of $
            {Number(data.budgetUsd).toFixed(2)} reserved ceiling. These are
            conservative request estimates, not an invoice.
          </p>
        </div>
      </details>
      <footer>
        <a href="https://omnimatch.ai" target="_blank" rel="noreferrer">
          Made with Rainmaker by Omnimatch <Icon name="external" />
        </a>
        <span>
          Your research stays in this file. No analytics or network requests.
        </span>
      </footer>
    </div>
  );
}
try {
  const data = JSON.parse(
    document.getElementById('rainmaker-data').textContent,
  );
  if (data?.version !== 1 || !Array.isArray(data.collections))
    throw new Error('No valid research data was supplied.');
  createRoot(document.getElementById('rainmaker-root')).render(
    <Report data={data} />,
  );
} catch {
  document.getElementById('rainmaker-root').textContent =
    'This report could not be opened. Regenerate it from the saved run with Rainmaker’s report command.';
}
