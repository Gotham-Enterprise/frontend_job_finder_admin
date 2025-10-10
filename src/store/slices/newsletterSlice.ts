import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NewsletterStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface NewsletterData {
  // Template Selection (Step 1)
  selectedTemplateId: string | null;

  // Edit Step (Step 2)
  content: string;
  design?: any; // Email editor design JSON

  // Inbox Step (Step 3)
  subject: string;
  fromName: string;
  fromAddress: string;

  // Send To Step (Step 4)
  sendTo: string[];
  dontSendTo: string[];

  // Schedule Step (Step 5)
  status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
  scheduledAt?: string;
  scheduledTimezone?: string;
  isTemplate: boolean;
}

interface NewsletterState {
  currentStep: number;
  steps: NewsletterStep[];
  data: NewsletterData;
  isSubmitting: boolean;
  error: string | null;
}

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

const initialData: NewsletterData = {
  selectedTemplateId: null,
  content: "",
  design: null,
  subject: "",
  fromName: "",
  fromAddress: "",
  sendTo: [],
  dontSendTo: [],
  status: "DRAFT",
  isTemplate: false,
};

const initialState: NewsletterState = {
  currentStep: 1,
  steps: initialSteps,
  data: initialData,
  isSubmitting: false,
  error: null,
};

const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    // Step Navigation
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
      state.steps = state.steps.map((step) => ({
        ...step,
        isActive: step.id === action.payload,
      }));
    },

    goToNextStep: (state) => {
      if (state.currentStep < state.steps.length) {
        // Mark current step as completed
        state.steps[state.currentStep - 1].isCompleted = true;
        // Move to next step
        state.currentStep += 1;
        state.steps = state.steps.map((step) => ({
          ...step,
          isActive: step.id === state.currentStep,
        }));
      }
    },

    goToPreviousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        state.steps = state.steps.map((step) => ({
          ...step,
          isActive: step.id === state.currentStep,
        }));
      }
    },

    completeStep: (state, action: PayloadAction<number>) => {
      const step = state.steps.find((s) => s.id === action.payload);
      if (step) {
        step.isCompleted = true;
      }
    },

    // Template Selection (Step 1)
    setSelectedTemplate: (state, action: PayloadAction<string>) => {
      state.data.selectedTemplateId = action.payload;
    },

    // Edit Step (Step 2)
    setContent: (state, action: PayloadAction<string>) => {
      state.data.content = action.payload;
    },

    setDesign: (state, action: PayloadAction<any>) => {
      state.data.design = action.payload;
    },

    // Inbox Step (Step 3)
    setInboxDetails: (
      state,
      action: PayloadAction<{
        subject: string;
        fromName: string;
        fromAddress: string;
      }>
    ) => {
      state.data.subject = action.payload.subject;
      state.data.fromName = action.payload.fromName;
      state.data.fromAddress = action.payload.fromAddress;
    },

    // Send To Step (Step 4)
    setSendToDetails: (
      state,
      action: PayloadAction<{
        sendTo: string[];
        dontSendTo?: string[];
      }>
    ) => {
      state.data.sendTo = action.payload.sendTo;
      state.data.dontSendTo = action.payload.dontSendTo || [];
    },

    // Schedule Step (Step 5)
    setScheduleDetails: (
      state,
      action: PayloadAction<{
        status: "DRAFT" | "SCHEDULED" | "SENT" | "ARCHIVED";
        scheduledAt?: string;
        scheduledTimezone?: string;
        isTemplate: boolean;
      }>
    ) => {
      state.data.status = action.payload.status;
      state.data.scheduledAt = action.payload.scheduledAt;
      state.data.scheduledTimezone = action.payload.scheduledTimezone;
      state.data.isTemplate = action.payload.isTemplate;
    },

    // Bulk update newsletter data
    updateNewsletterData: (state, action: PayloadAction<Partial<NewsletterData>>) => {
      state.data = {
        ...state.data,
        ...action.payload,
      };
    },

    // Submission states
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset newsletter
    resetNewsletter: () => initialState,
  },
});

export const {
  setCurrentStep,
  goToNextStep,
  goToPreviousStep,
  completeStep,
  setSelectedTemplate,
  setContent,
  setDesign,
  setInboxDetails,
  setSendToDetails,
  setScheduleDetails,
  updateNewsletterData,
  setSubmitting,
  setError,
  resetNewsletter,
} = newsletterSlice.actions;

export default newsletterSlice.reducer;
