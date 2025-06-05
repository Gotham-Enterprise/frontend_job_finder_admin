"use client";
import React from 'react';

interface EmployerQuestionAnswer {
    question: string;
    answers?: string[];
}

interface ApplicantQuestionsProps {
    employerQuestions: EmployerQuestionAnswer[];
}

export default function ApplicantQuestions({ employerQuestions }: ApplicantQuestionsProps) {
    if (!employerQuestions || employerQuestions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employer Questions & Answers</h2>
            </div>

            <div className="space-y-6">
                {employerQuestions.map((qa, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="mb-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Q{index + 1}: {qa.question}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {qa.answers && qa.answers.length > 0 ? (
                                qa.answers.map((answer, answerIndex) => (
                                    <div key={answerIndex} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                            <span className="font-medium text-gray-900 dark:text-white">A{answerIndex + 1}:</span> {answer}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                                        No answer provided
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
