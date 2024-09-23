import unittest
import json
import base64
from io import BytesIO
from PIL import Image,ImageDraw
from server.main import app  # Import your Flask app

class TestTesseractOCRAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def create_test_image(self, text):
        image = Image.new('RGB', (200, 200), color='white')
        draw = ImageDraw.Draw(image)
        draw.text((20, 20), text, fill='black')
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()

    def test_get_text_valid_image(self):
        base64_image = self.create_test_image("Hello  World")
        response = self.app.post('/api/get-text', 
                                 data=json.dumps({'base64_image': base64_image}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn("Hello World", data['result']['text'])

    def test_get_text_invalid_base64(self):
        response = self.app.post('/api/get-text', 
                                 data=json.dumps({'base64_image': 'invalid_base64'}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn("Invalid base64-encoded string", data['error']['message'])

    def test_get_text_missing_image(self):
        response = self.app.post('/api/get-text', 
                                 data=json.dumps({}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn("Missing base64_image", data['error']['message'])

    def test_get_bboxes_valid_image(self):
        base64_image = self.create_test_image("Hello World")
        response = self.app.post('/api/get-bboxes', 
                                 data=json.dumps({'base64_image': base64_image, 'bbox_type': 'word'}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['result']['bboxes'], list)
        self.assertTrue(len(data['result']['bboxes']) > 0)

    def test_get_bboxes_invalid_type(self):
        base64_image = self.create_test_image("Hello World")
        response = self.app.post('/api/get-bboxes', 
                                 data=json.dumps({'base64_image': base64_image, 'bbox_type': 'invalid'}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn("Invalid bbox_type", data['error']['message'])

    def test_get_bboxes_missing_type(self):
        base64_image = self.create_test_image("Hello World")
        response = self.app.post('/api/get-bboxes', 
                                 data=json.dumps({'base64_image': base64_image}),
                                 content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn("Missing bbox_type", data['error']['message'])

    def test_get_bboxes_all_types(self):
        base64_image = self.create_test_image("Hello World")
        for bbox_type in ['word', 'line', 'paragraph', 'block', 'page']:
            response = self.app.post('/api/get-bboxes', 
                                     data=json.dumps({'base64_image': base64_image, 'bbox_type': bbox_type}),
                                     content_type='application/json')
            data = json.loads(response.data)
            self.assertEqual(response.status_code, 200)
            self.assertTrue(data['success'])
            self.assertIsInstance(data['result']['bboxes'], list)
            self.assertTrue(len(data['result']['bboxes']) > 0)

if __name__ == '__main__':
    unittest.main()