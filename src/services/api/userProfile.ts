export interface PersonalInformationFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class UserProfileService {
 
  static async uploadAvatar(formData: FormData): Promise<{ success: boolean; avatarUrl?: string }> {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  static async updatePersonalInfo(data: PersonalInformationFormData): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Personal info update error:', error);
      throw error;
    }
  }

 
  static async changePassword(data: ChangePasswordRequest): Promise<{ success: boolean }> {
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Password change failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

