
export const getFileExtension = (fileName: string | undefined | null): string => {
  if (!fileName) return '';
  

  const fileNameOnly = fileName.includes('/') ? fileName.split('/').pop() || '' : fileName;

  const extension = fileNameOnly.split('.').pop();
  return extension ? extension.toUpperCase() : '';
};


export const shouldOpenInNewTab = (fileName: string | undefined | null): boolean => {
  const extension = getFileExtension(fileName);

  const viewableTypes = ['pdf', 'doc', 'docx', 'jpeg', 'jpg', 'png', 'gif', 'txt'];

  return viewableTypes.includes(extension);
};

export const openFileInNewTab = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  try {
    const extension = getFileExtension(fileName || fileUrl);
    
    if (['DOC', 'DOCX', 'doc', 'docx'].includes(extension)) {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;
      window.open(googleViewerUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
      return;
    }
    
    window.open(fileUrl, '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
    
  } catch (error) {
    console.error('Error opening file:', error);
    window.open(fileUrl, '_blank');
  }
};


export const openFileWithEnhancedHandling = async (
  fileUrl: string,
  fileName?: string,
  apiCallback?: () => Promise<{ success: boolean; data?: { fileUrl: string } }>
): Promise<void> => {
  try {
   
    if (apiCallback) {
      const response = await apiCallback();
      if (response.success && response.data?.fileUrl) {
        openFileInNewTab(response.data.fileUrl, fileName);
        return;
      }
    }

    if (fileUrl) {
      openFileInNewTab(fileUrl, fileName);
    } else {
      console.error('No file URL available');
    }
  } catch (error) {
   
    if (fileUrl) {
      openFileInNewTab(fileUrl, fileName);
    }
  }
};


export const openInFullTab = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  try {
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = fileUrl;
    form.target = '_blank';
    form.style.display = 'none';
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    setTimeout(() => {
      const newWindow = window.open(
        fileUrl, 
        '_blank', 
        'width=' + screen.width + ',height=' + screen.height + ',toolbar=yes,location=yes,directories=no,status=yes,menubar=yes,scrollbars=yes,copyhistory=no,resizable=yes,left=0,top=0'
      );
      
      if (newWindow) {
        newWindow.focus();
      }
    }, 100);
    
  } catch (error) {
    console.error('Error opening file in full tab:', error);
    window.open(fileUrl, '_blank');
  }
};
