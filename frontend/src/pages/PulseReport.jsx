import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { translateText } from '../services/imageAnalysisService';

export default function PulseReport() {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [lang, setLang] = useState('en'); // en | hi | mr
  const [explanation, setExplanation] = useState('');
  const [precautions, setPrecautions] = useState([]);
  const [tExplanation, setTExplanation] = useState('');
  const [tPrecautions, setTPrecautions] = useState([]);
  const [tSymptoms, setTSymptoms] = useState([]);
  const [tFullText, setTFullText] = useState('');
  const [tDiseases, setTDiseases] = useState([]);
  const [tMedicines, setTMedicines] = useState([]);
  const cleanItem = (s) => {
    if (!s) return '';
    let x = String(s)
      .replace(/^[-*>\s•]+/, '')
      .replace(/^\*+|\*+$/g, '')
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^#+\s*/, '')
      .trim();
    // Drop common headings
    if (/^summary:?$/i.test(x)) return '';
    if (/^report\s+details:?$/i.test(x)) return '';
    return x;
  };

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('pulse_report');
      if (saved) setReport(JSON.parse(saved));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleDownloadPdf = () => {
    window.print();
  };

  useEffect(() => {
    if (!report) return;
    const text = String(report.analysis || report.raw_analysis || '');

    // Extract diseases (heuristics): try bullets, then 'such as ...' list
    let diseaseList = [];
    const bulletDiseases = [...text.matchAll(/^[\-\*]\s*(.+)$/gmi)].map(m => cleanItem(m[1]));
    if (bulletDiseases.length) {
      diseaseList = bulletDiseases.filter(Boolean);
    } else {
      const idx = text.toLowerCase().indexOf('such as');
      if (idx !== -1) {
        const after = text.slice(idx + 'such as'.length);
        const upToPeriod = after.split(/[\.!\n]/)[0];
        diseaseList = upToPeriod
          .split(',')
          .map(s => cleanItem(s.replace(/^(and|or)\s+/i, '').trim()))
          .filter(Boolean)
          .map(s => s.charAt(0).toUpperCase() + s.slice(1));
      }
    }
    setDiseases(diseaseList);

    // Extract medicines from phrases like: Recommended Medicines:, treatment includes, medications include
    let meds = [];
    const medsHeader = [...text.matchAll(/(?:recommended\s+medicines?|treatments?|medications?)\s*:\s*([\s\S]*?)(?:\n\n|\r\n\r\n|$)/gim)].map(m => m[1]);
    if (medsHeader.length) {
      meds = medsHeader[0]
        .split(/\n|,/)
        .map(s => cleanItem(s.replace(/^[-*]\s*/,'').trim()))
        .filter(Boolean);
    }
    setMedicines(meds);

    // Extract symptoms from phrases like: Common Symptoms:, symptoms include
    let syms = [];
    const symHeader = [...text.matchAll(/(?:common\s+symptoms?|symptoms?\s+include)\s*:\s*([\s\S]*?)(?:\n\n|\r\n\r\n|$)/gim)].map(m => m[1]);
    if (symHeader.length) {
      syms = symHeader[0]
        .split(/\n|,/)
        .map(s => cleanItem(s.replace(/^[-*]\s*/,'').trim()))
        .filter(Boolean);
    } else {
      // Fallback: look for sentence containing 'symptom'
      const symptomSentence = (text.match(/[^\.!?]*symptom[^\.!?]*/i) || [''])[0];
      if (symptomSentence) {
        syms = symptomSentence
          .split(/,|;|and /i)
          .map(s => cleanItem(s.replace(/^(symptoms?\s*(include|are):?\s*)/i,'').trim()))
          .filter(Boolean);
      }
    }
    setSymptoms(syms);

    // Explanation: take first paragraph or first 2 sentences
    const para = text.split(/\n\s*\n/)[0] || text;
    const simple = para.split(/(?<=[\.!?])\s+/).slice(0, 2).join(' ');
    setExplanation(simple || para);

    // Precautions: block after "Precautions:" or lines with advise terms
    let precs = [];
    const precBlock = [...text.matchAll(/precautions?\s*:\s*([\s\S]*?)(?:\n\n|\r\n\r\n|$)/gim)].map(m => m[1]);
    if (precBlock.length) {
      precs = precBlock[0]
        .split(/\n|,|;|\./)
        .map(s => s.replace(/^[-*]\s*/,'').trim())
        .filter(Boolean);
    } else {
      const lines = text.split(/\n+/).filter(Boolean);
      precs = lines
        .filter(l => /\b(avoid|should|do not|don’t|advise|recommend)\b/i.test(l))
        .slice(0, 5)
        .map(s => s.replace(/^[-*]\s*/,'').trim());
    }
    setPrecautions(precs);

    // initialize translated = original for current lang
    setTExplanation(simple || para);
    setTPrecautions(precs);
    setTSymptoms(syms);
    setTFullText(text);
    setTDiseases(diseaseList);
    setTMedicines(meds);
  }, [report]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="border-b bg-white border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Pulse Summary Report</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Back</button>
            <button onClick={handleDownloadPdf} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Download PDF</button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!report ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600">No report found. Generate a report from Pulse Summary first.</p>
            <button onClick={() => navigate('/user/pulsesummery')} className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Go to Pulse Summary</button>
          </div>
        ) : (
          <div className="space-y-6">

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Report Details</h2>
                {/* Language Selector in upper right */}
                <select
                  value={lang}
                  onChange={async (e) => {
                    const newLang = e.target.value;
                    setLang(newLang);
                    if (!report) return;
                    if (newLang === 'en') {
                      setTExplanation(explanation);
                      setTPrecautions(precautions);
                      setTSymptoms(symptoms);
                      setTFullText(report.analysis || report.raw_analysis || '');
                      setTDiseases(diseases);
                      setTMedicines(medicines);
                      return;
                    }
                    try {
                      const [eT, pT, sT, fT, dT, mT] = await Promise.all([
                        translateText(explanation, newLang),
                        translateText(precautions.join('\n'), newLang),
                        translateText(symptoms.join('\n'), newLang),
                        translateText(report.analysis || report.raw_analysis || '', newLang),
                        translateText(diseases.join('\n'), newLang),
                        translateText(medicines.join('\n'), newLang),
                      ]);
                      setTExplanation(eT);
                      setTPrecautions(pT ? pT.split(/\n+/).filter(Boolean) : []);
                      setTSymptoms(sT ? sT.split(/\n+/).filter(Boolean) : []);
                      setTFullText(fT);
                      setTDiseases(dT ? dT.split(/\n+/).filter(Boolean) : []);
                      setTMedicines(mT ? mT.split(/\n+/).filter(Boolean) : []);
                    } catch {
                      setTExplanation(explanation);
                      setTPrecautions(precautions);
                      setTSymptoms(symptoms);
                      setTFullText(report.analysis || report.raw_analysis || '');
                      setTDiseases(diseases);
                      setTMedicines(medicines);
                    }
                  }}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </select>
              </div>
              {/* Detail Block */}
              <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                <div className="font-semibold mb-2">Details</div>
                <div className="text-gray-800 leading-relaxed">{tExplanation || explanation || 'No analysis text available.'}</div>
              </div>

              {/* Four boxes: Diseases, Medicines, Symptoms, Precautions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-semibold mb-2">Mentioned Diseases</div>
                  {tDiseases && tDiseases.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {tDiseases.map((d,i)=>(<li key={i}>{d}</li>))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Not detected</div>
                  )}
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-semibold mb-2">Recommended Medicines</div>
                  {tMedicines && tMedicines.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {tMedicines.map((m,i)=>(<li key={i}>{m}</li>))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Not detected</div>
                  )}
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-semibold mb-2">AI‑Suggested Symptoms</div>
                  {tSymptoms && tSymptoms.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {tSymptoms.map((s,i)=>(<li key={i}>{s}</li>))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Not detected</div>
                  )}
                </div>
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="font-semibold mb-2">Precautions</div>
                  {tPrecautions && tPrecautions.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {tPrecautions.map((p,i)=>(<li key={i}>{p}</li>))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500">Not detected</div>
                  )}
                </div>
              </div>

              {/* Full Text always visible */}
              <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                <div className="font-semibold mb-2">Full Text</div>
                <pre className="whitespace-pre-wrap text-xs text-gray-600">{tFullText || report.analysis || report.raw_analysis || ''}</pre>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-base font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 text-sm">This report summarizes the analyzed findings. No third-party provider names are displayed.</p>
            </div>

            <div className="flex gap-2">
              <button onClick={handleDownloadPdf} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Download PDF</button>
              <button onClick={() => navigate('/user/pulsesummery')} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Analyze More</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
