import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Share2,
  Activity,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/common/GlassCard';
import { Badge } from '../components/common/Badge';

export const Reports: React.FC<{ onNavigate: (page: string) => void }> = () => {
  const { activePatient } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [therapistNotes, setTherapistNotes] = useState(
    "Patient demonstrates consistent bilateral knee symmetry (94%) and steady restoration of terminal extension. Prescribed protocol 3x/week maintained."
  );

  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });

      // Header Banner
      doc.setFillColor(16, 16, 37);
      doc.rect(0, 0, 612, 80, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(169, 122, 255);
      doc.setFontSize(22);
      doc.text('REHABAI PRO', 40, 42);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(220, 203, 255);
      doc.text('Rehabilitation Intelligence Platform', 40, 58);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text('CLINICAL SESSION REPORT', 420, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 220);
      doc.text(`UID: RPT-2026-808 | ${new Date().toLocaleDateString()}`, 420, 58);

      // Patient Info Section
      doc.setDrawColor(169, 122, 255);
      doc.setLineWidth(1.5);
      doc.line(40, 95, 572, 95);

      doc.setFontSize(10);
      doc.setTextColor(40, 40, 60);

      doc.setFont('helvetica', 'bold');
      doc.text('Patient Name:', 40, 120);
      doc.setFont('helvetica', 'normal');
      doc.text(activePatient.name, 130, 120);

      doc.setFont('helvetica', 'bold');
      doc.text('Physiotherapist:', 340, 120);
      doc.setFont('helvetica', 'normal');
      doc.text('Dr. Marcus Reynolds, DPT', 430, 120);

      doc.setFont('helvetica', 'bold');
      doc.text('Patient ID:', 40, 140);
      doc.setFont('helvetica', 'normal');
      doc.text(activePatient.patient_id_code, 130, 140);

      doc.setFont('helvetica', 'bold');
      doc.text('Condition:', 340, 140);
      doc.setFont('helvetica', 'normal');
      doc.text(activePatient.condition, 430, 140);

      doc.setFont('helvetica', 'bold');
      doc.text('Exercise:', 40, 160);
      doc.setFont('helvetica', 'normal');
      doc.text('Squat Rehabilitation (Closed-chain)', 130, 160);

      doc.setFont('helvetica', 'bold');
      doc.text('Duration:', 340, 160);
      doc.setFont('helvetica', 'normal');
      doc.text('3m 30s (10 reps completed)', 430, 160);

      // Biomechanical Telemetry Table Header
      doc.setFillColor(92, 59, 136);
      doc.rect(40, 185, 532, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Biomechanical Kinematic Metric', 50, 201);
      doc.text('Measured', 260, 201);
      doc.text('Target Goal', 370, 201);
      doc.text('Clinical Status', 470, 201);

      // Table Rows
      const rows = [
        ['Movement Quality Score', '94.5%', '>= 85.0%', 'Optimal Control'],
        ['Bilateral Symmetry Index', '93.8%', '>= 90.0%', 'Balanced Movement'],
        ['Peak Range of Motion (ROM)', '104.0°', '105.0°', 'Target Met (99%)'],
        ['Repetitions Completed', '10 / 10 reps', '10 reps', '100% Volume'],
        ['Average Movement Cadence', '2.4s', '2.0s – 3.0s', 'Consistent Tempo'],
        ['Pose Confidence Fidelity', '95.0%', '>= 80.0%', 'High Landmark Tracking']
      ];

      let yPos = 225;
      rows.forEach((r, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 254 : 255);
        doc.rect(40, yPos - 12, 532, 20, 'F');
        doc.setTextColor(40, 40, 50);
        doc.setFont('helvetica', 'bold');
        doc.text(r[0], 50, yPos + 2);
        doc.setFont('helvetica', 'normal');
        doc.text(r[1], 260, yPos + 2);
        doc.text(r[2], 370, yPos + 2);
        doc.text(r[3], 470, yPos + 2);
        yPos += 22;
      });

      // AI Synthesis Box
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 40, 100);
      doc.setFontSize(11);
      doc.text('Nova AI Kinematic Observations', 40, yPos);

      yPos += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 70);
      doc.setFontSize(9);
      const aiText = "Patient demonstrated consistent joint stability across all repetitions. Eccentric phase velocity remained steady without knee valgus deviation. Right knee extension matched left baseline within 3.5 degrees. Recommend progression to next resistance tier.";
      const splitAi = doc.splitTextToSize(aiText, 532);
      doc.text(splitAi, 40, yPos);

      // Clinician Notes
      yPos += (splitAi.length * 12) + 15;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 50);
      doc.setFontSize(11);
      doc.text('Physiotherapist Clinical Evaluation', 40, yPos);

      yPos += 14;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 70);
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(therapistNotes, 532);
      doc.text(splitNotes, 40, yPos);

      // Signature Block
      yPos += (splitNotes.length * 12) + 25;
      doc.setDrawColor(180, 180, 190);
      doc.line(40, yPos, 260, yPos);
      doc.line(340, yPos, 560, yPos);
      doc.setFontSize(8.5);
      doc.text('Clinician Signature: Dr. Marcus Reynolds, DPT', 40, yPos + 14);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 340, yPos + 14);

      // Safety Disclaimer Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 140, 150);
      doc.line(40, 730, 572, 730);
      const disclaimer = "SAFETY DISCLAIMER: RehabAI Pro is an AI-assisted movement analysis and rehabilitation logging software tool. It does NOT provide clinical diagnoses or replace evaluation by a licensed healthcare professional.";
      doc.text(doc.splitTextToSize(disclaimer, 532), 40, 742);

      doc.save(`RehabAI_Clinical_Report_${activePatient.patient_id_code}.pdf`);
      setIsGenerating(false);
    } catch (err) {
      console.error("PDF generation error:", err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-card/70 border border-bg-border rounded-2xl p-4 backdrop-blur-xl">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Clinical PDF Report Center</h2>
          <p className="text-xs text-slate-400">Generate high-fidelity physiotherapist summary reports</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rehab-purple to-rehab-cyan text-bg-darkest font-bold text-xs shadow-glow-purple hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download Clinical PDF'}</span>
          </button>
        </div>
      </div>

      {/* Visual Report Document Preview */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900 border-2 border-rehab-purple/30 p-8 shadow-2xl space-y-6 text-slate-200">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">REHABAI PRO</h1>
            <p className="text-xs uppercase font-bold text-rehab-purpleLight tracking-wider">Rehabilitation Intelligence Platform</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-extrabold text-white">CLINICAL SESSION REPORT</span>
            <p className="text-xs text-slate-400 font-mono">UID: RPT-2026-808 • {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Patient Name</span>
            <strong className="text-white text-sm">{activePatient.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Patient ID</span>
            <strong className="text-rehab-cyan font-mono text-sm">{activePatient.patient_id_code}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Condition</span>
            <strong className="text-slate-200">{activePatient.condition}</strong>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Therapist</span>
            <strong className="text-white">Dr. Marcus Reynolds, DPT</strong>
          </div>
        </div>

        {/* Telemetry Metrics Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Kinematic & Biomechanical Metrics</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-mono">
                <tr>
                  <th className="p-3">Biomechanical Metric</th>
                  <th className="p-3">Measured Value</th>
                  <th className="p-3">Target Goal</th>
                  <th className="p-3">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                <tr>
                  <td className="p-3 font-bold text-white">Movement Quality Score</td>
                  <td className="p-3 font-mono font-bold text-rehab-green">94.5%</td>
                  <td className="p-3 font-mono text-slate-400">&gt;= 85.0%</td>
                  <td className="p-3 text-rehab-green font-semibold">Optimal Control</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Bilateral Symmetry Index</td>
                  <td className="p-3 font-mono font-bold text-rehab-cyan">93.8%</td>
                  <td className="p-3 font-mono text-slate-400">&gt;= 90.0%</td>
                  <td className="p-3 text-rehab-cyan font-semibold">Balanced Movement</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Peak Range of Motion (ROM)</td>
                  <td className="p-3 font-mono font-bold text-rehab-purpleLight">104.0°</td>
                  <td className="p-3 font-mono text-slate-400">105.0°</td>
                  <td className="p-3 text-slate-200">Target Met (99%)</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-white">Repetitions Completed</td>
                  <td className="p-3 font-mono text-white">10 reps</td>
                  <td className="p-3 font-mono text-slate-400">10 reps</td>
                  <td className="p-3 text-rehab-green">Goal Met (100%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI & Therapist Notes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Observations & Clinical Synthesis</h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            Patient demonstrated consistent joint stability across all repetitions. Eccentric phase velocity remained steady without knee valgus deviation. Right knee extension matched left baseline within 3.5 degrees.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Physiotherapist Sign-off Notes</h3>
          <textarea
            value={therapistNotes}
            onChange={(e) => setTherapistNotes(e.target.value)}
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rehab-purple/60"
          />
        </div>

        {/* Safety Notice Footer */}
        <div className="pt-4 border-t border-slate-700 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-rehab-amber flex-shrink-0 mt-0.5" />
          <span>
            <strong>IMPORTANT SAFETY NOTICE:</strong> RehabAI Pro is an AI-assisted movement analysis and rehabilitation logging software tool. It does not provide medical diagnoses or replace direct clinical examination by a licensed healthcare clinician.
          </span>
        </div>
      </div>
    </div>
  );
};
