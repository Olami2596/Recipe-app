import React from 'react';
import { useNavigate } from 'react-router-dom';

function CreateRecipePage() {
  const navigate = useNavigate();

  const handleTakeRecipePicture = () => {
    navigate('/take-recipe-picture');
  };

  const handleTypeManually = () => {
    navigate('/create-recipe/manual');
  };

  return (
    <div>
      <h1>Create Recipe</h1>
      <div>
        <button onClick={handleTakeRecipePicture}>Take Picture of Recipe</button>
        <button onClick={handleTypeManually}>Type Manually</button>
      </div>
    </div>
  );
}

export default CreateRecipePage;