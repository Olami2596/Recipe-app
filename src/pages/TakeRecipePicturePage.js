import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TakeRecipePicturePage() {
  const [image, setImage] = useState(() => {
    const savedImage = localStorage.getItem('savedImage');
    return savedImage ? JSON.parse(savedImage) : null;
  });
  const [extractedText, setExtractedText] = useState(() => {
    return localStorage.getItem('extractedText') || null;
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const newImage = e.target.files[0];
      setImage(newImage);
      localStorage.setItem('savedImage', JSON.stringify({
        name: newImage.name,
        type: newImage.type,
        size: newImage.size,
        lastModified: newImage.lastModified
      }));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setError('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/api/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response.data);

      if (response.data && response.data.text) {
        setExtractedText(response.data.text);
        localStorage.setItem('extractedText', response.data.text);
        setError(null);
      } else {
        setError('Failed to extract text from the image');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      setError(`Error extracting text: ${error.message}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  const handleSaveRecipe = () => {
    navigate('/create-recipe/extracted-text', { state: { extractedText } });
  };

  return (
    <div>
      <h1>Take Recipe Picture</h1>
      <input type="file" onChange={handleImageChange} accept="image/*" capture="camera" />
      <button onClick={handleUpload} disabled={!image}>Upload and Extract Text</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {extractedText && (
        <div>
          <h2>Extracted Text:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{extractedText}</pre>
          <button onClick={handleSaveRecipe}>Edit and Save Recipe</button>
        </div>
      )}
    </div>
  );
}

export default TakeRecipePicturePage;