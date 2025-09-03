
export const getFileExtension = (fileName: string | undefined | null): string => {
  if (!fileName) return '';
  

  const fileNameOnly = fileName.includes('/') ? fileName.split('/').pop() || '' : fileName;

  const extension = fileNameOnly.split('.').pop();
  return extension ? extension.toUpperCase() : '';
};


export const shouldOpenInNewTab = (fileName: string | undefined | null): boolean => {
  const extension = getFileExtension(fileName);
  
  const viewableTypes = ['PDF', 'DOC', 'DOCX', 'JPEG', 'JPG', 'PNG', 'GIF', 'TXT'];
  
  return viewableTypes.includes(extension);
};

export const openFileInNewTab = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  try {
    const extension = getFileExtension(fileName || fileUrl);
    

    if (['DOC', 'DOCX'].includes(extension)) {
      openDocFileInViewer(fileUrl, fileName);
      return;
    }
    
    
    const newWindow = window.open('', '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      newWindow.location.href = fileUrl;
      newWindow.focus();
    } else {
      console.warn('Popup blocked, attempting alternative method');
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
  
    window.open(fileUrl, '_blank', 'width=1200,height=800,toolbar=yes,scrollbars=yes,resizable=yes');
  }
};

export const openDocFileInViewer = (fileUrl: string, fileName?: string): void => {
  if (!fileUrl) {
    console.error('No file URL provided');
    return;
  }

  const newWindow = window.open('', '_blank', 'width=1200,height=800,toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,resizable=yes');
  
  if (newWindow) {
 
    newWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName || 'Document Viewer'}</title>
          <style>
            body { margin: 0; padding: 0; overflow: hidden; }
            iframe { width: 100%; height: 100vh; border: none; }
            .fallback { padding: 20px; text-align: center; font-family: Arial, sans-serif; }
            .viewer-btn { 
              background: #007bff; 
              color: white; 
              padding: 10px 20px; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer; 
              margin: 10px;
              text-decoration: none;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="fallback">
            <h3>Document Viewer</h3>
            <p>Opening document: ${fileName || 'Document'}</p>
            <div>
              <a href="${fileUrl}" target="_blank" class="viewer-btn">Open Document Directly</a>
              <a href="https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}" target="_blank" class="viewer-btn">Open in Google Viewer</a>
            </div>
            <script>
              // Try to load the document directly first
              setTimeout(() => {
                window.location.href = "${fileUrl}";
              }, 1000);
            </script>
          </div>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.focus();
  } else {
 
    try {
   
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;
      window.open(googleViewerUrl, '_blank', 'width=1200,height=800,toolbar=yes,scrollbars=yes,resizable=yes');
    } catch (error) {
      // Final fallback - direct file URL
      window.open(fileUrl, '_blank');
    }
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
