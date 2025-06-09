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
