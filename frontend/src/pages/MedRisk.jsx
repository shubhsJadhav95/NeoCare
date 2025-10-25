import React, { useEffect, useMemo, useState } from "react";
import medrisk2 from "../assets/images/medrisk2.jpg";

const mockHospitals = [
  { name: "City General Hospital", lat: 0.8, lng: 0.8 },
];

export default function MedRisk() {
  const [state, setState] = useState("waiting"); // waiting | enroute
  const [eta, setEta] = useState(7);
  const [ambulanceId] = useState("HGH-876X");
  const [hospital] = useState(mockHospitals[0]);
  const [progress, setProgress] = useState(0); // 0..1 for the route animation
  const [emergencyType, setEmergencyType] = useState("cardiac"); // cardiac | accident | other
  const [customEmergency, setCustomEmergency] = useState("");

  useEffect(() => {
    let t;
    if (state === "enroute") {
      // ETA countdown and movement simulation
      t = setInterval(() => {
        setEta((e) => (e > 0 ? e - 1 : 0));
        setProgress((p) => (p < 0.98 ? Math.min(1, p + 0.12) : 1));
      }, 1000);
    }
    return () => t && clearInterval(t);
  }, [state]);

  const routePath = useMemo(() => {
    // Simple polyline path across the map area (0..1 coords)
    const points = [
      { x: 0.15, y: 0.65 }, // user
      { x: 0.35, y: 0.55 },
      { x: 0.55, y: 0.45 },
      { x: 0.75, y: 0.35 },
      { x: 0.8, y: 0.2 }, // hospital vicinity
    ];
    return points;
  }, []);

  const ambulancePos = useMemo(() => {
    const pts = routePath;
    if (!pts.length) return pts[0];
    const idx = Math.floor(progress * (pts.length - 1));
    const a = pts[idx];
    const b = pts[Math.min(idx + 1, pts.length - 1)];
    const localT = progress * (pts.length - 1) - idx;
    return {
      x: a.x + (b.x - a.x) * localT,
      y: a.y + (b.y - a.y) * localT,
    };
  }, [routePath, progress]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={medrisk2} alt="MedRisk" className="object-contain w-12 h-12" />
            <h1 className="text-xl font-bold text-gray-900">MedRisk</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">EMERGENCY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 gap-6">
        {state === "waiting" ? (
          <WaitingView
            emergencyType={emergencyType}
            setEmergencyType={setEmergencyType}
            customEmergency={customEmergency}
            setCustomEmergency={setCustomEmergency}
            onCancel={() => alert("Confirm cancel: implement modal")}
            onConfirm={() => setState("enroute")}
          />
        ) : (
          <EnrouteView eta={eta} ambulanceId={ambulanceId} hospitalName={hospital.name} ambulancePos={ambulancePos} routePath={routePath}/>
        )}
      </div>
    </div>
  );
}

function WaitingView({ onCancel, onConfirm, emergencyType, setEmergencyType, customEmergency, setCustomEmergency }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="text-center space-y-4">
        <div className="text-2xl font-bold text-gray-900">Emergency Call Sent</div>
        <div className="text-gray-600">Calling nearby hospitals... Waiting for dispatch confirmation.</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {/* Emergency type selector */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Emergency Type</div>
            <div className="space-y-2">
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cardiac">Cardiac</option>
                <option value="accident">Accident</option>
                <option value="other">Other</option>
              </select>
              {emergencyType === "other" && (
                <input
                  type="text"
                  value={customEmergency}
                  onChange={(e) => setCustomEmergency(e.target.value)}
                  placeholder="Describe emergency"
                  className="w-full bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
          <InfoItem label="Patient" value="John Doe (sample)"/>
          <InfoItem label="Location" value="Current GPS"/>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <button onClick={onConfirm} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold">Confirm Dispatch</button>
          <button onClick={onCancel} className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold">Cancel Emergency</button>
          <button className="px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900">Share Location</button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
}

function EnrouteView({ eta, ambulanceId, hospitalName, ambulancePos, routePath }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Map placeholder using SVG */}
        <div className="relative h-80 bg-gray-100">
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            {/* subtle grid */}
            <defs>
              <pattern id="g" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="url(#g)" />

            {/* route */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              points={routePath.map(p => `${p.x * 100},${p.y * 100}`).join(" ")}
            />

            {/* user pin */}
            <circle cx={15} cy={65} r={3.5} fill="#ef4444" />
            <text x={15} y={70} fontSize="4" textAnchor="middle" fill="#ef4444">You</text>

            {/* hospital pin */}
            <circle cx={80} cy={20} r={3.5} fill="#10b981" />
            <text x={80} y={25} fontSize="4" textAnchor="middle" fill="#10b981">Hospital</text>

            {/* ambulance */}
            <g transform={`translate(${ambulancePos.x * 100}, ${ambulancePos.y * 100})`}>
              <rect x={-3.5} y={-2} width={7} height={4} rx={0.8} fill="#ef4444" />
              <rect x={-1} y={-1} width={2} height={2} fill="#ffffff" />
            </g>
          </svg>
        </div>

        {/* Live status bar */}
        <div className="p-4 bg-slate-900 text-white">
          <div className="text-lg font-bold">AMBULANCE DISPATCHED!</div>
          <div className="mt-1"><span className="text-red-400 font-bold">ETA: {eta} mins</span></div>
          <div className="text-sm text-slate-300 mt-1">Ambulance ID: {ambulanceId}</div>
          <div className="text-sm text-slate-300">Receiving at: {hospitalName}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white rounded-lg py-3 font-semibold">
          <span>Call Ambulance Driver</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold">
          <span>Share Location</span>
        </button>
        <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg py-3 font-semibold">
          <span>Emergency Contacts</span>
        </button>
      </div>
    </div>
  );
}
