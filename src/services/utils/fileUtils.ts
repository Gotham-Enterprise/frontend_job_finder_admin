
export const getFileExtension = (fileName: string | undefined | null): string => {
  if (!fileName || typeof fileName !== 'string') return '';
  
  try {
    let fileNameOnly = fileName;
    
    if (fileName.includes('://')) {
      try {
        const url = new URL(fileName);
        fileNameOnly = url.pathname.split('/').pop() || '';
      } catch {
       
        fileNameOnly = fileName.split('/').pop() || '';
      }
    } else if (fileName.includes('/')) {
      fileNameOnly = fileName.split('/').pop() || '';
    }

    fileNameOnly = fileNameOnly.split('?')[0].split('#')[0];
    
    const parts = fileNameOnly.split('.');
    if (parts.length < 2) return '';
    
    const extension = parts.pop();
    return extension ? extension.toUpperCase() : '';
  } catch (error) {
    console.error('Error extracting file extension:', error);
    return '';
  }
};


export const shouldOpenInNewTab = (fileName: string | undefined | null): boolean => {
  const extension = getFileExtension(fileName);
  
  const viewableTypes = ['PDF', 'DOC', 'DOCX', 'JPEG', 'JPG', 'PNG', 'GIF', 'TXT'];
  
  return viewableTypes.includes(extension);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isDocumentType = (fileName?: string): boolean => {
  const extension = getFileExtension(fileName);
  return ['DOC', 'DOCX', 'PDF'].includes(extension);
};

// Helper function to get appropriate viewer URL for document types
export const getViewerUrl = (fileUrl: string, fileName?: string): string => {
  const extension = getFileExtension(fileName || fileUrl);
  
  if (['DOC', 'DOCX'].includes(extension)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  }
  
  return fileUrl;
};

// Enhanced file opening with retry logic and better error handling
export const openFileWithRetry = async (
  fileUrl: string, 
  fileName?: string, 
  options: {
    maxRetries?: number;
    retryDelay?: number;
    forceDownload?: boolean;
  } = {}
): Promise<void> => {
  const { maxRetries = 2, retryDelay = 1000, forceDownload = false } = options;
  
  if (!isValidUrl(fileUrl)) {
    throw new Error('Invalid file URL provided');
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (forceDownload) {
        // Force download instead of viewing
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'download';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      const extension = getFileExtension(fileName || fileUrl);
      
      if (['DOC', 'DOCX'].includes(extension)) {
        // For Word documents, try Google Viewer first
        const viewerUrl = getViewerUrl(fileUrl, fileName);
        const newWindow = window.open(viewerUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
        
        if (!newWindow) {
          throw new Error('Popup blocked or failed to open Google Viewer');
        }
        
        return;
      } else {
        // For other files, open directly
        const newWindow = window.open(fileUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
        
        if (!newWindow) {
          throw new Error('Popup blocked or failed to open file');
        }
        
        return;
      }
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === maxRetries) {
        try {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        } catch (fallbackError) {
          console.error('All attempts failed:', fallbackError);
          throw new Error(`Failed to open file after ${maxRetries + 1} attempts`);
        }
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
};

export const openFileInNewTab = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  // Validate URL format
  try {
    new URL(fileUrl);
  } catch (error) {
    console.error('Invalid file URL:', fileUrl);
    return;
  }

  try {
    const extension = getFileExtension(fileName || fileUrl);
    
    if (['DOC', 'DOCX'].includes(extension)) {

      const tryOpenWithGoogleViewer = () => {
        try {
          const googleViewerUrl = `https://docs.google.com/viewer?url=${fileUrl}&embedded=true`;

          
          const newWindow = window.open(googleViewerUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
          
          if (!newWindow) {
            throw new Error('Popup blocked or failed to open');
          }
          
        
          return true;
        } catch (error) {
          console.warn('Google Viewer failed:', error);
          return false;
        }
      };

      const openDirectDownload = (url: string, name?: string) => {
     
        const link = document.createElement('a');
        link.href = url;
        link.download = name || 'document';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      if (!tryOpenWithGoogleViewer()) {
        openDirectDownload(fileUrl, fileName);
      }
      
      return;
    }
    

    const newWindow = window.open(fileUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
    
    if (!newWindow) {
 
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
  } catch (error) {
    console.error('Error opening file:', error);
    // Ultimate fallback
    try {
      window.open(fileUrl, '_blank');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};


export const openFileWithEnhancedHandling = async (
  fileUrl: string,
  fileName?: string,
  apiCallback?: () => Promise<{ success: boolean; data?: { fileUrl: string } }>
): Promise<void> => {
  try {
    // First, try to get a fresh URL from API if callback is provided
    if (apiCallback) {
      try {
        const response = await apiCallback();
        if (response.success && response.data?.fileUrl) {
      
          openFileInNewTab(response.data.fileUrl, fileName);
          return;
        } else {
          console.warn('API callback did not return a valid file URL:', response);
        }
      } catch (apiError) {
        console.error('API callback failed:', apiError);
        // Continue to fallback
      }
    }

    // Fallback to provided URL
    if (fileUrl) {
      openFileInNewTab(fileUrl, fileName);
    } else {
    
      throw new Error('No file URL available');
    }
  } catch (error) {
    console.error('Enhanced file handling failed:', error);
    
    // Last resort: try direct URL opening
    if (fileUrl) {
      try {
        console.log('Last resort: trying direct URL opening');
        openFileInNewTab(fileUrl, fileName);
      } catch (finalError) {
        console.error('All file opening methods failed:', finalError);
        throw finalError;
      }
    } else {
      throw new Error('No file URL available for opening');
    }
  }
};


export const openInFullTab = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  // Validate URL format
  try {
    new URL(fileUrl);
  } catch (error) {
    console.error('Invalid file URL:', fileUrl);
    return;
  }

  try {
    // Method 1: Direct window.open with full screen dimensions
    const openFullWindow = () => {
      const newWindow = window.open(
        fileUrl, 
        '_blank', 
        `width=${screen.availWidth},height=${screen.availHeight},toolbar=yes,location=yes,directories=no,status=yes,menubar=yes,scrollbars=yes,copyhistory=no,resizable=yes,left=0,top=0`
      );
      
      if (newWindow) {
        newWindow.focus();
        return true;
      }
      return false;
    };

    // Method 2: Form-based opening (alternative approach)
    const openWithForm = () => {
      try {
        const form = document.createElement('form');
        form.method = 'GET';
        form.action = fileUrl;
        form.target = '_blank';
        form.style.display = 'none';
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        return true;
      } catch (error) {
        console.error('Form-based opening failed:', error);
        return false;
      }
    };

    if (!openFullWindow()) {

      
      if (!openWithForm()) {
     
      
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
    
  } catch (error) {
    console.error('Error opening file in full tab:', error);
    
    // Ultimate fallback
    try {
      window.open(fileUrl, '_blank');
    } catch (fallbackError) {
      console.error('Ultimate fallback failed:', fallbackError);
    }
  }
};
