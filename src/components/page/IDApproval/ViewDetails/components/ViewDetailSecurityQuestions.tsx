import { FC } from "react";

import { UseIdApprovalDetailLogic } from "@/services/types/idApproval";

interface Props {
  securityQuestions: UseIdApprovalDetailLogic["securityQuestions"];
}

const SecurityQuestions: FC<Props> = ({ securityQuestions = [] }) => {
  return (
    <div className="rounded-xl bg-white py-6 shadow-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex border-b-1 px-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security Questions</h3>
      </div>
      <div className="flex flex-col py-4 px-6">
        {securityQuestions.length > 0 ? (
          <ol>
            {securityQuestions.map(({ question, answer }, index) => (
              <li key={index} className="py-2 text-gray-900">
                <div>
                  <span className="font-bold">{index + 1}. Question: </span>
                  {question}
                </div>
                <div className="ml-[16px]">
                  <span className="font-bold">Answer: </span>
                  {answer}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <h2>No security questions available</h2>
        )}
      </div>
    </div>
  );
};

export default SecurityQuestions;
