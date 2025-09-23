// src/components/Drawing/PlantUmlComponent.jsx
import React, { useEffect, useState } from 'react';
import { getPlantUmlImageUrl, extractPlantUmlContent } from '../../utils/plantUmlRenderer';

const PlantUmlComponent = ({ umlCode, answerLength, title }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!umlCode || umlCode.trim() === '' || answerLength < 5) {
      setLoading(false);
      return;
    }

    try {
      const cleanCode = extractPlantUmlContent(umlCode);
      if (!cleanCode) {
        setLoading(false);
        return;
      }

      const url = getPlantUmlImageUrl(cleanCode);
      if (url) {
        setImageUrl(url);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error rendering PlantUML diagram:', error);
      setError('Failed to render diagram. Please check your PlantUML syntax.');
      setLoading(false);
    }
  }, [umlCode, answerLength]);

  if (loading) {
    return <div className="p-4 text-center">Loading diagram...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!imageUrl) {
    return <div className="p-4 text-center">No valid diagram found.</div>;
  }

  return (
    <div className="diagram-container p-4">
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      <div className="flex justify-center">
        <img src={imageUrl} alt="PlantUML diagram" className="max-w-full" />
      </div>
    </div>
  );
};

export default PlantUmlComponent;
