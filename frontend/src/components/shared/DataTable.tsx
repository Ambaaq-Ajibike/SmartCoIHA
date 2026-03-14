import type { ReactNode } from "react";

type TableAlign = "left" | "center" | "right";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header?: string;
  align?: TableAlign;
  className?: string;
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns?: DataTableColumn<T>[];
  hiddenKeys?: Array<keyof T | string>;
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  emptyMessage?: string;
  actionsHeader?: string;
  renderActions?: (row: T, index: number) => ReactNode;
}

export default function DataTable<T extends object>({
  data,
  columns,
  hiddenKeys = [],
  rowKey,
  emptyMessage = "No records found.",
  actionsHeader = "Actions",
  renderActions,
}: DataTableProps<T>) {
  const resolvedColumns = (columns && columns.length > 0)
    ? columns
    : getColumnsFromData(data, hiddenKeys);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-emerald-100">
          <thead className="bg-emerald-50/60">
            <tr>
              {resolvedColumns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted ${getAlignClass(
                    column.align,
                    "header",
                  )}`}
                >
                  {column.header ?? toHeaderLabel(String(column.key))}
                </th>
              ))}
              {renderActions ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                  {actionsHeader}
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-emerald-100">
            {data.map((row, index) => {
              const key = getRowKey(row, index, rowKey);

              return (
                <tr key={key} className="align-top">
                  {resolvedColumns.map((column) => {
                    const rawValue = (row as Record<string, unknown>)[String(column.key)];

                    return (
                      <td
                        key={`${String(key)}-${String(column.key)}`}
                        className={`px-4 py-4 text-sm text-muted ${column.className ?? ""} ${getAlignClass(
                          column.align,
                          "cell",
                        )}`}
                      >
                        {column.render
                          ? column.render(rawValue, row)
                          : formatCellValue(rawValue)}
                      </td>
                    );
                  })}

                  {renderActions ? (
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">{renderActions(row, index)}</div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getColumnsFromData<T extends object>(
  rows: T[],
  hiddenKeys: Array<keyof T | string>,
): DataTableColumn<T>[] {
  if (rows.length === 0) return [];

  const hidden = new Set(hiddenKeys.map(String));
  const keys = Object.keys(rows[0]).filter((key) => !hidden.has(key));

  return keys.map((key) => ({ key }));
}

function getRowKey<T extends object>(
  row: T,
  index: number,
  rowKey?: keyof T | ((row: T, index: number) => React.Key),
) {
  if (typeof rowKey === "function") {
    return rowKey(row, index);
  }

  if (rowKey) {
    return String((row as Record<string, unknown>)[String(rowKey)]);
  }

  if ("id" in row) {
    return String((row as { id?: unknown }).id);
  }

  return String(index);
}

function toHeaderLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "boolean") return value ? "True" : "False";
  return String(value);
}

function getAlignClass(align: TableAlign | undefined, target: "header" | "cell") {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return target === "header" ? "text-left" : "text-left";
}
