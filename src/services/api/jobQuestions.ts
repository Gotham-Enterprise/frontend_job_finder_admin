import { apiGet } from './apiUtils';
import {ApiQuestion, CommonQuestionsResponse, QUESTION_TYPE_MAPPING, QUESTION_SUBTYPE_MAPPING} from '../types/jobQuestions';

export const jobQuestionsApi = {
  async getCommonQuestions(): Promise<CommonQuestionsResponse> {
    return apiGet<CommonQuestionsResponse>('/api/job-questions/common-questions');
  }
};
