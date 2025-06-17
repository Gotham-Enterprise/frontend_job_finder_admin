import { apiRequest } from './apiUtils';
import { getMockCommonQuestions } from '../mocks/jobQuestionsMocks';
import {ApiQuestion, CommonQuestionsResponse, QUESTION_TYPE_MAPPING, QUESTION_SUBTYPE_MAPPING} from '../types/jobQuestions';

export const jobQuestionsApi = {
  async getCommonQuestions(): Promise<CommonQuestionsResponse> {
    try {
      return await apiRequest<CommonQuestionsResponse>('/api/job_question_routes/common-questions', {
        method: 'GET',
      });
    } catch (error: any) {
      return getMockCommonQuestions();
    }
  }
};
