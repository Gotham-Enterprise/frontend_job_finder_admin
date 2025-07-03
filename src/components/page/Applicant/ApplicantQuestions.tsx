"use client";
import React from 'react';
import Accordion from '@/components/ui/accordion/Accordion';
import { formatDateCustom, isValidDate, formatDateTime } from '@/services/utils/dateUtils';
import { EmployerQuestionAnswer, ApplicantQuestionsProps } from '@/services/types/applicant';

export default function ApplicantQuestions({ employerQuestions }: ApplicantQuestionsProps) {
   
    
    if (!employerQuestions || employerQuestions.length === 0) {
        console.log('No employer questions found');
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Employer Questions & Answers
                    </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No employer questions available
                </p>
            </div>
        );
    }

    const validQuestions = employerQuestions.filter(qa => 
        qa && typeof qa === 'object'
    );



    if (validQuestions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Employer Questions & Answers
                    </h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No valid employer questions found
                </p>
            </div>
        );
    }

    const getAnswersToRender = (qa: EmployerQuestionAnswer): string[] => {
        if (qa.answers && Array.isArray(qa.answers) && qa.answers.length > 0) {
            return qa.answers.map(ans => 
                typeof ans === 'string' ? ans : 
                (ans && typeof ans === 'object' && 'answer' in ans) ? ans.answer : 
                JSON.stringify(ans)
            );
        }
        
        if (qa.answer) {
            if (typeof qa.answer === 'string') {
                return [qa.answer];
            }
            
            if (typeof qa.answer === 'object') {
                if (qa.answer && 'answer' in qa.answer) {
                    return [String((qa.answer as any).answer)];
                }
                return [JSON.stringify(qa.answer)];
            }
            
            return [String(qa.answer)];
        }
        
        return [];
    };

    const renderAnswers = (answers: string[]) => {
        if (answers.length === 0) {
            return (
                <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                        No answer provided
                    </p>
                </div>
            );
        }

        const formatAnswerIfDate = (answer: string) => {
            if (isValidDate(answer)) {
                return formatDateTime(answer, answer);
            }
            return answer;
        };

        return answers.map((answer, answerIndex) => (
            <div key={answerIndex} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600 mb-2">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    <span className="font-medium text-gray-900 dark:text-white">
                        A{answerIndex + 1}:
                    </span>{' '}
                    {formatAnswerIfDate(answer)}
                </p>
            </div>
        ));
    };

    const accordionItems = validQuestions.map((qa, index) => {
        const answersToRender = getAnswersToRender(qa);
        
        return {
            id: `question-${index}`,
            trigger: (
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        Q{index + 1}: {qa.question || 'No questionn provided'}
                    </h4>
                </div>
            ),
            content: (
                <div className="space-y-2">
                    {renderAnswers(answersToRender)}
                </div>
            )
        };
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Employer Questions & Answers
                </h2>
            </div>
            
            <Accordion 
                items={accordionItems}
                type="multiple"
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            />
        </div>
    );
}
