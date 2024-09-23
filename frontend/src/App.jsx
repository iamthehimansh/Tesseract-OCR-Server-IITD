import  { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Upload, FileText, Download, ChevronDown } from 'lucide-react';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f2f5;
    color: #333;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  // background-color: #ffffff;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a73e8;
  margin: 0;
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 600px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px 20px;
  // background-color: #1a73e8;
  color: #d15e5e;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;

  &:hover {
    background-color: #1557b0;
  }

  svg {
    margin-right: 10px;
  }
`;

const ModeSelect = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
`;

const ModeOption = styled.label`
  flex: 1;
  padding: 10px;
  text-align: center;
  background-color: ${props => props.selected ? '#e8f0fe' : '#f8f9fa'};
  color: ${props => props.selected ? '#1a73e8' : '#5f6368'};
  border: 1px solid ${props => props.selected ? '#1a73e8' : '#dadce0'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background-color: #e8f0fe;
    color: #1a73e8;
  }
`;

const Select = styled.select`
  margin: 20px 0;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #dadce0;
  background-color: white;
  appearance: none;
  font-size: 16px;
  cursor: pointer;
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  // &::after { 
  //   content: '';
  //   position: absolute;
  //   right: 10px;
  //   top: 50%;
  //   transform: translateY(-50%);
  //   border-style: solid;
  //   border-width: 6px 6px 0 6px;
  //   border-color: #1a73e8 transparent transparent transparent;
  // }
`;

const Button = styled.button`
  padding: 15px 20px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;

  &:hover {
    background-color: #1557b0;
  }

  &:disabled {
    background-color: #dadce0;
    cursor: not-allowed;
  }
`;

const Result = styled.div`
  margin-top: 40px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ResultHeader = styled.h2`
  margin-top: 0;
  font-weight: 600;
`;

const ResultText = styled.pre`
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
`;

const DownloadButton = styled.button`
  padding: 15px 20px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px auto 0;

  &:hover {
    background-color: #1557b0;
  }
`;

const Footer = styled.footer`
  background-color: #1a73e8;
  // color: white;
  text-align: center;
  padding: 20px;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
`;
function App() {
  const [image, setImage] = useState(null);
  const [bboxType, setBboxType] = useState('word');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('bboxes'); // 'bboxes' or 'text'
  const [base64Input, setBase64Input] = useState('');
  const canvasRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleBase64InputChange = (e) => {
    setBase64Input(e.target.value);
  };

  const handleBase64Submit = () => {
    setImage(base64Input);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const endpoint = mode === 'bboxes' ? '/api/get-bboxes' : '/api/get-text';
    const body = {
      base64_image: image,
    };
    if (mode === 'bboxes') {
      body.bbox_type = bboxType;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    setLoading(false);
    if (data.success) {
      setResult(data.result);
    } else {
      setError(data.error.message);
    }
  };

  useEffect(() => {
    if (result && mode === 'bboxes' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const scale = Math.min(window.innerWidth / img.width, window.innerHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        result.bboxes.forEach(bbox => {
          ctx.strokeRect(bbox.x_min, bbox.y_min, bbox.x_max - bbox.x_min, bbox.y_max - bbox.y_min);
        });
      };
    }
  }, [result, mode, image]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'annotated_image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <AppContainer>
      <GlobalStyle />
      <Header>
        <HeaderContent>
          <Logo>Image Text Extractor</Logo>
          <Upload size={24} />
        </HeaderContent>
      </Header>
      <Main>
        <Card>
          <Form onSubmit={handleSubmit}>
            <FileInputLabel>
              <FileText size={24} />
              <span>Upload Image</span>
              <FileInput type="file" accept="image/*" onChange={handleImageChange} />
            </FileInputLabel>
            {image && <img src={image} alt="Uploaded" style={{ marginTop: '20px', maxWidth: '100%' }} />}
            <ModeSelect>
              <ModeOption selected={mode === 'bboxes'} onClick={() => setMode('bboxes')}>
                Bounding Boxes
              </ModeOption>
              <ModeOption selected={mode === 'text'} onClick={() => setMode('text')}>
                Extract Text
              </ModeOption>
            </ModeSelect>
            {mode === 'bboxes' && (
              <SelectWrapper>
                <Select value={bboxType} onChange={(e) => setBboxType(e.target.value)}>
                  <option value="word">Word</option>
                  <option value="line">Line</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="block">Block</option>
                  <option value="page">Page</option>
                </Select>
                <ChevronDown size={24} />
              </SelectWrapper>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Submit'}
            </Button>
          </Form>
          <div>
            <textarea
              placeholder="Or paste base64 image here"
              value={base64Input}
              onChange={handleBase64InputChange}
              rows="4"
              style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #dadce0' }}
            />
            <Button onClick={handleBase64Submit} style={{ marginTop: '10px' }}>
              Submit Base64 Image
            </Button>
          </div>
          {error && <div className="error">{error}</div>}
        </Card>
      </Main>
      {result && (
       
        <Result>
          {mode === 'bboxes' ? (
            <>
              <ResultHeader>Bounding Boxes:</ResultHeader>
              <canvas ref={canvasRef} />
              <DownloadButton onClick={handleDownload}>
                <Download style={{backgroundColor:'transparent'}} size={24} color='whlite' backgroundColor='transparent' />
                Download Image
              </DownloadButton>
            </>
          ) : (
            <>
              <ResultHeader>Extracted Text:</ResultHeader>
              <ResultText>{result.text}</ResultText>
            </>
          )}
        </Result>
      )}
      <Footer>
        <p>&copy; VisionGroup IITD-CSE Assignment by Himansh Raj</p>
      </Footer>
    </AppContainer>
  );
}

export default App;