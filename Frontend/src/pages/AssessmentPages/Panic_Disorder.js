import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import '../../Allcss/AssessmentPages/Assessment.css';

const questions = [
  "How often do you experience sudden panic attacks or episodes of intense fear?",
  "How much do you worry about having another panic attack?",
  "Have you changed your behavior or daily routine to avoid panic attacks?",
  "How often do you experience rapid heartbeat or heart palpitations during panic episodes?",
  "How often do you experience shortness of breath or difficulty breathing during panic episodes?",
  "How often do you experience trembling or shaking during panic episodes?",
  "How often do you experience sweating during panic episodes?",
  "How often do you feel like you're choking during panic episodes?",
  "How often do you experience chest pain or discomfort during panic episodes?",
  "How often do you feel dizzy, unsteady, or lightheaded during panic episodes?",
  "How often do you experience feelings of unreality or being detached from yourself during panic episodes?",
  "How often do you fear losing control or going crazy during panic episodes?",
  "How often do you experience numbness or tingling sensations during panic episodes?",
  "How often do you experience chills or hot flushes during panic episodes?"
];

const answerOptions = [
  { value: "0", label: "Not at all" },
  { value: "1", label: "Several days" },
  { value: "2", label: "More than half the days" },
  { value: "3", label: "Nearly every day" }
];

export default function Panic_Disorder() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const { userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => { setShowDisclaimer(true); }, []);

  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[currentQuestion] = value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const total = answers.reduce((sum, answer) => sum + parseInt(answer, 10), 0);
    const score = total / questions.length;

    let severity, recommendation;
    if (score < 1) {
      severity = "Minimal panic symptoms";
      recommendation = "Your symptoms suggest minimal indication of panic disorder. Continue monitoring your mental health.";
    } else if (score < 2) {
      severity = "Mild panic symptoms";
      recommendation = "You're showing mild symptoms of panic disorder. Consider discussing these symptoms with a mental health professional.";
    } else if (score < 3) {
      severity = "Moderate panic symptoms";
      recommendation = "Your symptoms suggest moderate panic disorder. It's recommended to consult with a mental health professional for further evaluation.";
    } else {
      severity = "Severe panic symptoms";
      recommendation = "Your symptoms indicate severe panic disorder. Please seek professional help for proper evaluation and support.";
    }

    setResult({
      severity,
      score: total,
      maxScore: questions.length * 3,
      recommendation
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleSaveScore = async () => {
    if (!userInfo || !userInfo.token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setSaveStatus('saving');
    const payload = {
      assessmentName: 'Panic Disorder Assessment',
      assessmentResult: result.severity,
      assessmentScore: `${result.score} out of ${result.maxScore}`,
      recommendation: result.recommendation,
      takenAt: new Date().toISOString(),
    };
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/addassesment/assessments`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`
          }
        }
      );
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  return (
    <div className="assessment-container">
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity animate-fadeIn"></div>
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 border border-gray-200 animate-scaleIn overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">⚠️ Disclaimer</h3>
            </div>
            <div className="px-6 py-5 text-gray-700 text-base leading-relaxed">
              <p>This assessment is based solely on your responses and is intended for informational purposes only. Please consult a qualified healthcare provider for a professional evaluation.</p>
              <p className="mt-3 text-sm text-gray-500">Use this tool as a starting point for self-awareness, not a diagnosis.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
              <button className="px-5 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all shadow-sm" onClick={() => { setShowDisclaimer(false); navigate('/assessment'); }}>Cancel</button>
              <button className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md" onClick={() => setShowDisclaimer(false)} autoFocus>Accept and Continue</button>
            </div>
          </div>
        </div>
      )}
      <div className={`assessment-card${showDisclaimer ? ' pointer-events-none opacity-30' : ''}`}>
        <div className="assessment-header panic">
          <h2 className="assessment-title">Panic Disorder Assessment</h2>
          <p className="assessment-subtitle">Rate how often you experience these symptoms during panic episodes.</p>
        </div>
        <div className="assessment-content">
          {result ? (
            <div className="result-container">
              <h3 className="result-title">Assessment Complete</h3>
              <div className="result-score">{result.severity}</div>
              <p className="result-details">Score: {result.score} out of {result.maxScore}</p>
              <div className="result-recommendation">
                <h4 className="recommendation-title">Recommendation</h4>
                <p className="recommendation-text">{result.recommendation}</p>
              </div>
              <p className="disclaimer">
                Note: This is a screening tool and not a diagnostic instrument. 
                Please consult with a mental health professional for a proper evaluation.
                If you're experiencing a panic attack, try deep breathing exercises and seek immediate help if needed.
              </p>
              <button className="next-button" onClick={handleSaveScore} style={{ marginTop: '1rem' }}>
                Save Score
              </button>
              {saveStatus === 'saving' && <p style={{ color: '#6366f1' }}>Saving...</p>}
              {saveStatus === 'success' && <p style={{ color: 'green' }}>Score saved successfully!</p>}
              {saveStatus === 'error' && <p style={{ color: 'red' }}>Failed to save score. Please try again.</p>}
            </div>
          ) : (
            <>
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="question-counter">Question {currentQuestion + 1} of {questions.length}</p>
              <div className="question">{questions[currentQuestion]}</div>
              <div className="options-grid">
                {answerOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`option-item ${answers[currentQuestion] === option.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option.value}
                      id={`q-${option.value}`}
                      checked={answers[currentQuestion] === option.value}
                      onChange={() => handleAnswer(option.value)}
                      className="radio-input"
                    />
                    <label htmlFor={`q-${option.value}`} className="option-label">
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="assessment-footer flex justify-between items-center gap-4 mt-4">
          {!result && (
            <>
              <button
                onClick={handleBack}
                className={`next-button bg-gray-300 text-gray-700 hover:bg-gray-400 transition duration-200 ${
                  currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={currentQuestion === 0}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="next-button hover:bg-green-600 transition duration-200"
                disabled={answers[currentQuestion] === undefined}
              >
                {currentQuestion < questions.length - 1 ? "Next Question" : "Submit"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
