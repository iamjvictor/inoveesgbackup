import { 
  diagnosticQuestions, 
  diagnosticSections,
  segmentQuestionsMap,
  segmentSectionsMap 
} from "../models/mock-data";

export function getDiagnosticOverviewViewModel(segment?: string) {
  const sections = (segment && segmentSectionsMap[segment]) || diagnosticSections;
  const answered = sections.reduce((acc, section) => acc + section.answered, 0);
  const total = sections.reduce((acc, section) => acc + section.total, 0);

  return {
    sections,
    progress: total > 0 ? Math.round((answered / total) * 100) : 0,
    answered,
    total,
  };
}

export function getDiagnosticRunViewModel(segment?: string) {
  const questions = (segment && segmentQuestionsMap[segment]) || diagnosticQuestions;
  return {
    questions,
    total: questions.length,
    answered: questions.filter((question) => question.answer.trim().length > 0).length,
  };
}

export function getDiagnosticReviewViewModel(segment?: string) {
  const questions = (segment && segmentQuestionsMap[segment]) || diagnosticQuestions;
  const missingAnswers = questions.filter((question) => question.answer.trim().length === 0);
  const missingEvidence = questions.filter(
    (question) => question.answer.trim().length > 0 && !question.hasEvidence
  );

  return {
    totalQuestions: questions.length,
    missingAnswers,
    missingEvidence,
  };
}
