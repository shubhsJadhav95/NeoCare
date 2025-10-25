import React, { useMemo, useState, useContext } from "react";
import { MagnifyingGlassIcon, HeartIcon, BeakerIcon, PhotoIcon, ChartBarIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import { authContext } from "../context/AuthContext.jsx";

const diseaseData = [
  {
    category: "Cardiovascular Diseases",
    color: "from-rose-50 to-rose-100",
    headerColor: "text-rose-700",
    icon: HeartIcon,
    dataTypes: ["ECG", "Echocardiography", "Blood tests", "Lifestyle data"],
    mlTasks: ["Classification", "Risk scoring", "Early detection"],
    examples: [
      "Heart attack",
      "Heart failure",
      "Arrhythmia",
      "Coronary artery disease",
      "Hypertension risk prediction",
    ],
    meta: { difficulty: "Intermediate", datasets: ["PTB-XL", "MIMIC-III"] },
  },
  {
    category: "Diabetes & Metabolic Disorders",
    color: "from-amber-50 to-amber-100",
    headerColor: "text-amber-700",
    icon: BeakerIcon,
    dataTypes: ["Blood tests (glucose, HbA1c)", "Demographics", "Lifestyle"],
    mlTasks: ["Risk prediction", "Early diagnosis", "Complication detection"],
    examples: [
      "Type 2 diabetes",
      "Gestational diabetes",
      "Diabetic retinopathy",
      "Obesity-related complications",
    ],
    meta: { difficulty: "Beginner", datasets: ["NHANES", "UK Biobank"] },
  },
  {
    category: "Respiratory Diseases",
    color: "from-sky-50 to-sky-100",
    headerColor: "text-sky-700",
    icon: PhotoIcon,
    dataTypes: ["Chest X-rays", "CT scans", "Spirometry", "Symptoms"],
    mlTasks: ["Image classification", "Anomaly detection"],
    examples: [
      "Pneumonia",
      "COPD",
      "Asthma prediction",
      "COVID-19 detection",
      "Tuberculosis",
    ],
    meta: { difficulty: "Advanced", datasets: ["NIH ChestX-ray14", "COVIDx"] },
  },
  {
    category: "Neurological Disorders",
    color: "from-violet-50 to-violet-100",
    headerColor: "text-violet-700",
    icon: CpuChipIcon,
    dataTypes: ["MRI", "EEG", "Clinical assessments"],
    mlTasks: ["Early detection", "Image segmentation", "Progression prediction"],
    examples: [
      "Alzheimer’s disease",
      "Parkinson’s disease",
      "Epilepsy",
      "Stroke risk assessment",
    ],
    meta: { difficulty: "Advanced", datasets: ["ADNI", "TUH EEG"] },
  },
  {
    category: "Cancer Detection",
    color: "from-pink-50 to-pink-100",
    headerColor: "text-pink-700",
    icon: PhotoIcon,
    dataTypes: ["Medical imaging", "Genomics", "Pathology slides"],
    mlTasks: ["Classification", "Segmentation", "Survival prediction"],
    examples: [
      "Breast cancer",
      "Lung cancer",
      "Skin cancer",
      "Colorectal cancer",
      "Prostate cancer",
    ],
    meta: { difficulty: "Advanced", datasets: ["TCGA", "Camelyon16"] },
  },
  {
    category: "Infectious Diseases",
    color: "from-emerald-50 to-emerald-100",
    headerColor: "text-emerald-700",
    icon: BeakerIcon,
    dataTypes: ["Lab tests", "Vitals", "Imaging", "Symptom checklists"],
    mlTasks: ["Early detection", "Outbreak prediction"],
    examples: ["COVID-19", "Influenza", "Malaria", "Tuberculosis"],
    meta: { difficulty: "Intermediate", datasets: ["WHO", "OpenCOVID"] },
  },
];

function MedPredictDashboard() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return diseaseData;
    return diseaseData.filter((d) =>
      d.category.toLowerCase().includes(q) ||
      d.dataTypes.some((t) => t.toLowerCase().includes(q)) ||
      d.mlTasks.some((t) => t.toLowerCase().includes(q)) ||
      d.examples.some((e) => e.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Disease ML Categories</h1>
          <div className="relative w-full max-w-2xl">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories, data types, tasks, or examples..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d, idx) => (
            <Card key={idx} {...d} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Step-based MedPredict UI (default export) ---
const diseaseCategories = [
  "Cardiovascular Diseases",
  "Diabetes & Metabolic Disorders",
  "Respiratory Diseases",
  "Cancer Detection",
  "Infectious Diseases",
];

const MedPredict = () => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePredict = () => {
    setResult({
      summary: `Prediction for ${category}`,
      details: "High confidence result based on input data.",
      riskScore: Math.floor(Math.random() * 100),
    });
    setStep(3);
  };

  const renderDynamicInputs = () => {
    switch (category) {
      case "Diabetes & Metabolic Disorders":
        return (
          <>
            <input type="number" name="glucose" placeholder="Blood Glucose (mg/dL)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <input type="number" name="hba1c" placeholder="HbA1c (%)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <input type="text" name="lifestyle" placeholder="Lifestyle (e.g., Sedentary, Active)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
          </>
        );
      case "Respiratory Diseases":
        return (
          <>
            <input type="file" name="chestImage" accept="image/*" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <input type="file" name="ctScan" accept="image/*" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <textarea name="symptoms" placeholder="List symptoms (e.g., cough, shortness of breath)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
          </>
        );
      case "Cancer Detection":
        return (
          <>
            <input type="file" name="pathologyImage" accept="image/*" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <input type="file" name="genomicData" accept=".csv,.json" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <select name="cancerType" onChange={handleInputChange} className="w-full border rounded px-3 py-2">
              <option value="">Select Cancer Type</option>
              <option>Breast Cancer</option>
              <option>Lung Cancer</option>
              <option>Skin Cancer</option>
              <option>Colorectal Cancer</option>
              <option>Prostate Cancer</option>
            </select>
          </>
        );
      case "Infectious Diseases":
        return (
          <>
            <input type="file" name="labResults" accept=".pdf,.csv,.jpg,.png" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <input type="number" name="bodyTemp" placeholder="Body Temperature (°C)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
            <textarea name="symptoms" placeholder="Describe symptoms (e.g., fever, cough, fatigue)" onChange={handleInputChange} className="w-full border rounded px-3 py-2" />
          </>
        );
      default:
        return <p className="text-gray-500">Select a disease category to view specific input fields.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/src/assets/images/medpredict.png" alt="MedPredict" className="object-contain w-16 h-16 sm:w-20 sm:h-20" />
            <div className="flex flex-col">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">MedPredict AI</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-sm text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                  </svg>
                  Online
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Step 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-gray-900 font-semibold mb-4">Step 1: Select Disease Category</h2>
            <div className="space-y-3">
              {diseaseCategories.map((disease) => (
                <button
                  key={disease}
                  onClick={() => { setCategory(disease); setStep(2); setResult(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors
                    ${category === disease
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-gray-300 hover:border-gray-400"}
                  `}
                >
                  {/* Icon placeholder badge */}
                  <span className={`w-8 h-8 rounded-md flex items-center justify-center
                    ${category === disease ? "bg-white/20" : "bg-gray-100"}
                  `}>💠</span>
                  <span className="text-sm font-medium text-gray-900">{disease}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Middle: Step 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-gray-900 font-semibold mb-4">Step 2: Patient Information & Data Input</h2>
            {step >= 2 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="patientId" placeholder="Patient ID (Text input)" onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <input type="number" name="age" placeholder="Age (Years)" onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="gender" onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                  <input type="text" name="bloodPressure" placeholder="Blood Pressure (mmHg)" onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="number" name="cholesterol" placeholder="Cholesterol (mg/dL)" onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                {/* Drag & Drop placeholder */}
                <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4 text-sm text-gray-500">
                  Drag & Drop or Browse files (PDF, JPG, PNG)
                </div>

                {/* Disease-specific inputs */}
                <div className="pt-2">{renderDynamicInputs()}</div>

                <button onClick={handlePredict} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-semibold">
                  Analyze & Predict
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Please select a disease first.</p>
            )}
          </div>

          {/* Right: Step 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-gray-900 font-semibold mb-4">Step 3: Prediction Results</h2>
            {step === 3 && result ? (
              <div>
                <p className="text-gray-900 text-base font-semibold mb-2">{result.summary}</p>
                <p className="text-gray-700 mb-4">{result.details}</p>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Risk Score</div>
                  <div className="h-2 w-full bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded" style={{ width: `${result.riskScore}%` }} />
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">{result.riskScore}%</div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-500 mb-2">Key Contributing Factors</div>
                  <div className="space-y-2">
                    {["Age", "BP", "Lab", "Imaging"].map((k, i) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="w-16 text-xs text-gray-500">{k}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                          <div className={`h-2 ${i % 2 ? "bg-cyan-400" : "bg-blue-500"}`} style={{ width: `${25 + i * 15}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg">
                  Download Full Report (PDF)
                </button>
              </div>
            ) : (
              <div className="text-gray-500">Prediction will appear here after analysis.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedPredict;

function Section({ title, items }) {
  return (
    <div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{title}</div>
      <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Card({ category, dataTypes, mlTasks, examples, color, headerColor, icon: Icon, meta }) {
  return (
    <div className="group relative">
      <div className={`bg-gradient-to-b ${color} rounded-2xl p-1 transition-transform duration-200 group-hover:-translate-y-0.5`}>
        <div className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className={`text-lg font-bold ${headerColor}`}>{category}</div>
            <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center border border-gray-100">
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          <div className="space-y-4">
            <Section title="Data types" items={dataTypes} />
            <Section title="ML tasks" items={mlTasks} />
            <Section title="Common examples" items={examples} />
          </div>

          <div className="mt-4 text-xs text-gray-500">Hover for more</div>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute inset-x-3 -bottom-3 bg-white rounded-xl shadow-lg border border-gray-100 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800">Difficulty: {meta?.difficulty || "N/A"}</div>
            <div className="text-xs text-gray-500">Datasets: {(meta?.datasets || []).join(", ") || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
