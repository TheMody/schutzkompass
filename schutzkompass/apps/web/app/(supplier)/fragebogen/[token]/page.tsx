'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import { Shield, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Send, Loader2 } from 'lucide-react';
import { QUESTIONNAIRE, type QuestionnaireQuestion } from '@/lib/constants/suppliers';
import { getSupplierByToken, submitQuestionnaireResponses, type QuestionnaireResponse } from '@/lib/actions/suppliers';

type AnswerValue = 'yes' | 'no' | 'partial' | 'not_applicable';

interface AnswerState {
  answer: AnswerValue | null;
  comment: string;
}

const ANSWER_OPTIONS: { value: AnswerValue; label: string; color: string }[] = [
  { value: 'yes', label: 'Ja', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'partial', label: 'Teilweise', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'no', label: 'Nein', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'not_applicable', label: 'N/A', color: 'bg-gray-100 text-gray-600 border-gray-300' },
];

export default function SupplierQuestionnairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Group questions by category
  const categories = QUESTIONNAIRE.reduce<Record<string, QuestionnaireQuestion[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});
  const categoryNames = Object.keys(categories);

  useEffect(() => {
    async function validate() {
      const result = await getSupplierByToken(token);
      if (!result) {
        setInvalidToken(true);
      } else if (result.status === 'completed') {
        setSupplierName(result.supplierName);
        setAlreadyCompleted(true);
      } else {
        setSupplierName(result.supplierName);
        // Expand all categories by default
        setExpandedCategories(new Set(categoryNames));
      }
      setLoading(false);
    }
    validate();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const setAnswer = useCallback((key: string, answer: AnswerValue) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: { ...prev[key], answer, comment: prev[key]?.comment || '' },
    }));
  }, []);

  const setComment = useCallback((key: string, comment: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: { ...prev[key], comment, answer: prev[key]?.answer || null },
    }));
  }, []);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const answeredCount = Object.values(answers).filter((a) => a.answer !== null).length;
  const totalQuestions = QUESTIONNAIRE.length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  const handleSubmit = async () => {
    // Check all questions answered
    const unanswered = QUESTIONNAIRE.filter((q) => !answers[q.key]?.answer);
    if (unanswered.length > 0) {
      setSubmitError(`Bitte beantworten Sie alle Fragen. ${unanswered.length} Fragen sind noch offen.`);
      // Expand categories with unanswered questions
      const catsWithUnanswered = new Set(unanswered.map((q) => q.category));
      setExpandedCategories((prev) => new Set([...prev, ...catsWithUnanswered]));
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    const responses: QuestionnaireResponse[] = QUESTIONNAIRE.map((q) => ({
      questionKey: q.key,
      answer: answers[q.key].answer!,
      comment: answers[q.key].comment || '',
    }));

    const result = await submitQuestionnaireResponses(token, responses);

    if (result.success) {
      setSubmitted(true);
      setScore(result.score);
    } else {
      setSubmitError(result.error || 'Ein Fehler ist aufgetreten.');
    }
    setSubmitting(false);
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Fragebogen wird geladen…</p>
      </div>
    );
  }

  // ── Invalid Token ──
  if (invalidToken) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-xl font-bold">Ungültiger Link</h1>
          <p className="mt-2 text-muted-foreground">
            Dieser Fragebogen-Link ist ungültig oder abgelaufen. Bitte kontaktieren Sie Ihren Ansprechpartner.
          </p>
        </div>
      </div>
    );
  }

  // ── Already Completed ──
  if (alreadyCompleted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-xl font-bold">Bereits eingereicht</h1>
          <p className="mt-2 text-muted-foreground">
            {supplierName}, dieser Fragebogen wurde bereits ausgefüllt und eingereicht. Vielen Dank!
          </p>
        </div>
      </div>
    );
  }

  // ── Submitted Successfully ──
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-lg border border-success/30 bg-success/5 p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-xl font-bold">Vielen Dank!</h1>
          <p className="mt-2 text-muted-foreground">
            Ihre Antworten wurden erfolgreich eingereicht.
          </p>
          {score !== null && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium shadow-sm border">
              <Shield className="h-4 w-4 text-primary" />
              Sicherheitsbewertung: <span className="font-bold text-primary">{score}/100</span>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Sie können dieses Fenster nun schließen.
          </p>
        </div>
      </div>
    );
  }

  // ── Main Questionnaire ──
  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Header */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Lieferanten-Sicherheitsbewertung</h1>
            <p className="text-muted-foreground">
              Fragebogen für <span className="font-medium text-foreground">{supplierName}</span>
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Bitte beantworten Sie die folgenden {totalQuestions} Fragen zu Ihrer Informationssicherheitspraxis.
          Ihre Antworten werden vertraulich behandelt und zur Bewertung der Lieferkettensicherheit verwendet.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{answeredCount} von {totalQuestions} Fragen beantwortet</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Categories */}
      {categoryNames.map((cat, catIdx) => {
        const questions = categories[cat];
        const isExpanded = expandedCategories.has(cat);
        const catAnswered = questions.filter((q) => answers[q.key]?.answer).length;
        const allAnswered = catAnswered === questions.length;

        return (
          <div key={cat} className="rounded-lg border bg-card shadow-sm overflow-hidden">
            {/* Category Header */}
            <button
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              onClick={() => toggleCategory(cat)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {catIdx + 1}
                </span>
                <div>
                  <span className="font-semibold">{cat}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({catAnswered}/{questions.length})
                  </span>
                </div>
                {allAnswered && <CheckCircle className="h-4 w-4 text-success" />}
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {/* Questions */}
            {isExpanded && (
              <div className="border-t divide-y">
                {questions.map((q, qIdx) => {
                  const currentAnswer = answers[q.key]?.answer || null;
                  const currentComment = answers[q.key]?.comment || '';

                  return (
                    <div key={q.key} className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {qIdx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{q.textDe}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{q.textEn}</p>
                        </div>
                        {/* Weight indicator */}
                        <div className="flex items-center gap-0.5 shrink-0" title={`Gewichtung: ${q.weight}/5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-1.5 rounded-full ${i < q.weight ? 'bg-primary' : 'bg-muted'}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Answer Buttons */}
                      <div className="flex flex-wrap gap-2 ml-8">
                        {ANSWER_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            className={`rounded-md border px-3 py-1 text-xs font-medium transition-all ${
                              currentAnswer === opt.value
                                ? `${opt.color} ring-2 ring-offset-1 ring-primary/30`
                                : 'bg-card text-muted-foreground border-border hover:bg-muted'
                            }`}
                            onClick={() => setAnswer(q.key, opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Optional Comment */}
                      {currentAnswer && (
                        <div className="ml-8">
                          <input
                            type="text"
                            placeholder="Optionaler Kommentar…"
                            value={currentComment}
                            onChange={(e) => setComment(q.key, e.target.value)}
                            className="w-full rounded-md border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Submit Section */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {submitError && (
          <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {answeredCount === totalQuestions ? (
              <span className="text-success font-medium">✓ Alle Fragen beantwortet</span>
            ) : (
              <span>{totalQuestions - answeredCount} Fragen noch offen</span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'Wird eingereicht…' : 'Fragebogen einreichen'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground">
        <p>Powered by <span className="font-medium text-primary">SchutzKompass</span> — NIS2 & CRA Compliance Platform</p>
        <p className="mt-1">Ihre Daten werden vertraulich behandelt und ausschließlich zur Sicherheitsbewertung verwendet.</p>
      </div>
    </div>
  );
}
