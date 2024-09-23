import base64
import io
from flask import Flask, request, jsonify, send_from_directory
from PIL import Image
import pytesseract
from flask_cors import CORS

app = Flask(__name__,static_url_path='', static_folder='../frontend/dist')
CORS(app, resources={r"/*": {"origins": "*"}})

def decode_image(base64_image):
    try:
        # Remove any potential header (e.g., "data:image/jpeg;base64,")
        if ',' in base64_image:
            base64_image = base64_image.split(',', 1)[1]
        
        # Add padding if necessary
        base64_image += '=' * (-len(base64_image) % 4)
        
        image_data = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_data))
        return image, None
    except base64.binascii.Error as e:
        return None, f"Invalid base64-encoded string: {str(e)}"
    except IOError as e:
        return None, f"Unable to open image: {str(e)}"
    except Exception as e:
        return None, f"An unexpected error occurred: {str(e)}"

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/get-text', methods=['POST'])
def get_text():
    data = request.json
    base64_image = data.get('base64_image')
    
    if not base64_image:
        return jsonify({
            "success": False,
            "error": {
                "message": "Missing base64_image in request body."
            }
        }), 400
    
    image, error = decode_image(base64_image)
    if error:
        return jsonify({
            "success": False,
            "error": {
                "message": error
            }
        }), 400
    
    text = pytesseract.image_to_string(image)
    return jsonify({
        "success": True,
        "result": {
            "text": text
        }
    })

@app.route('/api/get-bboxes', methods=['POST'])
def get_bboxes():
    data = request.json
    base64_image = data.get('base64_image')
    bbox_type = data.get('bbox_type')
    
    if not base64_image:
        return jsonify({
            "success": False,
            "error": {
                "message": "Missing base64_image in request body."
            }
        }), 400
    
    if not bbox_type:
        return jsonify({
            "success": False,
            "error": {
                "message": "Missing bbox_type in request body."
            }
        }), 400
    
    if bbox_type not in ['word', 'line', 'paragraph', 'block', 'page']:
        return jsonify({
            "success": False,
            "error": {
                "message": "Invalid bbox_type. Must be one of: word, line, paragraph, block, or page."
            }
        }), 400
    
    image, error = decode_image(base64_image)
    if error:
        return jsonify({
            "success": False,
            "error": {
                "message": error
            }
        }), 400
    
    # Process bboxes based on bbox_type
    try:
        if bbox_type == 'word':
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            bboxes = [
                {
                    "x_min": data['left'][i],
                    "y_min": data['top'][i],
                    "x_max": data['left'][i] + data['width'][i],
                    "y_max": data['top'][i] + data['height'][i]
                }
                for i in range(len(data['text']))
                if data['text'][i].strip() != ''
            ]
        elif bbox_type in ['line', 'paragraph', 'block']:
            data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
            bboxes = []
            current_bbox = None
            for i in range(len(data['text'])):
                if data['text'][i].strip() != '':
                    if current_bbox is None:
                        current_bbox = {
                            "x_min": data['left'][i],
                            "y_min": data['top'][i],
                            "x_max": data['left'][i] + data['width'][i],
                            "y_max": data['top'][i] + data['height'][i]
                        }
                    else:
                        current_bbox['x_min'] = min(current_bbox['x_min'], data['left'][i])
                        current_bbox['y_min'] = min(current_bbox['y_min'], data['top'][i])
                        current_bbox['x_max'] = max(current_bbox['x_max'], data['left'][i] + data['width'][i])
                        current_bbox['y_max'] = max(current_bbox['y_max'], data['top'][i] + data['height'][i])
                
                if (i + 1 == len(data['text']) or 
                    (bbox_type == 'line' and data['line_num'][i] != data['line_num'][i+1]) or
                    (bbox_type == 'paragraph' and data['par_num'][i] != data['par_num'][i+1]) or
                    (bbox_type == 'block' and data['block_num'][i] != data['block_num'][i+1])):
                    if current_bbox:
                        bboxes.append(current_bbox)
                        current_bbox = None
        else:  # page
            width, height = image.size
            bboxes = [{
                "x_min": 0,
                "y_min": 0,
                "x_max": width,
                "y_max": height
            }]

        return jsonify({
            "success": True,
            "result": {
                "bboxes": bboxes
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": {
                "message": f"An error occurred while processing the image: {str(e)}"
            }
        }), 500

if __name__ == '__main__':
    app.run(debug=True)