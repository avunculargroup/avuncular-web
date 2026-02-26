"use client";

import { useEffect, useState } from "react";

interface TickerData {
  btcPrice: number | null;
  btcChange: number | null;
  pipelineTotal: number;
  openTasks: number;
  agentsOnline: number;
}

export default function TickerBar({
  initialData,
}: {
  initialData?: Partial<TickerData>;
}) {
  const [data, setData] = useState<TickerData>({
    btcPrice: initialData?.btcPrice ?? null,
    btcChange: initialData?.btcChange ?? null,
    pipelineTotal: initialData?.pipelineTotal ?? 0,
    openTasks: initialData?.openTasks ?? 0,
    agentsOnline: initialData?.agentsOnline ?? 0,
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true"
        );
        const json = await res.json();
        setData((prev) => ({
          ...prev,
          btcPrice: json.bitcoin.usd,
          btcChange: json.bitcoin.usd_24h_change,
        }));
      } catch {
        // Silently fail — show stale data
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number | null) => {
    if (price === null) return "---";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatChange = (change: number | null) => {
    if (change === null) return "";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="bg-[--surface] border-b border-[--border] overflow-x-auto whitespace-nowrap">
      <div className="flex items-center divide-x divide-[--border] px-1">
        <TickerPill
          label="BTC/USD"
          value={formatPrice(data.btcPrice)}
          change={formatChange(data.btcChange)}
          changeColor={
            data.btcChange !== null
              ? data.btcChange >= 0
                ? "text-[--green]"
                : "text-[--red]"
              : ""
          }
        />
        <TickerPill label="Pipeline" value={String(data.pipelineTotal)} />
        <TickerPill label="Tasks" value={String(data.openTasks)} />
        <TickerPill label="Agents" value={String(data.agentsOnline)} />
      </div>
    </div>
  );
}

function TickerPill({
  label,
  value,
  change,
  changeColor,
}: {
  label: string;
  value: string;
  change?: string;
  changeColor?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-wider text-[--text-muted]">
        {label}
      </span>
      <span className="font-mono text-[10px] text-[--text]">{value}</span>
      {change && (
        <span className={`font-mono text-[9px] ${changeColor}`}>{change}</span>
      )}
    </div>
  );
}
