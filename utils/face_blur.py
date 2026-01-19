"""
Face Detection and Blurring Utility
Protects student privacy by detecting and blurring faces in classroom images
"""

import cv2
import numpy as np
import os

class FaceBlurrer:
    """Detects and blurs faces in images for privacy protection"""
    
    def __init__(self, blur_amount=99, scale_factor=1.05, min_neighbors=2):
        """
        Initialize face blurrer with Haar Cascade detector
        
        Args:
            blur_amount: Gaussian blur kernel size (must be odd, higher = more blur)
            scale_factor: How much image size is reduced at each scale (1.1-1.4)
            min_neighbors: How many neighbors each candidate rectangle should have
        """
        self.blur_amount = blur_amount if blur_amount % 2 == 1 else blur_amount + 1
        self.scale_factor = scale_factor
        self.min_neighbors = min_neighbors
        
        # Load Haar Cascade face detectors (frontal and profile)
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        # Also load alternative cascade for better detection
        alt_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml'
        self.face_cascade_alt = cv2.CascadeClassifier(alt_cascade_path)
        
        # Profile face detector for side views
        profile_cascade_path = cv2.data.haarcascades + 'haarcascade_profileface.xml'
        self.profile_cascade = cv2.CascadeClassifier(profile_cascade_path)
        
        if self.face_cascade.empty():
            raise ValueError(f"Failed to load face cascade from {cascade_path}")
        
        print(f"✓ Face detector initialized (blur={blur_amount}, scale={scale_factor}, neighbors={min_neighbors})")
    
    def detect_faces(self, image):
        """
        Detect faces in image using multiple cascades for better detection
        
        Args:
            image: OpenCV image (BGR format)
            
        Returns:
            List of face rectangles [(x, y, w, h), ...]
        """
        # Convert to grayscale for detection
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization to improve detection in varying lighting
        gray = cv2.equalizeHist(gray)
        
        all_faces = []
        
        # Detect with primary cascade
        faces1 = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=(15, 15),  # Smaller minimum face size for better detection
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        all_faces.extend(faces1)
        
        # Detect with alternative cascade
        faces2 = self.face_cascade_alt.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=(15, 15)
        )
        all_faces.extend(faces2)
        
        # Detect profile faces
        faces3 = self.profile_cascade.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=(15, 15)
        )
        all_faces.extend(faces3)
        
        # Remove duplicate detections (faces detected by multiple cascades)
        if len(all_faces) > 0:
            all_faces = self._remove_duplicates(all_faces)
        
        return all_faces
    
    def _remove_duplicates(self, faces, overlap_threshold=0.3):
        """
        Remove duplicate face detections based on overlap
        
        Args:
            faces: List of face rectangles
            overlap_threshold: Minimum overlap ratio to consider duplicates
            
        Returns:
            List of unique face rectangles
        """
        if len(faces) == 0:
            return []
        
        faces_list = list(faces)
        unique_faces = []
        
        while len(faces_list) > 0:
            face = faces_list.pop(0)
            unique_faces.append(face)
            
            # Remove overlapping faces
            faces_list = [
                f for f in faces_list 
                if self._calculate_overlap(face, f) < overlap_threshold
            ]
        
        return unique_faces
    
    def _calculate_overlap(self, face1, face2):
        """Calculate overlap ratio between two face rectangles"""
        x1, y1, w1, h1 = face1
        x2, y2, w2, h2 = face2
        
        # Calculate intersection
        x_left = max(x1, x2)
        y_top = max(y1, y2)
        x_right = min(x1 + w1, x2 + w2)
        y_bottom = min(y1 + h1, y2 + h2)
        
        if x_right < x_left or y_bottom < y_top:
            return 0.0
        
        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        face1_area = w1 * h1
        face2_area = w2 * h2
        
        # Return overlap ratio relative to smaller face
        return intersection_area / min(face1_area, face2_area)
    
    def blur_face_region(self, image, x, y, w, h, padding=0.2):
        """
        Blur a specific face region with padding
        
        Args:
            image: OpenCV image
            x, y, w, h: Face rectangle coordinates
            padding: Extra padding around face (0.2 = 20% larger)
            
        Returns:
            Image with blurred face region
        """
        # Add padding to cover more area
        pad_w = int(w * padding)
        pad_h = int(h * padding)
        
        # Calculate padded coordinates (ensure within image bounds)
        x1 = max(0, x - pad_w)
        y1 = max(0, y - pad_h)
        x2 = min(image.shape[1], x + w + pad_w)
        y2 = min(image.shape[0], y + h + pad_h)
        
        # Extract face region
        face_region = image[y1:y2, x1:x2]
        
        if face_region.size == 0:
            return image
        
        # Apply Gaussian blur
        blurred_face = cv2.GaussianBlur(
            face_region,
            (self.blur_amount, self.blur_amount),
            30
        )
        
        # Replace face region with blurred version
        image[y1:y2, x1:x2] = blurred_face
        
        return image
    
    def blur_faces(self, image, draw_boxes=False):
        """
        Detect and blur all faces in image
        
        Args:
            image: OpenCV image (BGR format)
            draw_boxes: If True, draw rectangles around detected faces
            
        Returns:
            Tuple of (blurred_image, face_count, face_locations)
        """
        # Make a copy to avoid modifying original
        result = image.copy()
        
        # Detect faces
        faces = self.detect_faces(image)
        face_count = len(faces)
        
        print(f"Detected {face_count} face(s)")
        
        # Blur each detected face
        for (x, y, w, h) in faces:
            result = self.blur_face_region(result, x, y, w, h)
            
            # Optionally draw rectangle (for debugging)
            if draw_boxes:
                cv2.rectangle(result, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # Convert face locations to list of dicts for JSON serialization
        face_locations = [
            {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)}
            for (x, y, w, h) in faces
        ]
        
        return result, face_count, face_locations
    
    def process_image_file(self, input_path, output_path=None, draw_boxes=False):
        """
        Process an image file and save blurred version
        
        Args:
            input_path: Path to input image
            output_path: Path to save blurred image (optional)
            draw_boxes: Draw rectangles around faces
            
        Returns:
            Tuple of (success, face_count, output_path, face_locations)
        """
        try:
            # Read image
            image = cv2.imread(input_path)
            if image is None:
                return False, 0, None, []
            
            # Blur faces
            blurred_image, face_count, face_locations = self.blur_faces(image, draw_boxes)
            
            # Generate output path if not provided
            if output_path is None:
                base, ext = os.path.splitext(input_path)
                output_path = f"{base}_blurred{ext}"
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            # Save blurred image
            success = cv2.imwrite(output_path, blurred_image)
            
            if success:
                print(f"✓ Saved blurred image: {output_path}")
            else:
                print(f"✗ Failed to save: {output_path}")
            
            return success, face_count, output_path, face_locations
            
        except Exception as e:
            print(f"Error processing image: {e}")
            return False, 0, None, []


# Convenience function for quick use
def blur_faces_in_image(image_path, output_path=None, blur_amount=99):
    """
    Quick function to blur faces in an image
    
    Args:
        image_path: Path to input image
        output_path: Path to save blurred image (optional)
        blur_amount: Blur intensity (higher = more blur)
        
    Returns:
        Tuple of (success, face_count, output_path)
    """
    blurrer = FaceBlurrer(blur_amount=blur_amount)
    success, face_count, output_path, _ = blurrer.process_image_file(
        image_path,
        output_path
    )
    return success, face_count, output_path


if __name__ == '__main__':
    # Test the face blurrer
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python face_blur.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    print(f"Processing: {image_path}")
    success, face_count, output_path, locations = blur_faces_in_image(image_path)
    
    if success:
        print(f"✓ Success! Blurred {face_count} face(s)")
        print(f"✓ Output: {output_path}")
        print(f"✓ Locations: {locations}")
    else:
        print("✗ Failed to process image")
