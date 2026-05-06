import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../assets/Results.css';

const Results = ({ results, patientData, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info'
  });

  const showModal = (title, message, variant = 'info') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      variant
    });
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const getModalIcon = (variant) => {
    switch (variant) {
      case 'success':
        return '✓';
      case 'warning':
        return '!';
      case 'error':
        return '✕';
      default:
        return 'i';
    }
  };

  const getRiskLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#dc3545';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#28a745';
      default:
        return '#007bff';
    }
  };

  const getRiskLevelBg = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '#ffe5e5';
      case 'medium':
        return '#fff3cd';
      case 'low':
        return '#e8f5e9';
      default:
        return '#e3f2fd';
    }
  };

  const getMissingPatientFields = () => {
    const requiredFields = [
      { key: 'name', label: 'Patient Name' },
      { key: 'age', label: 'Age' },
      { key: 'email', label: 'Email' },
      { key: 'contactNumber', label: 'Contact Number' },
      { key: 'address', label: 'Address' }
    ];

    return requiredFields
      .filter(({ key }) => {
        const value = patientData?.[key];
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        return false;
      })
      .map(({ label }) => label);
  };

  const handleDownload = async () => {
    const missingFields = getMissingPatientFields();

    if (missingFields.length > 0) {
      showModal(
        'Incomplete Patient Details',
        '',
        'warning'
      );
      return;
    }

    setIsDownloading(true);
    
    try {
      const doc = createReportDocument();
      const fileName = `Heart_Attack_Risk_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      showModal('Download Complete', 'PDF report downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error downloading report:', err);
      showModal('Download Failed', 'Failed to download report. Please try again.', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const buildAnalysisSummary = (riskLevel) => {
    const normalizedRisk = riskLevel?.toLowerCase();

    if (normalizedRisk === 'high') {
      return 'The scan shows a high risk for heart problems. Please see a doctor soon for further tests.';
    }

    if (normalizedRisk === 'medium') {
      return 'The scan shows a medium level of risk. A doctor review, healthy lifestyle changes, and follow-up are recommended.';
    }

    if (normalizedRisk === 'low') {
      return 'The scan shows a low level of risk. Continue regular checkups and maintain healthy habits.';
    }

    return 'The scan result is unclear. Please consult a doctor before making any medical decisions.';
  };

  const createReportDocument = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();
    const safeRecommendations = results?.recommendations?.length
      ? results.recommendations
      : ['Continue routine follow-up with a qualified clinician.', 'Repeat screening if symptoms change or if new risk factors emerge.'];
    const analysisSummary = buildAnalysisSummary(results?.riskLevel);

    doc.setProperties({
      title: 'Heart Attack Risk Prediction Report',
      subject: 'Clinical risk assessment report',
      author: 'Heart Attack Risk Prediction System',
      creator: 'Heart Attack Risk Prediction System'
    });

    const addPageHeader = (pageNumber) => {
      doc.setDrawColor(60, 58, 179);
      doc.setFillColor(245, 247, 255);
      doc.roundedRect(margin, 12, contentWidth, 36, 3, 3, 'F');

      doc.setTextColor(36, 42, 66);
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.text('Heart Attack Risk Prediction Report', pageWidth / 2, 25, { align: 'center' });

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(85, 90, 110);
      doc.text('Clinical Risk Assessment Summary', pageWidth / 2, 31.5, { align: 'center' });

      doc.setDrawColor(179, 58, 58);
      doc.line(margin, 37, pageWidth - margin, 37);

      doc.setFontSize(9);
      doc.setTextColor(92, 99, 115);
      doc.text(`Report ID: HARP-${now.getTime().toString().slice(-8)}`, margin, 44);
      doc.text(`Generated: ${reportDate} at ${reportTime}`, pageWidth - margin, 44, { align: 'right' });
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
      doc.text('Heart Lens', margin, pageHeight - 8);
    };

    const ensureSpace = (cursorY, requiredHeight) => {
      const maxY = pageHeight - 30;
      if (cursorY + requiredHeight > maxY) {
        return maxY - requiredHeight;
      }
      return cursorY;
    };

    const drawSectionTitle = (title, cursorY) => {
      cursorY = ensureSpace(cursorY, 18);
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(36, 42, 66);
      doc.text(title, margin, cursorY);
      doc.setDrawColor(205, 210, 225);
      doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
      return cursorY + 8;
    };

    const drawParagraph = (text, cursorY) => {
      const lines = doc.splitTextToSize(text, contentWidth);
      const height = lines.length * 5;
      cursorY = ensureSpace(cursorY, height + 3);
      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(55, 60, 75);
      doc.text(lines, margin, cursorY);
      return cursorY + height + 1;
    };

    const drawMetricCard = (x, y, width, label, value, accent) => {
      doc.setFillColor(250, 252, 255);
      doc.setDrawColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(x, y, width, 22, 2, 2, 'FD');
      doc.setFont('times', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(90, 98, 118);
      doc.text(label.toUpperCase(), x + 4, y + 7);
      doc.setFontSize(13);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(String(value), x + 4, y + 16);
    };

    const drawBulletList = (items, cursorY) => {
      items.forEach((item, index) => {
        const bulletText = `${index + 1}. ${item}`;
        const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
        cursorY = ensureSpace(cursorY, lines.length * 5 + 2);
        doc.setFont('times', 'normal');
        doc.setFontSize(10.3);
        doc.setTextColor(55, 60, 75);
        doc.text(lines, margin + 3, cursorY);
        cursorY += lines.length * 5 + 1;
      });
      return cursorY;
    };

    addPageHeader(1);

    let cursorY = 56;

    doc.setFont('times', 'normal');
    doc.setFontSize(10.2);
    doc.setTextColor(60, 66, 82);
    const summaryLines = doc.splitTextToSize(analysisSummary, contentWidth);
    doc.text(summaryLines, margin, cursorY);
    cursorY += summaryLines.length * 5 + 8;

    cursorY = drawSectionTitle('1. Patient Information', cursorY);
    autoTable(doc, {
      startY: cursorY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: {
        font: 'times',
        fontSize: 10,
        cellPadding: 3,
        textColor: [45, 53, 72],
        lineColor: [220, 225, 235],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [62, 58, 179],
        textColor: 255,
        fontStyle: 'bold'
      },
      body: [
        ['Patient Name', patientData?.name || 'Not provided'],
        ['Age', patientData?.age ? `${patientData.age} years` : 'Not provided'],
        ['Email', patientData?.email || 'Not provided'],
        ['Contact Number', patientData?.contactNumber || 'Not provided'],
        ['Address', patientData?.address || 'Not provided']
      ],
      columnStyles: {
        0: { cellWidth: 48, fontStyle: 'bold', fillColor: [248, 250, 253] }
      }
    });

    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 10;
    cursorY = drawSectionTitle('2. Results', cursorY);

    const riskTone = getRiskLevelColor(results?.riskLevel);
    const riskAccent = riskTone === '#dc3545'
      ? [220, 53, 69]
      : riskTone === '#ffc107'
        ? [214, 158, 0]
        : [40, 167, 69];
    const neutralAccent = [62, 58, 179];
    const cardWidth = (contentWidth - 8) / 3;
    drawMetricCard(margin, cursorY, cardWidth, 'Risk Level', results?.riskLevel || 'Unknown', riskAccent);
    drawMetricCard(margin + cardWidth + 4, cursorY, cardWidth, 'Risk Score', `${results?.riskScore ?? 'N/A'}%`, neutralAccent);
    drawMetricCard(margin + (cardWidth + 4) * 2, cursorY, cardWidth, 'Confidence', `${results?.confidence ?? 'N/A'}%`, [179, 58, 58]);
    cursorY += 30;

    cursorY = drawSectionTitle('3. Recommendations', cursorY);
    cursorY = drawBulletList(safeRecommendations, cursorY);

    return doc;
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Analysis Results</h1>
        <p>Heart Attack Risk Prediction Report</p>
      </div>

      <div className="results-grid">
        {/* Risk Level Card */}
        <div 
          className="result-card risk-card"
          style={{ backgroundColor: getRiskLevelBg(results?.riskLevel) }}
        >
          <div className="card-icon">⚠️</div>
          <h3>Risk Level</h3>
          <p 
            className="risk-level"
            style={{ color: getRiskLevelColor(results?.riskLevel) }}
          >
            {results?.riskLevel}
          </p>
        </div>

        {/* Risk Score Card */}
        <div className="result-card score-card">
          <div className="card-icon">📊</div>
          <h3>Risk Score</h3>
          <div className="score-circle">
            <svg viewBox="0 0 100 100" className="score-svg">
              <circle cx="50" cy="50" r="45" className="score-bg" />
              <circle
                cx="50"
                cy="50"
                r="45"
                className="score-progress"
                style={{
                  strokeDasharray: `${(results?.riskScore / 100) * 282.7} 282.7`
                }}
              />
            </svg>
            <p className="score-text">{results?.riskScore}%</p>
          </div>
        </div>

        {/* Confidence Card */}
        <div className="result-card confidence-card">
          <div className="card-icon">✓</div>
          <h3>Confidence Level</h3>
          <p className="confidence-value">{results?.confidence}%</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="patient-summary">
        <h2>Patient Summary</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Patient Name</span>
            <span className="summary-value">{patientData?.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Age</span>
            <span className="summary-value">{patientData?.age} years</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Email</span>
            <span className="summary-value">{patientData?.email}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Contact</span>
            <span className="summary-value">{patientData?.contactNumber}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Address</span>
            <span className="summary-value">{patientData?.address}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Analysis Date</span>
            <span className="summary-value">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Analysis Message, Recommendations and Risk Indicators removed per request */}

      {/* Actions */}
      <div className="results-actions">
        <button 
          className="btn btn-primary"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <span className="spinner"></span>
              Generating Report...
            </>
          ) : (
            '📥 Download PDF Report'
          )}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={onReset}
        >
          🔄 Start New Scan
        </button>
      </div>

      {modalConfig.isOpen && (
        <div className="results-modal-overlay" onClick={closeModal}>
          <div
            className={`results-modal results-modal-${modalConfig.variant} ${modalConfig.message ? '' : 'results-modal-singleline'}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="results-modal-title"
          >
            <button className="results-modal-close" onClick={closeModal} aria-label="Close alert">
              x
            </button>
            <div className="results-modal-header">
              <span className={`results-modal-icon results-modal-icon-${modalConfig.variant}`}>
                {getModalIcon(modalConfig.variant)}
              </span>
              <div className="results-modal-content">
                <h3 id="results-modal-title">{modalConfig.title}</h3>
                {modalConfig.message ? <p>{modalConfig.message}</p> : null}
              </div>
              <button className="results-modal-btn" onClick={closeModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
