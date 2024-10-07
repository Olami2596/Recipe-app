const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const vision = require('@google-cloud/vision');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
// const { PDFDocument } = require('pdf-lib');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Initialize Google Cloud Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, '..', 'credentials.json')
});

// Utility function to extract text from PDF
async function extractTextFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// Utility function to extract text from DOCX
async function extractTextFromDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

// Utility function to extract data from CSV or Excel
function extractDataFromCsvOrExcel(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_csv(sheet);
  return data; // Returning CSV data as text
}

// function parseRecipe(text) {
//   const lines = text.split('\n').filter(line => line.trim() !== '');
//   const recipe = {
//     title: '',
//     ingredients: [],
//     instructions: []
//   };

//   let currentSection = 'title';

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();
//     if (line.toLowerCase().includes('ingredients')) {
//       currentSection = 'ingredients';
//       continue;
//     } else if (line.toLowerCase().includes('instructions') || line.toLowerCase().includes('directions')) {
//       currentSection = 'instructions';
//       continue;
//     }

//     switch (currentSection) {
//       case 'title':
//         recipe.title += (recipe.title ? ' ' : '') + line;
//         break;
//       case 'ingredients':
//         recipe.ingredients.push(line);
//         break;
//       case 'instructions':
//         recipe.instructions.push(line);
//         break;
//       default:
//         console.warn(`Unexpected section: ${currentSection}`);
//     }
//   }

//   return recipe;
// }

app.post('/api/extract-text', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).send('No file uploaded.');
    }

    console.log('File received:', req.file);

    const [result] = await client.textDetection(req.file.path);
    console.log('Vision API result:', result);

    if (!result.textAnnotations || result.textAnnotations.length === 0) {
      console.error('No text detected in the image');
      return res.status(400).json({ error: 'No text detected in the image' });
    }

    const detections = result.textAnnotations;
    const text = detections[0].description;
    console.log('Extracted text:', text);

    // Schedule file deletion after 10 minutes
    setTimeout(() => {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
        else console.log('File deleted successfully');
      });
    }, 10 * 60 * 1000);

    res.json({ text });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image: ' + error.message);
  }
});

app.post('/api/extract-recipe', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    let extractedTextFile = '';
    const fileType = file.mimetype;

    if (fileType === 'application/pdf') {
      // First try extracting with pdf-parse
      extractedTextFile = await extractTextFromPdf(file.path);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedTextFile = await extractTextFromDocx(file.path);
    } else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      extractedTextFile = extractDataFromCsvOrExcel(file.path);
    } else {
      return res.status(400).send('Unsupported file type');
    }

    console.log('Extracted text:', extractedTextFile);

    setTimeout(() => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }, 10 * 60 * 1000);

    res.json({ text: extractedTextFile });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).send('Error processing file: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
