'use client';

import React, { useState, useCallback } from 'react';
import { cn } from './lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  onComplete?: () => void;
  isCompleting?: boolean;
  completeLabel?: string;
}

export function Wizard({
  steps,
  currentStep,
  onStepChange,
  children,
  onComplete,
  isCompleting = false,
  completeLabel = 'Abschließen',
}: WizardProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-8">
      {/* Step indicator */}
      <nav aria-label="Fortschritt">
        <ol className="flex items-center">
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center">
              <button
                onClick={() => index < currentStep && onStepChange(index)}
                disabled={index > currentStep}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  index === currentStep && 'bg-primary/10 font-medium text-primary',
                  index < currentStep && 'text-muted-foreground hover:text-foreground cursor-pointer',
                  index > currentStep && 'text-muted-foreground/50 cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                    index === currentStep && 'bg-primary text-primary-foreground',
                    index < currentStep && 'bg-primary/20 text-primary',
                    index > currentStep && 'bg-muted text-muted-foreground',
                  )}
                >
                  {index < currentStep ? '✓' : index + 1}
                </span>
                <span className="hidden sm:block">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-px w-8 sm:w-12',
                    index < currentStep ? 'bg-primary' : 'bg-muted',
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{steps[currentStep].title}</h2>
          {steps[currentStep].description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          )}
        </div>
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={isFirstStep}
          className={cn(
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
            isFirstStep
              ? 'cursor-not-allowed text-muted-foreground/50'
              : 'text-foreground hover:bg-muted',
          )}
        >
          ← Zurück
        </button>
        {isLastStep ? (
          <button
            onClick={onComplete}
            disabled={isCompleting}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isCompleting ? 'Wird gespeichert...' : completeLabel}
          </button>
        ) : (
          <button
            onClick={() => onStepChange(currentStep + 1)}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Weiter →
          </button>
        )}
      </div>
    </div>
  );
}

export function useWizard(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps],
  );

  const goNext = useCallback(() => {
    goToStep(currentStep + 1);
  }, [currentStep, goToStep]);

  const goBack = useCallback(() => {
    goToStep(currentStep - 1);
  }, [currentStep, goToStep]);

  return { currentStep, goToStep, goNext, goBack };
}
