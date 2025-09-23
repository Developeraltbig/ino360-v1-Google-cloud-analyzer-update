// frontend/src/utils/svgConverter.js
/**
 * Converts an SVG string to a PNG image
 * @param {string} svgString - The SVG content as a string
 * @param {number} width - Desired width (optional)
 * @param {number} height - Desired height (optional)
 * @returns {Promise<string>} - Promise resolving to PNG data URL
 */
export const svgToPng = (svgString, width = 800, height = 600) => {
    return new Promise((resolve, reject) => {
      try {
        // Create SVG blob
        const svg = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svg);
        
        // Create an image element to load the SVG
        const img = new Image();
        img.onload = () => {
          try {
            // Create canvas to render the image
            const canvas = document.createElement('canvas');
            
            // Set dimensions, maintaining aspect ratio if needed
            const aspectRatio = img.width / img.height;
            if (width && !height) {
              height = width / aspectRatio;
            } else if (height && !width) {
              width = height * aspectRatio;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Render the SVG to canvas
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white'; // Set white background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to PNG data URL
            const pngDataUrl = canvas.toDataURL('image/png');
            
            // Clean up
            URL.revokeObjectURL(url);
            
            resolve(pngDataUrl);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          URL.revokeObjectURL(url);
          reject(error);
        };
        
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  };
  
  /**
   * Converts PNG data URL to Blob
   * @param {string} dataUrl - PNG data URL
   * @returns {Promise<Blob>} - Promise resolving to PNG Blob
   */
  export const dataUrlToBlob = async (dataUrl) => {
    return fetch(dataUrl).then(res => res.blob());
  };
  