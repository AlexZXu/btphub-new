import dayjs from "dayjs";

export function initials(first: string, last: string): string {
  return `${first[0] ?? ""}${last[0] ?? ""}`;
}

export function computeAgeFromYears(startDate: string): number {
  return Math.max(0, dayjs().diff(startDate, "year"));
}

export function RatesTable({ rates }: { rates: { serviceType: string; rate: number }[] }) {
  const cell: React.CSSProperties = {
    border: "1px solid #D5D5D5",
    padding: "5px 8px",
    minWidth: 110,
    fontSize: 14,
  };
  const shown = rates.length > 0 ? rates : [{ serviceType: "No service", rate: 0 }];
  return (
    <div style={{ width: "100%", overflowX: "auto", display: "flex" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          <tr>
            {shown.map((r) => (
              <td key={r.serviceType} style={cell}>
                {r.serviceType}
              </td>
            ))}
          </tr>
          <tr>
            {shown.map((r) => (
              <td key={r.serviceType} style={{ ...cell, color: rates.length ? undefined : "#737373" }}>
                ${r.rate.toFixed(2)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
