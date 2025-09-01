
import { z } from 'zod';

export const teamMemberSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z.string()
    .min(1, 'Last name is required') 
    .min(2, 'Last name must be at least 2 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  companyRole: z.string()
    .min(1, 'Company role is required'),
  accessRoleId: z.string()
    .min(1, 'Access role is required'),
  address: z.string()
    .min(1, 'Address is required')
    .min(5, 'Address must be at least 5 characters'),
  city: z.string()
    .min(1, 'City is required')
    .min(2, 'City name must be at least 2 characters'),
  state: z.string()
    .min(1, 'State is required'),
  country: z.string().default('USA'),
  zipCode: z.string()
    .min(1, 'Zip code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid zip code (e.g., 12345 or 12345-6789)'),
});

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

export const validateTeamMemberForm = (data: TeamMemberFormData) => {
  try {
    teamMemberSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      return { success: false, errors: fieldErrors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};
