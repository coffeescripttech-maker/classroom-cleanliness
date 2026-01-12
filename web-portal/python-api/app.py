"""
Python Flask API Bridge
Connects Next.js web portal to Python AI system
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory (CLEANLENESS) to path to import main
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, parent_dir)

try:
    from main import ClassroomCleanliness
    MAIN_IMPORTED = True
except ImportError as e:
    print(f"Warning: Could not import main.py: {e}")
    print(f"Looking in: {parent_dir}")
    print("The API will run but analysis will not work until main.py is accessible.")
    MAIN_IMPORTED = False
    ClassroomCleanliness = None

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js

# Initialize AI system
ai_system = None
if MAIN_IMPORTED and ClassroomCleanliness:
    try:
        print("Initializing AI system...")
        ai_system = ClassroomCleanliness(use_owlvit=True)
        print("✓ AI system ready!")
    except Exception as e:
        print(f"Warning: Could not initialize AI system: {e}")
        print("The API will run but analysis will not work.")
else:
    print("⚠️  AI system not initialized - main.py not found")
    print("The API will run in demo mode.")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if ai_system else 'limited',
        'message': 'Python AI API is running',
        'ai_system_ready': ai_system is not None,
        'owlvit_enabled': ai_system.use_owlvit if ai_system else False
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    """
    Analyze classroom image
    
    Request body:
    {
        "image_path": "path/to/image.jpg",
        "classroom_id": "Room 101",
        "use_owlvit": true
    }
    """
    try:
        # Check if AI system is available
        if not ai_system:
            return jsonify({
                'success': False,
                'error': 'AI system not initialized. Please ensure main.py is accessible.'
            }), 503
        
        data = request.json
        image_path = data.get('image_path')
        classroom_id = data.get('classroom_id')
        use_owlvit = data.get('use_owlvit', True)
        
        if not image_path or not classroom_id:
            return jsonify({
                'success': False,
                'error': 'image_path and classroom_id are required'
            }), 400
        
        # Check if file exists
        if not os.path.exists(image_path):
            return jsonify({
                'success': False,
                'error': f'Image file not found: {image_path}'
            }), 404
        
        # Analyze classroom
        print(f"Analyzing {classroom_id}: {image_path}")
        result = ai_system.analyze_classroom(image_path, classroom_id)
        
        if result is None:
            return jsonify({
                'success': False,
                'error': 'Analysis failed'
            }), 500
        
        # Format response
        response = {
            'success': True,
            'scores': result['scores'],
            'total_score': result['total_score'],
            'rating': result['rating'],
            'detections': result.get('detections', []),
            'classroom_id': classroom_id
        }
        
        print(f"✓ Analysis complete: {result['total_score']}/50 ({result['rating']})")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyze multiple images
    
    Request body:
    {
        "images": [
            {"image_path": "...", "classroom_id": "..."},
            {"image_path": "...", "classroom_id": "..."}
        ]
    }
    """
    try:
        # Check if AI system is available
        if not ai_system:
            return jsonify({
                'success': False,
                'error': 'AI system not initialized. Please ensure main.py is accessible.'
            }), 503
        
        data = request.json
        images = data.get('images', [])
        
        if not images:
            return jsonify({
                'success': False,
                'error': 'images array is required'
            }), 400
        
        results = []
        
        for img in images:
            image_path = img.get('image_path')
            classroom_id = img.get('classroom_id')
            
            if not image_path or not classroom_id:
                results.append({
                    'success': False,
                    'error': 'Missing image_path or classroom_id',
                    'classroom_id': classroom_id
                })
                continue
            
            try:
                result = ai_system.analyze_classroom(image_path, classroom_id)
                
                results.append({
                    'success': True,
                    'scores': result['scores'],
                    'total_score': result['total_score'],
                    'rating': result['rating'],
                    'classroom_id': classroom_id
                })
            except Exception as e:
                results.append({
                    'success': False,
                    'error': str(e),
                    'classroom_id': classroom_id
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'total': len(results),
            'successful': sum(1 for r in results if r['success'])
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("Python AI API Server")
    print("="*60)
    print("Starting server on http://localhost:5000")
    print("Endpoints:")
    print("  GET  /api/health")
    print("  POST /api/analyze")
    print("  POST /api/batch-analyze")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
