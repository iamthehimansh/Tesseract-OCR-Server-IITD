# Image Text Extractor

This project is a web application that allows users to upload images and extract text or bounding boxes around text from the images using Tesseract OCR. The application consists of a Flask backend and a React frontend.

## Features

- Upload images and extract text using Tesseract OCR.
- Extract bounding boxes around text at different levels (word, line, paragraph, block, page).
- Download annotated images with bounding boxes.

## Technologies Used

- **Backend**: Flask, Tesseract OCR, Pillow
- **Frontend**: React, Styled-components
- **Testing**: Unittest

## Setup Instructions

### Prerequisites

- Python 3.x
- Node.js
- Tesseract OCR

### Frontend Setup

1. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```

2. Install the required Node packages:
    ```sh
    npm install
    ```

3. Build the React application for production:
    ```sh
    npm run build
    ```

### Backend Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/iamthehimansh/Tesseract-OCR-Server-IITD.git
    cd Tesseract-OCR-Server-IITD
    ```

2. Create a virtual environment and activate it:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required Python packages:
    ```sh
    pip install -r requirements.txt
    ```

4. Run the Flask server:
    ```sh
    python server/main.py
    ```

### Running Tests

To run the backend tests, use the following command:
```sh
python -m unittest server/test.py
```

## Usage

1. Open your browser and navigate to `http://localhost:5000`.
2. Upload an image using the "Upload Image" button.
3. Select the mode (Bounding Boxes or Extract Text).
4. If "Bounding Boxes" mode is selected, choose the bounding box type (word, line, 
paragraph, block, page).
5. Click "Submit" to process the image.
6. View the extracted text or bounding boxes on the result section.
7. Download the annotated image if bounding boxes were selected.

## Project Structure

```
Tesseract-OCR-Server-IITD/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
├── server/
│   ├── main.py
│   ├── test.py
│   └── ...
├── requirements.txt
└── README.md
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for 
details.

## Acknowledgements

- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [Flask](https://flask.palletsprojects.com/)
- [React](https://reactjs.org/)
- [Styled-components](https://styled-components.com/)

## Author

- Himansh Raj
