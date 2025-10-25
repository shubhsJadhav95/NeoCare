import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function PlusBadge() {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cyan-100 text-cyan-600 border border-cyan-300 mr-3">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </span>
  );
}

const parseMedicationsFromAnalysis = (text) => {
  if (!text) return [];
  
  const items = [];
  let id = 1;
  
  // Split by MEDICATION markers
  const medicationBlocks = text.split(/MEDICATION\s+\d+:/i).filter(Boolean);
  
  for (const block of medicationBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const med = { id: id++, name: '', dosage: '', form: '', price: 0, details: '', tag: null, highlight: false };
    
    for (const line of lines) {
      // Name
      if (/^-?\s*Name\s*[:|-]?\s*(.+)/i.test(line)) {
        med.name = line.replace(/^-?\s*Name\s*[:|-]?\s*/i, '').trim();
      }
      // Dosage
      else if (/^-?\s*Dosage\s*[:|-]?\s*(.+)/i.test(line)) {
        med.dosage = line.replace(/^-?\s*Dosage\s*[:|-]?\s*/i, '').trim();
      }
      // Form
      else if (/^-?\s*Form\s*[:|-]?\s*(.+)/i.test(line)) {
        med.form = line.replace(/^-?\s*Form\s*[:|-]?\s*/i, '').trim();
      }
      // Price
      else if (/^-?\s*Price\s*[:|-]?\s*[₹]?\s*(\d+\.?\d*)/i.test(line)) {
        const match = line.match(/(\d+\.?\d*)/);
        if (match) med.price = parseFloat(match[1]);
      }
      // Details
      else if (/^-?\s*Details\s*[:|-]?\s*(.+)/i.test(line)) {
        med.details = line.replace(/^-?\s*Details\s*[:|-]?\s*/i, '').trim();
      }
      // Tag
      else if (/^-?\s*Tag\s*[:|-]?\s*(.+)/i.test(line)) {
        med.tag = line.replace(/^-?\s*Tag\s*[:|-]?\s*/i, '').trim();
        med.highlight = true;
      }
    }
    
    // Combine name and dosage
    if (med.name && med.dosage) {
      med.name = `${med.name} ${med.dosage}`;
    }
    
    // Only add if we have at least a name
    if (med.name) {
      // Set defaults
      if (!med.form) med.form = 'Tablet';
      if (!med.price || med.price === 0) med.price = Math.floor(Math.random() * 200) + 50;
      items.push(med);
    }
  }
  
  // If no structured data found, try fallback parsing
  if (items.length === 0) {
    const lines = text.split('\n').filter(Boolean);
    let currentMed = { id: id++, name: '', form: '', price: 0, details: '', tag: null, highlight: false };
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (/^-?\s*Name\s*[:|-]?\s*(.+)/i.test(trimmed)) {
        if (currentMed.name) {
          items.push({ ...currentMed });
          currentMed = { id: id++, name: '', form: '', price: 0, details: '', tag: null, highlight: false };
        }
        currentMed.name = trimmed.replace(/^-?\s*Name\s*[:|-]?\s*/i, '');
      } else if (/^-?\s*Form\s*[:|-]?\s*(.+)/i.test(trimmed)) {
        currentMed.form = trimmed.replace(/^-?\s*Form\s*[:|-]?\s*/i, '');
      } else if (/^-?\s*Price\s*[:|-]?\s*[₹]?\s*(\d+\.?\d*)/i.test(trimmed)) {
        const match = trimmed.match(/(\d+\.?\d*)/);
        if (match) currentMed.price = parseFloat(match[1]);
      }
    }
    
    if (currentMed.name) {
      if (!currentMed.form) currentMed.form = 'Tablet';
      if (!currentMed.price) currentMed.price = Math.floor(Math.random() * 200) + 50;
      items.push(currentMed);
    }
  }
  
  return items;
};

export default function PharmaMedicine() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [rawAnalysis, setRawAnalysis] = useState('');
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pharma_scan_result');
      if (saved) {
        const data = JSON.parse(saved);
        setRawAnalysis(data.analysis || '');
        setPrescriptionImage(data.prescriptionImage || null);
        const parsed = parseMedicationsFromAnalysis(data.analysis || '');
        setItems(parsed.length > 0 ? parsed : [
          { id: 1, name: "No medications detected", price: 0, form: "N/A", tag: null }
        ]);
      } else {
        setItems([{ id: 1, name: "No scan data found", price: 0, form: "Please scan a prescription first", tag: null }]);
      }
    } catch (e) {
      setItems([{ id: 1, name: "Error loading data", price: 0, form: "N/A", tag: null }]);
    }
  }, []);
  
  const total = useMemo(() => items.reduce((sum, i) => sum + i.price, 0), [items]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold tracking-wide text-gray-900">Suggested Medications & Cost</h2>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <path d="M12 1v22M1 12h22"/>
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((m) => (
            <div key={m.id} className={`rounded-xl p-4 border ${m.highlight ? "border-rose-400" : "border-gray-200"} bg-gray-50`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <PlusBadge />
                    <div className="font-semibold text-gray-900 truncate">{m.name}</div>
                  </div>
                  <div className="text-xs text-gray-600">Form : {m.form}</div>
                  {m.details && (
                    <div className="text-xs text-gray-500 mt-1">{m.details}</div>
                  )}
                  {m.tag && (
                    <div className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${m.highlight ? "bg-rose-100 text-rose-700" : "bg-gray-200 text-gray-700"}`}>
                      {m.tag}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-900 font-semibold">₹ {m.price.toFixed(2)}</div>
                  <button className="text-xs px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between text-gray-900">
          <div className="text-sm">Total Estimated Cost : <span className="font-semibold">₹ {total.toFixed(2)}</span></div>
        </div>

        <button 
          onClick={() => {
            // Store selected medications and prescription image for pharmafast
            sessionStorage.setItem('pharmafast_order', JSON.stringify({
              items: items,
              total: total,
              prescriptionImage: prescriptionImage,
              timestamp: new Date().toISOString()
            }));
            navigate('/user/pharmafast');
          }}
          className="mt-3 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-colors font-medium"
        >
          Checkout Securely
        </button>
      </div>
    </div>
  );
}
