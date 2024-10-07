
# Spoonacular Recipe App

## Description

The Spoonacular Recipe App is a comprehensive web application for recipe management and discovery. Built with React and Firebase, it offers a seamless experience for users to search, create, and manage their favorite recipes.

## Features

- User authentication
- Recipe search and discovery using the Spoonacular API
- Manual recipe creation
- Recipe image and document upload
- Text extraction from images and documents
- Saving and editing personal recipes
- Viewing and managing saved recipes

## Technologies Used

- React
- Firebase (Authentication, Firestore, Storage)
- Express.js
- Google Cloud Vision API
- Spoonacular API
- Tailwind CSS

## Installation

1. Clone the repository:

   ```

   git clone https://github.com/your-username/spoonacular-recipe-app.git

   ```
2. Install dependencies:

   ```

   cd spoonacular-recipe-app

   npm install

   ```
3. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```

   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key

   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain

   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id

   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket

   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id

   REACT_APP_FIREBASE_APP_ID=your_firebase_app_id

   REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key

   ```
4. Start the development server:

   ```

   npm start

   ```
5. In a separate terminal, start the backend server:

   ```

   cd server

   npm install

   npm run dev

   ```

## Usage

1. Register or log in to your account
2. Use the search bar to discover recipes
3. Create recipes manually or by uploading images/documents
4. Save and edit your favorite recipes
5. View all your saved recipes in the "Saved Recipes" section

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
