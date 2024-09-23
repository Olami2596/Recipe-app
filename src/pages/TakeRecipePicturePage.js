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
        lastModified: newImage.lastModified,
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 text-center mb-6">Take Recipe Picture</h1>

      <div className="mb-6 flex flex-col items-center">
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          capture="camera"
          className="mb-4 w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
        />
        <button
          onClick={handleUpload}
          disabled={!image}
          className={`${
            image ? 'bg-olive-800 hover:bg-olive-600' : 'bg-gray-300 cursor-not-allowed'
          } text-white px-6 py-2 rounded transition-all duration-300 ease-in-out`}
        >
          Upload and Extract Text
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      {extractedText && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-olive-800 mb-4">Extracted Text:</h2>
          <pre className="bg-gray-100 p-4 rounded shadow-md whitespace-pre-wrap break-words text-olive-700 mb-6">
            {extractedText}
          </pre>
          <div className="flex justify-center">
            <button
              onClick={handleSaveRecipe}
              className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
            >
              Edit and Save Recipe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TakeRecipePicturePage;
