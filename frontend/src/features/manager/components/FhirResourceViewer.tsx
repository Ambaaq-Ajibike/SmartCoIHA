type FhirResource = Record<string, unknown>;

type ResourceSection = {
  title: string;
  rows: Array<{ label: string; value: string }>;
};

export default function FhirResourceViewer({ data }: { data: unknown }) {
  const resources = extractResources(data);

  if (resources.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted">
        No resource data available.
      </div>
    );
  }

  return (
    <div className="max-h-[70vh] space-y-4 overflow-auto pr-1">
      {resources.map((resource, index) => {
        const view = buildResourceView(resource);

        return (
          <article key={`${view.type}-${String(resource.id ?? index)}`} className="rounded-xl border border-emerald-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-display text-base font-semibold text-ink">{view.title}</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-primary">
                {view.type}
              </span>
            </div>

            <div className="space-y-3">
              {view.sections.map((section) => (
                <section key={section.title} className="rounded-lg border border-slate-200 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{section.title}</h4>
                  <dl className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                    {section.rows.map((row) => (
                      <div key={`${section.title}-${row.label}`}>
                        <dt className="text-xs text-muted">{row.label}</dt>
                        <dd className="text-sm font-medium text-ink">{row.value || "-"}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function extractResources(data: unknown): FhirResource[] {
  if (!data || typeof data !== "object") return [];

  const root = data as Record<string, unknown>;
  if (root.resourceType === "Bundle") {
    const entries = Array.isArray(root.entry) ? root.entry : [];
    return entries
      .map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>).resource : undefined))
      .filter((resource): resource is FhirResource => Boolean(resource && typeof resource === "object"));
  }

  return [root];
}

function buildResourceView(resource: FhirResource) {
  const type = String(resource.resourceType ?? "Resource");

  const common = [
    { label: "ID", value: toText(resource.id) },
    { label: "Last Updated", value: toText(get(resource, "meta.lastUpdated")) },
    { label: "Status", value: toText(resource.status) },
  ];

  const sections: ResourceSection[] = [];

  switch (type) {
    case "Patient":
      sections.push({
        title: "Identity",
        rows: [
          { label: "Name", value: humanName(resource) },
          { label: "Gender", value: toText(resource.gender) },
          { label: "Birth Date", value: toText(resource.birthDate) },
          { label: "Phone", value: contactValue(resource, "phone") },
          { label: "Email", value: contactValue(resource, "email") },
          { label: "Address", value: addressValue(resource) },
        ],
      });
      break;
    case "Observation":
      sections.push({
        title: "Observation",
        rows: [
          { label: "Code", value: conceptText(get(resource, "code")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Value", value: observationValue(resource) },
          { label: "Effective", value: toText(get(resource, "effectiveDateTime")) },
          { label: "Issued", value: toText(get(resource, "issued")) },
        ],
      });
      break;
    case "Condition":
      sections.push({
        title: "Condition",
        rows: [
          { label: "Code", value: conceptText(get(resource, "code")) },
          { label: "Clinical Status", value: conceptText(get(resource, "clinicalStatus")) },
          { label: "Verification", value: conceptText(get(resource, "verificationStatus")) },
          { label: "Recorded Date", value: toText(get(resource, "recordedDate")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
        ],
      });
      break;
    case "MedicationRequest":
      sections.push({
        title: "Medication Request",
        rows: [
          { label: "Medication", value: conceptText(get(resource, "medicationCodeableConcept")) },
          { label: "Intent", value: toText(resource.intent) },
          { label: "Authored On", value: toText(get(resource, "authoredOn")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Requester", value: referenceText(get(resource, "requester")) },
        ],
      });
      break;
    case "DiagnosticReport":
      sections.push({
        title: "Diagnostic Report",
        rows: [
          { label: "Code", value: conceptText(get(resource, "code")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Effective", value: toText(get(resource, "effectiveDateTime")) },
          { label: "Issued", value: toText(get(resource, "issued")) },
          { label: "Conclusion", value: toText(get(resource, "conclusion")) },
        ],
      });
      break;
    case "Procedure":
      sections.push({
        title: "Procedure",
        rows: [
          { label: "Code", value: conceptText(get(resource, "code")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Performed", value: toText(get(resource, "performedDateTime")) },
          { label: "Performer", value: referenceText(firstArrayItem(get(resource, "performer"), "actor")) },
        ],
      });
      break;
    case "Encounter":
      sections.push({
        title: "Encounter",
        rows: [
          { label: "Class", value: conceptText(get(resource, "class")) },
          { label: "Type", value: conceptText(firstArrayItem(get(resource, "type"))) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Period Start", value: toText(get(resource, "period.start")) },
          { label: "Period End", value: toText(get(resource, "period.end")) },
        ],
      });
      break;
    case "AllergyIntolerance":
      sections.push({
        title: "Allergy / Intolerance",
        rows: [
          { label: "Code", value: conceptText(get(resource, "code")) },
          { label: "Clinical Status", value: conceptText(get(resource, "clinicalStatus")) },
          { label: "Category", value: toText(firstArrayItem(get(resource, "category"))) },
          { label: "Criticality", value: toText(get(resource, "criticality")) },
          { label: "Patient", value: referenceText(get(resource, "patient")) },
        ],
      });
      break;
    case "Immunization":
      sections.push({
        title: "Immunization",
        rows: [
          { label: "Vaccine", value: conceptText(get(resource, "vaccineCode")) },
          { label: "Occurrence", value: toText(get(resource, "occurrenceDateTime")) },
          { label: "Status", value: toText(resource.status) },
          { label: "Patient", value: referenceText(get(resource, "patient")) },
          { label: "Lot Number", value: toText(get(resource, "lotNumber")) },
        ],
      });
      break;
    case "CarePlan":
      sections.push({
        title: "Care Plan",
        rows: [
          { label: "Title", value: toText(get(resource, "title")) },
          { label: "Category", value: conceptText(firstArrayItem(get(resource, "category"))) },
          { label: "Intent", value: toText(get(resource, "intent")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Period Start", value: toText(get(resource, "period.start")) },
        ],
      });
      break;
    case "Goal":
      sections.push({
        title: "Goal",
        rows: [
          { label: "Description", value: conceptText(get(resource, "description")) },
          { label: "Lifecycle Status", value: toText(get(resource, "lifecycleStatus")) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Start", value: toText(get(resource, "startDate")) },
        ],
      });
      break;
    case "DocumentReference":
      sections.push({
        title: "Document Reference",
        rows: [
          { label: "Type", value: conceptText(get(resource, "type")) },
          { label: "Category", value: conceptText(firstArrayItem(get(resource, "category"))) },
          { label: "Subject", value: referenceText(get(resource, "subject")) },
          { label: "Date", value: toText(get(resource, "date")) },
          { label: "Description", value: toText(get(resource, "description")) },
        ],
      });
      break;
    default:
      sections.push({
        title: "Overview",
        rows: [
          { label: "Resource Type", value: type },
          { label: "ID", value: toText(resource.id) },
        ],
      });
      break;
  }

  sections.unshift({ title: "Metadata", rows: common });

  return {
    type,
    title: getResourceTitle(type, resource),
    sections,
  };
}

function getResourceTitle(type: string, resource: FhirResource) {
  if (type === "Patient") {
    return humanName(resource) || "Patient";
  }

  const subject = referenceText(get(resource, "subject"));
  return subject && subject !== "-" ? `${type} for ${subject}` : type;
}

function get(source: unknown, path: string): unknown {
  const segments = path.split(".");
  let current: unknown = source;

  for (const segment of segments) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function firstArrayItem(source: unknown, childPath?: string): unknown {
  if (!Array.isArray(source) || source.length === 0) return undefined;
  const first = source[0];
  if (!childPath) return first;
  return get(first, childPath);
}

function toText(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value || "-";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "-";
}

function conceptText(concept: unknown): string {
  if (!concept || typeof concept !== "object") return "-";
  const value = concept as Record<string, unknown>;
  if (typeof value.text === "string" && value.text.trim()) return value.text;

  if (Array.isArray(value.coding) && value.coding.length > 0) {
    const coding = value.coding[0] as Record<string, unknown>;
    if (typeof coding.display === "string" && coding.display.trim()) return coding.display;
    if (typeof coding.code === "string" && coding.code.trim()) return coding.code;
  }

  if (typeof value.display === "string" && value.display.trim()) return value.display;
  if (typeof value.code === "string" && value.code.trim()) return value.code;

  return "-";
}

function referenceText(ref: unknown): string {
  if (!ref || typeof ref !== "object") return "-";
  const value = ref as Record<string, unknown>;
  if (typeof value.display === "string" && value.display.trim()) return value.display;
  if (typeof value.reference === "string" && value.reference.trim()) return value.reference;
  return "-";
}

function humanName(resource: FhirResource): string {
  const names = get(resource, "name");
  if (!Array.isArray(names) || names.length === 0) return "-";

  const name = names[0] as Record<string, unknown>;
  const given = Array.isArray(name.given) ? name.given.map((part) => toText(part)).join(" ") : "";
  const family = toText(name.family);
  const full = `${given} ${family}`.trim();
  return full || "-";
}

function contactValue(resource: FhirResource, system: string): string {
  const telecom = get(resource, "telecom");
  if (!Array.isArray(telecom)) return "-";

  const match = telecom.find((item) => {
    if (!item || typeof item !== "object") return false;
    return (item as Record<string, unknown>).system === system;
  }) as Record<string, unknown> | undefined;

  if (!match) return "-";
  return toText(match.value);
}

function addressValue(resource: FhirResource): string {
  const addresses = get(resource, "address");
  if (!Array.isArray(addresses) || addresses.length === 0) return "-";

  const first = addresses[0] as Record<string, unknown>;
  const line = Array.isArray(first.line) ? first.line.map((part) => toText(part)).join(", ") : "";
  const city = toText(first.city);
  const state = toText(first.state);
  const country = toText(first.country);

  return [line, city, state, country].filter((part) => part && part !== "-").join(", ") || "-";
}

function observationValue(resource: FhirResource): string {
  const valueQuantity = get(resource, "valueQuantity");
  if (valueQuantity && typeof valueQuantity === "object") {
    const quantity = valueQuantity as Record<string, unknown>;
    const value = toText(quantity.value);
    const unit = toText(quantity.unit);
    return `${value}${unit && unit !== "-" ? ` ${unit}` : ""}`.trim();
  }

  const valueString = get(resource, "valueString");
  if (typeof valueString === "string" && valueString.trim()) return valueString;

  const valueCodeableConcept = get(resource, "valueCodeableConcept");
  return conceptText(valueCodeableConcept);
}
