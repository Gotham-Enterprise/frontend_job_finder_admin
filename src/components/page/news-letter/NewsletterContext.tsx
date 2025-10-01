import React, { useReducer, createContext, useContext, ReactNode } from "react";
import { NewsletterData, NewsletterStep, NewsletterStepType } from "./types";

interface NewsletterState {
  currentStep: number;
  steps: NewsletterStep[];
  newsletterData: NewsletterData;
  selectedTemplateId: string | null;
}

type NewsletterAction =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "UPDATE_STEP_STATUS"; payload: { stepId: number; isCompleted: boolean } }
  | { type: "UPDATE_NEWSLETTER_DATA"; payload: Partial<NewsletterData> }
  | { type: "SELECT_TEMPLATE"; payload: string }
  | { type: "RESET_NEWSLETTER" };

const initialSteps: NewsletterStep[] = [
  {
    id: 1,
    title: "Select Template",
    description: "Choose a template or start from scratch",
    isCompleted: false,
    isActive: true,
  },
  {
    id: 2,
    title: "Edit",
    description: "Customize your newsletter content",
    isCompleted: false,
    isActive: false,
  },
  {
    id: 3,
    title: "Inbox",
    description: "Review and test your newsletter",
    isCompleted: false,
    isActive: false,
  },
  {
    id: 4,
    title: "Send To",
    description: "Select your audience",
    isCompleted: false,
    isActive: false,
  },
  {
    id: 5,
    title: "Schedule",
    description: "Choose when to send",
    isCompleted: false,
    isActive: false,
  },
];

const initialNewsletterData: NewsletterData = {
  subject: "",
  fromName: "",
  fromAddress: "",
  sendTo: [],
  dontSendTo: [],
  status: "DRAFT",
  isTemplate: false,
  content: "",
};

const initialState: NewsletterState = {
  currentStep: 1,
  steps: initialSteps,
  newsletterData: initialNewsletterData,
  selectedTemplateId: null,
};

const newsletterReducer = (state: NewsletterState, action: NewsletterAction): NewsletterState => {
  switch (action.type) {
    case "SET_CURRENT_STEP":
      return {
        ...state,
        currentStep: action.payload,
        steps: state.steps.map((step) => ({
          ...step,
          isActive: step.id === action.payload,
        })),
      };

    case "UPDATE_STEP_STATUS":
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === action.payload.stepId ? { ...step, isCompleted: action.payload.isCompleted } : step
        ),
      };

    case "UPDATE_NEWSLETTER_DATA":
      return {
        ...state,
        newsletterData: {
          ...state.newsletterData,
          ...action.payload,
        },
      };

    case "SELECT_TEMPLATE":
      return {
        ...state,
        selectedTemplateId: action.payload,
      };

    case "RESET_NEWSLETTER":
      return initialState;

    default:
      return state;
  }
};

interface NewsletterContextType {
  state: NewsletterState;
  dispatch: React.Dispatch<NewsletterAction>;
  goToStep: (step: number) => void;
  completeStep: (stepId: number) => void;
  updateNewsletterData: (data: Partial<NewsletterData>) => void;
  selectTemplate: (templateId: string) => void;
  resetNewsletter: () => void;
}

const NewsletterContext = createContext<NewsletterContextType | undefined>(undefined);

interface NewsletterProviderProps {
  children: ReactNode;
}

export const NewsletterProvider: React.FC<NewsletterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(newsletterReducer, initialState);

  const goToStep = React.useCallback((step: number) => {
    dispatch({ type: "SET_CURRENT_STEP", payload: step });
  }, []);

  const completeStep = React.useCallback((stepId: number) => {
    dispatch({ type: "UPDATE_STEP_STATUS", payload: { stepId, isCompleted: true } });
  }, []);

  const updateNewsletterData = React.useCallback((data: Partial<NewsletterData>) => {
    dispatch({ type: "UPDATE_NEWSLETTER_DATA", payload: data });
  }, []);

  const selectTemplate = React.useCallback((templateId: string) => {
    dispatch({ type: "SELECT_TEMPLATE", payload: templateId });
  }, []);

  const resetNewsletter = React.useCallback(() => {
    dispatch({ type: "RESET_NEWSLETTER" });
  }, []);

  const contextValue: NewsletterContextType = {
    state,
    dispatch,
    goToStep,
    completeStep,
    updateNewsletterData,
    selectTemplate,
    resetNewsletter,
  };

  return <NewsletterContext.Provider value={contextValue}>{children}</NewsletterContext.Provider>;
};

export const useNewsletter = (): NewsletterContextType => {
  const context = useContext(NewsletterContext);
  if (!context) {
    throw new Error("useNewsletter must be used within a NewsletterProvider");
  }
  return context;
};
