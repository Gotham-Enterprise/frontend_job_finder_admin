export const createImageClickHandler = () => {
  return `
    function handleTemplateImageClick(imgElement) {
      // Create file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      
      fileInput.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            // Update the image source
            imgElement.src = e.target.result;
            imgElement.alt = file.name;
            // Remove the placeholder styling
            imgElement.style.border = 'none';
            imgElement.style.background = 'transparent';
            // Add a subtle border to show it's been updated
            imgElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
          };
          reader.readAsDataURL(file);
        }
        // Clean up
        document.body.removeChild(fileInput);
      };
      
      // Add to document and trigger click
      document.body.appendChild(fileInput);
      fileInput.click();
    }
    
    // Add click handlers to all template images
    document.addEventListener('DOMContentLoaded', function() {
      const templateImages = document.querySelectorAll('img[data-template-image="true"]');
      templateImages.forEach(img => {
        img.addEventListener('click', function() {
          handleTemplateImageClick(this);
        });
      });
    });
  `;
};

export const enhanceImageWithClickHandler = (imageSrc: string, alt: string = "Template Image", additionalStyles: string = ""): string => {
  return `<img 
    src="${imageSrc}" 
    alt="${alt}" 
    data-template-image="true"
    style="width: 100%; height: auto; border-radius: 8px; ${additionalStyles}" 
    title="Click to upload your own image" 
  />`;
};

export const templateImageStyles = `
  <style>
    .template-image-container {
      position: relative;
      display: inline-block;
    }
    
    .template-image-container::after {
      content: '📷 Click to upload';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
    
    .template-image-container:hover::after {
      opacity: 1;
    }
    
    .template-image {
      transition: all 0.2s ease;
      border: 2px dashed #ccc;
      background: #f9f9f9;
    }
    
    .template-image:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    
    .template-image.uploaded {
      border: none;
      background: transparent;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  </style>
`;
