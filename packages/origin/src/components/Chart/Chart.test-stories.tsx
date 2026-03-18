import * as React from "react";
import * as Chart from "./";

const SAMPLE_DATA = [
  { date: "Mon", value: 120 },
  { date: "Tue", value: 150 },
  { date: "Wed", value: 140 },
  { date: "Thu", value: 180 },
  { date: "Fri", value: 160 },
  { date: "Sat", value: 200 },
  { date: "Sun", value: 190 },
];

const MULTI_SERIES_DATA = [
  { date: "Mon", incoming: 120, outgoing: 80 },
  { date: "Tue", incoming: 150, outgoing: 95 },
  { date: "Wed", incoming: 140, outgoing: 110 },
  { date: "Thu", incoming: 180, outgoing: 100 },
  { date: "Fri", incoming: 160, outgoing: 130 },
  { date: "Sat", incoming: 200, outgoing: 120 },
  { date: "Sun", incoming: 190, outgoing: 140 },
];

export function Sparkline() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      interactive={false}
      data-testid="chart"
    />
  );
}

export function SparklineWithColor() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      interactive={false}
      color="rgb(0, 0, 255)"
      data-testid="chart"
    />
  );
}

export function FullChart() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: "incoming", label: "Incoming" },
        { key: "outgoing", label: "Outgoing" },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip
      data-testid="chart"
    />
  );
}

export function LinearCurve() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      curve="linear"
      data-testid="chart"
    />
  );
}

export function WithFadeLeft() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      fadeLeft
      data-testid="chart"
    />
  );
}

export function WithFadeLeftCustom() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      fadeLeft={60}
      data-testid="chart"
    />
  );
}

export function CustomAriaLabel() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      ariaLabel="Weekly revenue trend"
      data-testid="chart"
    />
  );
}

export function EmptyData() {
  return (
    <Chart.Line data={[]} dataKey="value" height={170} data-testid="chart" />
  );
}

export function SingleDataPoint() {
  return (
    <Chart.Line
      data={[{ date: "Mon", value: 100 }]}
      dataKey="value"
      height={170}
      data-testid="chart"
    />
  );
}

export function NoAnimation() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      animate={false}
      data-testid="chart"
    />
  );
}

export function CustomStrokeWidth() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      height={170}
      strokeWidth={4}
      data-testid="chart"
    />
  );
}

export function WithFormatters() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: "incoming", label: "Incoming" },
        { key: "outgoing", label: "Outgoing" },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip
      formatValue={(v) => `$${v}`}
      formatYLabel={(v) => `$${v}`}
      data-testid="chart"
    />
  );
}

export function SimpleTooltip() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      xKey="date"
      height={250}
      grid
      tooltip="simple"
      data-testid="chart"
    />
  );
}

export function DetailedTooltipExplicit() {
  return (
    <Chart.Line
      data={MULTI_SERIES_DATA}
      series={[
        { key: "incoming", label: "Incoming" },
        { key: "outgoing", label: "Outgoing" },
      ]}
      xKey="date"
      height={250}
      grid
      tooltip="detailed"
      data-testid="chart"
    />
  );
}

export function CustomTooltip() {
  return (
    <Chart.Line
      data={SAMPLE_DATA}
      dataKey="value"
      xKey="date"
      height={250}
      grid
      tooltip={(datum) => (
        <div data-testid="custom-tooltip-content">
          Custom: {String(datum.date)}
        </div>
      )}
      data-testid="chart"
    />
  );
}

export function ScatterBasic() {
  return (
    <Chart.Scatter
      data={[
        {
          key: "group-a",
          label: "Group A",
          data: [
            { x: 10, y: 30 },
            { x: 40, y: 70 },
            { x: 70, y: 45 },
            { x: 90, y: 90 },
          ],
        },
      ]}
      height={250}
      grid
      tooltip
      data-testid="scatter-chart"
    />
  );
}

export function ScatterMultiSeries() {
  return (
    <Chart.Scatter
      data={[
        {
          key: "a",
          label: "Series A",
          data: [
            { x: 10, y: 30 },
            { x: 40, y: 70 },
            { x: 70, y: 45 },
          ],
        },
        {
          key: "b",
          label: "Series B",
          color: "var(--surface-blue-strong)",
          data: [
            { x: 20, y: 60 },
            { x: 50, y: 20 },
            { x: 80, y: 80 },
          ],
        },
      ]}
      height={250}
      grid
      tooltip
      legend
      data-testid="scatter-chart"
    />
  );
}

export function SplitBasic() {
  return (
    <Chart.Split
      data={[
        { label: "Payments", value: 4200 },
        { label: "Transfers", value: 2800 },
        { label: "Fees", value: 650 },
      ]}
      data-testid="split-chart"
    />
  );
}

export function SplitDetailed() {
  return (
    <Chart.Split
      data={[
        { label: "Incoming", value: 246_100_000 },
        { label: "Outgoing", value: 87_800_000 },
        { label: "Bidirectional", value: 4_600_000 },
      ]}
      variant="detailed"
      formatValue={(v: number) => {
        if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
        return `$${v}`;
      }}
      data-testid="split-chart"
    />
  );
}

export function BarListRanked() {
  return (
    <Chart.BarList
      data={[
        { name: "United States", value: 4200, change: "up" as const },
        { name: "United Kingdom", value: 2800, change: "down" as const },
        { name: "Germany", value: 1500, change: "neutral" as const },
        { name: "Japan", value: 900 },
      ]}
      showRank
      data-testid="barlist-ranked"
    />
  );
}

export function WaterfallBasic() {
  return (
    <Chart.Waterfall
      data={[
        { label: "Revenue", value: 420, type: "total" },
        { label: "Product", value: 280 },
        { label: "Services", value: 140 },
        { label: "Refunds", value: -85 },
        { label: "Fees", value: -45 },
        { label: "Tax", value: -62 },
        { label: "Net", value: 648, type: "total" },
      ]}
      height={300}
      grid
      tooltip
      showConnectors
      data-testid="waterfall-chart"
    />
  );
}

export function FunnelBasic() {
  return (
    <Chart.Funnel
      data={[
        { label: "Visitors", value: 10000 },
        { label: "Sign ups", value: 4200 },
        { label: "Activated", value: 2800 },
        { label: "Subscribed", value: 1200 },
        { label: "Retained", value: 900 },
      ]}
      data-testid="funnel-chart"
    />
  );
}

export function BarBasic() {
  return (
    <Chart.Bar
      data={[
        { date: "Mon", value: 120 },
        { date: "Tue", value: 150 },
        { date: "Wed", value: 140 },
        { date: "Thu", value: 180 },
        { date: "Fri", value: 160 },
      ]}
      series={[{ key: "value", label: "Revenue" }]}
      xKey="date"
      height={200}
      tooltip
      data-testid="bar-chart"
    />
  );
}

export function SankeyBasic() {
  return (
    <Chart.Sankey
      data={{
        nodes: [
          { id: "a", label: "Source A" },
          { id: "b", label: "Source B" },
          { id: "c", label: "Target X" },
          { id: "d", label: "Target Y" },
        ],
        links: [
          { source: "a", target: "c", value: 30 },
          { source: "a", target: "d", value: 20 },
          { source: "b", target: "c", value: 40 },
          { source: "b", target: "d", value: 10 },
        ],
      }}
      height={300}
      data-testid="sankey-chart"
    />
  );
}
