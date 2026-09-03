import Link from "next/link";

export interface TabDef {
  key: string;
  label: string;
}

/** Pill tab row driven by a `?tab=` search param (server-rendered links). */
export default function Tabs({
  tabs,
  selected,
  basePath,
  param = "tab",
  trailing,
}: {
  tabs: TabDef[];
  selected: string;
  basePath: string;
  param?: string;
  trailing?: TabDef[];
}) {
  const tab = (t: TabDef) => (
    <Link
      key={t.key}
      href={`${basePath}?${param}=${t.key}`}
      className={`tab${t.key === selected ? " tab--selected" : ""}`}
    >
      {t.label}
    </Link>
  );
  return (
    <div className="tabs" style={trailing ? { justifyContent: "space-between" } : undefined}>
      <div className="tabs">{tabs.map(tab)}</div>
      {trailing ? <div className="tabs">{trailing.map(tab)}</div> : null}
    </div>
  );
}
