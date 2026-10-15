---
name: Prospector
description: Evidence-led research on a dark navy canvas with a lilac comparison radar.
colors:
  background: "#0d1020"
  surface: "#15192b"
  raised: "#1d2239"
  foreground: "#f4f2ec"
  muted: "#b0aec3"
  accent: "#c3afff"
  accent-soft: "#29223f"
  border: "#30354c"
  grid: "#343a52"
  success: "#8ee4bd"
  warning: "#f5ca87"
typography:
  display:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(2rem, 3.5vw, 3.1rem)"
    fontWeight: 550
    lineHeight: 1.13
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "17px"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  detail-title:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "23px"
    fontWeight: 550
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.55
  evidence:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: '"Space Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "11px"
    fontWeight: 400
rounded:
  control: "7px"
  route: "12px"
  container: "13px"
  circle: "50%"
spacing:
  compact: "8px"
  control: "12px"
  inset: "20px"
  section: "24px"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  button-ghost-hover:
    backgroundColor: "{colors.raised}"
  collection-tab:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "0"
    padding: "12px 0 15px"
  collection-tab-active:
    textColor: "{colors.foreground}"
  results-container:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.container}"
  result-row:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "0"
    padding: "17px 12px"
  result-row-active:
    backgroundColor: "{colors.accent-soft}"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "9px 26px 9px 12px"
  itinerary-stop:
    textColor: "{colors.foreground}"
    padding: "18px 0"
  route-sketch:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.route}"
---

# Design System: Prospector

## Overview

The research radar is Prospector's organizing visual: a quiet navy canvas, a lilac comparison plot and a browsable collection whose evidence remains close at hand. Job Scout, Recruiter and Day Tripper share this report system, with Day Tripper adding an ordered itinerary and a sourced route sketch. This preserves the Omnimatch direction recorded in [PRODUCT.md](PRODUCT.md).

The interface is compact enough for sustained investigation. Hierarchy comes from typography, spacing and selection; concise headings and concrete controls carry the workflow. Unknown evidence remains visible in the chart and assessment rather than becoming decorative completeness.

**Key Characteristics:**

- Dark tonal surfaces with one lilac selection accent.
- A readable radar paired with bounded, browsable results.
- Plain labels, visible source evidence and tabular scores.
- Keyboard access, reduced motion and a light print treatment.

## Colors

The palette combines deep navy surfaces, warm pale text and a soft lilac focus color. Token values above match the custom properties in `report/src/report.css`.

### Primary

- **Lilac accent:** selected radar traces, focus outlines, active navigation underlines and source actions.
- **Lilac wash:** the selected result's background, keeping the state clear without a filled accent button.

### Neutral

- **Deep navy background:** the report canvas.
- **Navy surface:** the results container and select fields.
- **Raised navy:** hover feedback for rows and routine controls.
- **Warm foreground:** titles, primary reading text and scores.
- **Muted lavender:** metadata, source domains, axis labels and supporting explanations.
- **Navy border and grid:** boundaries and plot scaffolding, with the chart grid distinct from container borders.

Success green identifies completion; amber identifies partial work and evidence warnings. These colors communicate state and do not replace the lilac selection color.

**The Evidence Color Rule.** Use color to support an explicit label. Unknown scores are written as “Unknown” and leave gaps in the radar.

## Typography

Space Grotesk is embedded in the standalone report. System sans-serif fallbacks keep the file usable if the font cannot render. The same family serves titles, controls and evidence; scale and weight supply contrast.

- **Display:** the report title uses the responsive display token, balanced wrapping and a maximum width of 24 characters. At the mobile breakpoint it is fixed at 32px.
- **Title:** section headings use the title token. The selected result has the larger detail-title role.
- **Body:** ordinary reading and controls use the body role. Briefs are limited to 75 characters per line and use a looser line height.
- **Evidence:** source excerpts use the evidence role, preserve line breaks and wrap long content.
- **Label:** metadata uses the label role; small score annotations step down to 10px.
- **Numbers:** scores, row indices and the rubric table use tabular numerals. The main fit score is 29px with weight 450; row scores are 25px.

**The Plain Heading Rule.** Lead with a concise title. Add supporting text when it explains evidence, scope or a recovery action.

## Layout

The centered shell is capped at 1380px with 56px horizontal padding. A 100px masthead leads into the brief, collection navigation and research controls. The desktop research area uses two flexible columns in a 1.05:1 ratio with a 50px gap: comparison and assessment on the left, results on the right.

At 1000px and below, horizontal padding becomes 30px, the column gap becomes 28px and search occupies its own toolbar row. At 700px and below, padding becomes 20px, the masthead becomes 82px and the columns stack. The result collection comes first; selecting a result takes the reader to its assessment. Collection navigation scrolls horizontally when needed. Mobile sort occupies a full toolbar row after the filter and CSV action so longer labels remain readable.

Results have a bounded scroll area: 650px normally, 720px at widths of 1400px or more, and 320px on mobile. The list reveals 50 results at a time through “Show 50 more”. Source excerpts have their own 360px scroll area. Keep the collection and evidence bounded as content grows.

The optional day plan is separated from research by a top rule, 48px margin and 28px inset. Its desktop grid pairs ordered stops and a route sketch in a 1.1:1 ratio with a 48px gap. At the mobile breakpoint these become one column with a 24px gap, with the stops first.

Print uses a light palette, removes interactive toolbar actions and expands result and evidence scroll areas. The active collection remains visible; the day plan and research log start on new pages. Keep each itinerary stop and route figure intact across print breaks.

## Elevation & Depth

Depth comes from tonal layering, thin borders and the lilac radar fill. There are no box shadows. The results container is one coherent surface, with rows separated by rules. Hover lifts tone; selection uses the lilac wash. Avoid adding floating cards or shadows that compete with the comparison plot.

## Shapes

Controls use gently rounded corners from the control token; the results container uses the larger container radius. Rows and collection tabs remain square inside their parent structure. One-pixel borders establish dividers. The brand mark is circular; radar geometry remains angular so each criterion stays legible.

## Components

### Buttons

Routine actions are transparent controls with a minimum height of 42px, compact padding and raised-tone hover feedback. Source actions use a 42px square target and lilac icon. Keyboard focus is a two-pixel lilac outline offset by four pixels. Keep accessible names on icon actions.

### Navigation

Collection buttons show a muted count beside their label. The active button gains foreground text and a two-pixel lilac underline. Navigation stays on one horizontal line and can scroll rather than compress its labels.

### Cards / Containers

The results container combines a navy surface, thin border and rounded outer corners. Its heading, scrollable list and footnote are parts of the same surface. Rows have a 104px minimum height on desktop and 84px on mobile. The selected row uses the lilac wash and `aria-pressed` state; its arrow takes the accent color.

### Inputs / Fields

Search is a transparent field with a leading icon, visible placeholder and a programmatic label. Selects have a surface fill and thin border. Both retain visible keyboard focus. On mobile, search text is 16px and selects are 12px. The sort selector takes its own full-width row, preserving its complete label.

### Radar and Assessment

The SVG radar uses four concentric quarter-step rings. Muted labels surround a lilac selected trace; population traces have low opacity. Multiword axis labels longer than ten characters wrap onto two lines. Labels beyond 23 characters are shortened visually; the full criterion remains in the SVG title and assessment table. Unknown criteria produce gaps, and the table below gives exact values. Population rendering is capped at 80 assessed results with an explicit sample disclosure above that count; all results remain browsable. Selection updates the assessment and its saved evidence.

Selected traces arrive with a brief opacity and blur transition (450ms). Result hover changes over 150ms. Both are disabled when reduced motion is requested; assessment navigation also honors that preference.

### Evidence Disclosure

Native disclosure controls reveal saved source URLs, retrieval dates and excerpts. Links use lilac and an external-link icon. Text wraps within the bounded evidence area. Evidence warnings use amber text with an explicit explanation.

### Ordered Itinerary

The day-plan heading shows its date and timezone. An ordered list contains one to five distinct saved results. Each stop has a 28px outlined lilac number, a lilac time label, an 18px semibold title action and a muted note. The title action takes the reader to that result's saved assessment. Thin dividers and 18px vertical padding separate stops without additional cards.

Coordinates are optional. A stop with supported coordinates exposes a “Coordinate source” link to its saved evidence. The visual treatment must preserve this provenance; do not infer or add a pin when a coordinate is missing. An indoor alternative and one next action may sit below the route area.

### Sourced Route Sketch

The route is a schematic SVG inside a surface-filled, bordered container using the route radius. A two-pixel dashed lilac line joins known positions in visiting order, and filled lilac circles carry their original itinerary numbers. The circle labels use background-colored text at 15px and weight 700. This visual shows relative position and stop order; it does not establish street directions or travel times.

At least two stops need sourced coordinates before the sketch can draw. Otherwise an inline explanation states what is missing. The caption always reports located stops against total stops, including partial coverage, and directs the reader to check actual routes and travel times. Keep missing stops in the ordered itinerary and omit their positions from the sketch.

## Do's and Don'ts

### Do:

- **Do** keep selected state, evidence coverage and unknown facts distinguishable in text as well as color.
- **Do** preserve bounded scrolling and incremental result loading.
- **Do** keep the offline report self-contained, including its font and interaction code.
- **Do** provide a visible focus outline and honor reduced motion.
- **Do** keep source evidence available beside its assessment.
- **Do** preserve stop numbering, source links and located-stop coverage in an itinerary.

### Don't:

- **Don't** turn unknown values into zero scores or close their radar gaps.
- **Don't** add shadows, excessive cards or decorative accents that weaken the existing tonal hierarchy.
- **Don't** let result histories or evidence excerpts grow the page without bounds.
- **Don't** add repetitive supporting copy beneath every heading.
- **Don't** hide a capped radar population behind a claim that every result is plotted.
- **Don't** invent missing route coordinates or present the schematic as street routing.
