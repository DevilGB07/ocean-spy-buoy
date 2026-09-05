import React, { useEffect, useState } from 'react';
import { AnalyticsData } from '../types';
import { getAnalytics } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ocean-cyan" />
        COMPUTING SURVEILLANCE TELEMETRY ANALYTICS...
      </div>
    );
  }

  // Format data for Recharts
  const statusPieData = [
    { name: 'Verified Vessel', value: data.verified_count, color: '#10B981' },
    { name: 'AIS Mismatch', value: data.mismatch_count, color: '#F59E0B' },
    { name: 'Possible Dark Vessel', value: data.dark_vessel_count, color: '#EF4444' },
  ];

  const vesselTypeData = Object.entries(data.vessel_distribution).map(([type, count]) => ({
    type,
    count
  }));

  const riskHistogramData = Object.entries(data.risk_distribution).map(([range, count]) => ({
    range,
    count
  }));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-ocean-cyan" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Surveillance Intelligence Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated hydrophone detections, threat distributions, and AIS correlation benchmarks.
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-ocean-950 px-3 py-1.5 rounded-lg border border-ocean-border text-center">
            <div className="text-[10px] text-slate-400">AVG AI CONFIDENCE</div>
            <div className="text-sm font-bold text-ocean-cyan">{Math.round(data.average_confidence * 100)}%</div>
          </div>
          <div className="bg-ocean-950 px-3 py-1.5 rounded-lg border border-ocean-border text-center">
            <div className="text-[10px] text-slate-400">TOTAL SENSING EVENTS</div>
            <div className="text-sm font-bold text-slate-100">{data.total_detections}</div>
          </div>
        </div>
      </div>

      {/* Chart Grid 1: Detections Over Time + Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (2 cols) */}
        <div className="lg:col-span-2 bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ocean-cyan" />
            <span>Detection Volume & Alert Velocity (24h Window)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline_stats}>
                <defs>
                  <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1F', borderColor: '#1E3260', color: '#f8fafc', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="detections" stroke="#00F0FF" fillOpacity={1} fill="url(#colorDetections)" />
                <Area type="monotone" dataKey="alerts" stroke="#EF4444" fillOpacity={1} fill="url(#colorAlerts)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detection Breakdown Pie Chart (1 col) */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Surveillance Status Breakdown
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1F', borderColor: '#1E3260', color: '#f8fafc', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Grid 2: Vessel Types + Risk Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Classification Distribution */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Acoustic Vessel Classification Distribution
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vesselTypeData}>
                <XAxis dataKey="type" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1F', borderColor: '#1E3260', color: '#f8fafc', fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Investigation Priority Score Histogram
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskHistogramData}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070D1F', borderColor: '#1E3260', color: '#f8fafc', fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
