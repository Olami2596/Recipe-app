import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UploadRecipePage() {
  const [file, setFile] = useState(() => {
    const savedFile = localStorage.getItem('savedFile');
    return savedFile ? JSON.parse(savedFile) : null;
  });
  const [extractedTextFile, setExtractedTextFile] = useState(() => {
    return localStorage.getItem('extractedTextFile') || null;
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const newFile = e.target.files[0];
      setFile(newFile);
      localStorage.setItem('savedFile', JSON.stringify({
        name: newFile.name,
        type: newFile.type,
        size: newFile.size,
        lastModified: newFile.lastModified,
      }));
      setError(null);
    }
  };

// DocUploadPage.js
  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // https://recipe-app-56ff6.cloudfunctions.net/api/extract-recipe

    try {
      const response = await axios.post('https://recipe-app-56ff6.cloudfunctions.net/api/extract-recipe', formData, { 
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Server response:', response);

      if (response.data && response.data.text) {
        setExtractedTextFile(response.data.text);
        localStorage.setItem('extractedTextFile', response.data.text); // Store extracted text in localStorage
        setError(null);
      } else {
        setError('Failed to extract text from the document');
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


  const handleEditRecipe = () => {
    navigate('/extract-doc', { state: { extractedTextFile } });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 text-center mb-6">Upload Recipe File</h1>

      <div className="mb-6">
        <input
          type="file"
          accept=".pdf,.csv,.xlsx,.docx"
          onChange={handleFileChange}
          className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
        />
        <button
          onClick={handleFileUpload}
          className={`mt-4 ${file ? 'bg-olive-800 hover:bg-olive-600' : 'bg-gray-300 cursor-not-allowed'} text-white px-6 py-2 rounded transition-all duration-300 ease-in-out`}
        >
          Upload and Extract Recipe
        </button>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>

      {extractedTextFile && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-olive-800 mb-4">Extracted Recipe:</h2>
          <pre className="bg-gray-100 p-4 rounded shadow-md whitespace-pre-wrap break-words text-olive-700 mb-6">
            {extractedTextFile}
          </pre>
          <button
            onClick={handleEditRecipe}
            className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
          >
            Edit and Save Recipe
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadRecipePage;
