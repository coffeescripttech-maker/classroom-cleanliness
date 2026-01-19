'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Download, Trash2, Calendar, Building2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

interface ImageDetail {
  id: number;
  classroom_id: number;
  classroom_name: string;
  grade_level: string;
  section_name: string;
  building: string;
  image_path: string;
  blurred_image_path?: string;  // NEW: Blurred image path
  faces_detected?: number;       // NEW: Number of faces detected
  captured_at: string;
  file_size: number;
  width: number;
  height: number;
  score?: {
    floor_score: number;
    furniture_score: number;
    trash_score: number;
    wall_score: number;
    clutter_score: number;
    total_score: number;
    rating: string;
    detected_objects: any;
    annotated_image_path?: string;
    faces_blurred?: boolean;     // NEW: Whether faces were blurred
    analyzed_at: string;
  };
}

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const imageId = params.id;
  
  const [image, setImage] = useState<ImageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState<string | null>(null);
  const [showBlurred, setShowBlurred] = useState(true);

  useEffect(() => {
    fetchImage();
  }, [imageId]);

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/images/${imageId}`);
      const result = await response.json();
      const data = result.data || result;
      
      // Parse score values from strings to numbers
      if (data.score) {
        data.score = {
          ...data.score,
          floor_score: parseFloat(data.score.floor_score) || 0,
          furniture_score: parseFloat(data.score.furniture_score) || 0,
          trash_score: parseFloat(data.score.trash_score) || 0,
          wall_score: parseFloat(data.score.wall_score) || 0,
          clutter_score: parseFloat(data.score.clutter_score) || 0,
          total_score: parseFloat(data.score.total_score) || 0
        };
      }
      
      setImage(data);
    } catch (error) {
      console.error('Failed to fetch image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('/api/images/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId })
      });
      
      if (response.ok) {
        fetchImage();
      } else {
        alert('Failed to analyze image');
      }
    } catch (error) {
      console.error('Failed to analyze:', error);
      alert('Failed to analyze image');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this image? This cannot be undone.')) return;
    try {
      await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      router.push('/dashboard/images');
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!image) return <div className="p-6">Image not found</div>;

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'Good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/images"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{image.classroom_name}</h1>
          <p className="text-gray-600 mt-1">{image.grade_level} - {image.section_name}</p>
        </div>
        <div className="flex items-center gap-3">
          {!image.score && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Comparison */}
          {image.score && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Image Comparison</h2>
                
                {/* Face Blur Toggle */}
                {image.blurred_image_path && image.faces_detected && image.faces_detected > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {image.faces_detected} face{image.faces_detected > 1 ? 's' : ''} detected
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-sm font-medium text-gray-700">Blur Faces</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showBlurred}
                          onChange={(e) => setShowBlurred(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original/Blurred Image */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {showBlurred && image.blurred_image_path ? 'Blurred Image (Privacy Protected)' : 'Original Image'}
                  </p>
                  <img
                    src={`/uploads/${showBlurred && image.blurred_image_path ? image.blurred_image_path : image.image_path}`}
                    alt={showBlurred ? "Blurred" : "Original"}
                    className="w-full rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                  {showBlurred && image.blurred_image_path && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span className="text-green-600">✓</span> Faces automatically blurred for privacy
                    </p>
                  )}
                </div>
                
                {/* Detected Objects - Use annotated image if available, otherwise draw on canvas */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Detected Objects 
                    {image.score.annotated_image_path && (
                      <span className="ml-2 text-xs text-green-600">✓ OpenCV Rendered</span>
                    )}
                  </p>
                  {image.score.annotated_image_path ? (
                    // Use pre-rendered annotated image from Python/OpenCV
                    <img
                      src={`/uploads/${image.score.annotated_image_path}`}
                      alt="Detected Objects"
                      className="w-full rounded-lg border border-gray-300"
                      onError={(e) => {
                        // Fallback to canvas drawing if annotated image fails to load
                        console.warn('Annotated image failed to load, falling back to canvas');
                        (e.target as HTMLImageElement).style.display = 'none';
                        // Show canvas fallback
                      }}
                    />
                  ) : (
                    // Fallback to canvas drawing (old method)
                    <DetectedObjectsCanvas
                      imagePath={`/uploads/${image.image_path}`}
                      detections={image.score.detected_objects}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Single Image (if not analyzed) */}
          {!image.score && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Face Blur Toggle for unanalyzed images */}
              {image.blurred_image_path && image.faces_detected && image.faces_detected > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">
                    {image.faces_detected} face{image.faces_detected > 1 ? 's' : ''} detected
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-medium text-gray-700">Blur Faces</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={showBlurred}
                        onChange={(e) => setShowBlurred(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                  </label>
                </div>
              )}
              
              <img
                src={`/uploads/${showBlurred && image.blurred_image_path ? image.blurred_image_path : image.image_path}`}
                alt={image.classroom_name}
                className="w-full rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
              
              {showBlurred && image.blurred_image_path && (
                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  <span className="text-green-600">✓</span> Faces automatically blurred for privacy
                </p>
              )}
            </div>
          )}

          {/* Score Breakdown */}
          {image.score && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Score Breakdown
                </h2>
                <div className="space-y-4">
                  <ScoreBar 
                    label="Floor Cleanliness" 
                    score={image.score.floor_score} 
                    max={10}
                    description="Measures visible trash, debris, and dirt on the floor"
                    onViewDetails={() => setShowScoreModal('floor')}
                  />
                  <ScoreBar 
                    label="Furniture Orderliness" 
                    score={image.score.furniture_score} 
                    max={10}
                    description="Evaluates chair and desk arrangement and alignment"
                    onViewDetails={() => setShowScoreModal('furniture')}
                  />
                  <ScoreBar 
                    label="Trash Bin Condition" 
                    score={image.score.trash_score} 
                    max={10}
                    description="Checks proper waste disposal and bin overflow"
                    onViewDetails={() => setShowScoreModal('trash')}
                  />
                  <ScoreBar 
                    label="Wall/Board Cleanliness" 
                    score={image.score.wall_score} 
                    max={10}
                    description="Assesses wall condition, board cleanliness, and posters"
                    onViewDetails={() => setShowScoreModal('wall')}
                  />
                  <ScoreBar 
                    label="Clutter Detection" 
                    score={image.score.clutter_score} 
                    max={10}
                    description="Detects bags, bottles, papers, and items left behind"
                    onViewDetails={() => setShowScoreModal('clutter')}
                  />
                </div>
              </div>

              {/* Score Detail Modal */}
              {showScoreModal && (
                <ScoreDetailModal
                  category={showScoreModal}
                  score={image.score}
                  detections={image.score.detected_objects}
                  onClose={() => setShowScoreModal(null)}
                />
              )}

              {/* Scoring Methodology */}
              <ScoringMethodology />

              {/* Detected Objects List */}
              <DetectedObjectsList detections={image.score.detected_objects} />
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Overall Score */}
          {image.score && (
            <div className={`rounded-lg border-2 p-6 ${getRatingColor(image.score.rating)}`}>
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{image.score.total_score}</div>
                <div className="text-sm opacity-75 mb-3">out of 50</div>
                <div className="text-2xl font-semibold">{image.score.rating}</div>
              </div>
            </div>
          )}

          {/* Image Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Image Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-600">Captured</div>
                  <div className="font-medium text-gray-900">
                    {new Date(image.captured_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-gray-600">Location</div>
                  <div className="font-medium text-gray-900">{image.building}</div>
                </div>
              </div>

              {image.score && (
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-gray-600">Analyzed</div>
                    <div className="font-medium text-gray-900">
                      {new Date(image.score.analyzed_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Face Detection Info */}
            {image.faces_detected !== undefined && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Faces Detected</span>
                  <span className={`text-sm font-semibold ${image.faces_detected > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                    {image.faces_detected}
                  </span>
                </div>
                {image.blurred_image_path && image.faces_detected > 0 && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span>
                    <span>Blurred version available</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">File Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Size</span>
                <span className="font-medium">{(image.file_size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dimensions</span>
                <span className="font-medium">{image.width} × {image.height}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, description, onViewDetails }: { 
  label: string; 
  score: number; 
  max: number;
  description?: string;
  onViewDetails?: () => void;
}) {
  const percentage = (score / max) * 100;
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between items-start text-sm mb-1">
        <div className="flex-1">
          <span className="font-medium text-gray-700">{label}</span>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-900 font-semibold whitespace-nowrap">{score.toFixed(2)}/{max}</span>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="text-xs text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
            >
              View Details
            </button>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${getColor()} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ScoringMethodology() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Scoring Methodology
        </h2>
        <span className="text-gray-500">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-200 pt-6">
          {/* Floor Cleanliness */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">1. Floor Cleanliness (0-10 points)</h3>
            <p className="text-sm text-gray-600 mb-2">
              Measures how clean the classroom floor is based on detected objects and debris.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Formula:</strong> Base score 10 - (trash_items × 0.5) - (papers_on_floor × 0.3)</p>
              <p><strong>Detects:</strong> Papers on floor, trash, dirt particles, debris</p>
              <p><strong>Scoring:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>10 points: Spotless floor, no visible trash</li>
                <li>7-9 points: Minor debris, mostly clean</li>
                <li>4-6 points: Noticeable trash or papers</li>
                <li>0-3 points: Significant floor clutter</li>
              </ul>
            </div>
          </div>

          {/* Furniture Orderliness */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">2. Furniture Orderliness (0-10 points)</h3>
            <p className="text-sm text-gray-600 mb-2">
              Evaluates if chairs and desks are properly arranged and aligned.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Formula:</strong> Based on chair/desk alignment and positioning patterns</p>
              <p><strong>Detects:</strong> Chairs, desks, tables, their positions and alignment</p>
              <p><strong>Scoring:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>10 points: All furniture properly aligned in rows</li>
                <li>7-9 points: Most furniture organized, minor misalignment</li>
                <li>4-6 points: Several chairs/desks out of place</li>
                <li>0-3 points: Disorganized furniture arrangement</li>
              </ul>
            </div>
          </div>

          {/* Trash Bin Condition */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">3. Trash Bin Condition (0-10 points)</h3>
            <p className="text-sm text-gray-600 mb-2">
              Checks proper waste disposal and bin overflow status.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Formula:</strong> Evaluates trash bin presence and surrounding area cleanliness</p>
              <p><strong>Detects:</strong> Trash bins, waste around bins, overflow indicators</p>
              <p><strong>Scoring:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>10 points: Bin visible, no overflow, clean surroundings</li>
                <li>7-9 points: Bin present, minimal waste around it</li>
                <li>4-6 points: Some trash near bin or slight overflow</li>
                <li>0-3 points: Overflowing bin or trash scattered around</li>
              </ul>
            </div>
          </div>

          {/* Wall/Board Cleanliness */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">4. Wall/Board Cleanliness (0-10 points)</h3>
            <p className="text-sm text-gray-600 mb-2">
              Assesses wall condition, whiteboard/blackboard cleanliness, and poster organization.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Formula:</strong> Checks board cleanliness and wall condition</p>
              <p><strong>Detects:</strong> Whiteboards, blackboards, bulletin boards, posters, wall marks</p>
              <p><strong>Scoring:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>10 points: Clean board, organized posters, no vandalism</li>
                <li>7-9 points: Board mostly clean, posters neat</li>
                <li>4-6 points: Board needs cleaning or posters falling</li>
                <li>0-3 points: Dirty board, vandalism, or messy walls</li>
              </ul>
            </div>
          </div>

          {/* Clutter Detection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">5. Clutter Detection (0-10 points)</h3>
            <p className="text-sm text-gray-600 mb-2">
              Detects unnecessary items left in the classroom after use.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
              <p><strong>Formula:</strong> Base score 10 - (clutter_items × penalty_per_item)</p>
              <p><strong>Detects:</strong> Bags, bottles, books, folders, personal items left behind</p>
              <p><strong>Scoring:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>10 points: No items left behind, completely clear</li>
                <li>7-9 points: 1-2 small items (folders, single bottle)</li>
                <li>4-6 points: 3-5 items (bags, multiple bottles)</li>
                <li>0-3 points: Many items left scattered around</li>
              </ul>
            </div>
          </div>

          {/* Total Score */}
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Total Score Calculation</h3>
            <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
              <p><strong>Formula:</strong> Total = Floor + Furniture + Trash + Wall + Clutter</p>
              <p><strong>Maximum Score:</strong> 50 points</p>
              <p><strong>Rating System:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Excellent:</strong> 45-50 points (90-100%)</li>
                <li><strong>Good:</strong> 35-44 points (70-89%)</li>
                <li><strong>Fair:</strong> 25-34 points (50-69%)</li>
                <li><strong>Poor:</strong> Below 25 points (&lt;50%)</li>
              </ul>
            </div>
          </div>

          {/* AI Detection Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
            <p className="font-semibold text-yellow-900 mb-1">📌 Note:</p>
            <p className="text-yellow-800">
              Scores are calculated using AI object detection (OWL-ViT model) which identifies and counts 
              objects in the image. The system analyzes object positions, quantities, and patterns to 
              determine cleanliness levels. Confidence thresholds ensure accurate detection.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DetectedObjectsCanvas({ imagePath, detections }: { imagePath: string; detections: any }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imagePath;

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Parse detections
      let detectionsArray = [];
      try {
        detectionsArray = typeof detections === 'string' ? JSON.parse(detections) : detections;
      } catch (e) {
        console.error('Failed to parse detections:', e);
        return;
      }

      if (!Array.isArray(detectionsArray)) return;

      // Draw bounding boxes
      detectionsArray.forEach((detection: any, index: number) => {
        const { bbox, class: className, confidence } = detection;
        if (!bbox || bbox.length !== 4) return;

        const [x1, y1, x2, y2] = bbox;
        const width = x2 - x1;
        const height = y2 - y1;

        // Generate color based on class
        const hue = (index * 137.5) % 360;
        const color = `hsl(${hue}, 70%, 50%)`;

        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw label background
        const label = `${className} ${(confidence * 100).toFixed(0)}%`;
        ctx.font = '14px Arial';
        const textWidth = ctx.measureText(label).width;
        const textHeight = 20;

        ctx.fillStyle = color;
        ctx.fillRect(x1, y1 - textHeight, textWidth + 10, textHeight);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.fillText(label, x1 + 5, y1 - 5);
      });
    };
  }, [imagePath, detections, imageLoaded]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-gray-300"
        style={{ display: imageLoaded ? 'block' : 'none' }}
      />
      <img
        src={imagePath}
        alt="Loading..."
        className="w-full rounded-lg border border-gray-300"
        style={{ display: imageLoaded ? 'none' : 'block' }}
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/placeholder-image.png';
        }}
      />
    </div>
  );
}

function DetectedObjectsList({ detections }: { detections: any }) {
  let detectionsArray = [];
  try {
    detectionsArray = typeof detections === 'string' ? JSON.parse(detections) : detections;
  } catch (e) {
    console.error('Failed to parse detections:', e);
    return null;
  }

  if (!Array.isArray(detectionsArray) || detectionsArray.length === 0) {
    return null;
  }

  // Count objects by class
  const objectCounts: { [key: string]: number } = {};
  detectionsArray.forEach((detection: any) => {
    const className = detection.class || 'unknown';
    objectCounts[className] = (objectCounts[className] || 0) + 1;
  });

  const sortedObjects = Object.entries(objectCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Detected Objects ({detectionsArray.length})</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {sortedObjects.map(([className, count]) => (
          <div key={className} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {className.replace(/_/g, ' ')}
            </span>
            <span className="text-sm font-bold text-blue-600">×{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreDetailModal({ category, score, detections, onClose }: {
  category: string;
  score: any;
  detections: any;
  onClose: () => void;
}) {
  let detectionsArray = [];
  try {
    detectionsArray = typeof detections === 'string' ? JSON.parse(detections) : detections;
  } catch (e) {
    console.error('Failed to parse detections:', e);
  }

  const getCategoryData = () => {
    switch (category) {
      case 'floor':
        const floorItems = detectionsArray.filter((d: any) => 
          d.class.includes('paper') || d.class.includes('trash') || d.class.includes('floor')
        );
        return {
          title: 'Floor Cleanliness Computation',
          score: score.floor_score,
          formula: 'Base Score (10) - (Papers on Floor × 0.3) - (Trash Items × 0.5)',
          computation: `
            Base Score: 10.00
            Papers on Floor: ${floorItems.filter((d: any) => d.class.includes('paper')).length} × 0.3 = ${(floorItems.filter((d: any) => d.class.includes('paper')).length * 0.3).toFixed(2)}
            Trash Items: ${floorItems.filter((d: any) => d.class.includes('trash')).length} × 0.5 = ${(floorItems.filter((d: any) => d.class.includes('trash')).length * 0.5).toFixed(2)}
            Final Score: ${score.floor_score.toFixed(2)}/10
          `,
          relatedObjects: floorItems,
          description: 'Evaluates floor cleanliness by detecting papers, trash, and debris on the floor surface.'
        };
      
      case 'furniture':
        const furnitureItems = detectionsArray.filter((d: any) => 
          d.class.includes('chair') || d.class.includes('desk') || d.class.includes('table')
        );
        return {
          title: 'Furniture Orderliness Computation',
          score: score.furniture_score,
          formula: 'Based on furniture alignment, positioning patterns, and organization',
          computation: `
            Detected Chairs: ${furnitureItems.filter((d: any) => d.class.includes('chair')).length}
            Detected Desks/Tables: ${furnitureItems.filter((d: any) => d.class.includes('desk') || d.class.includes('table')).length}
            Alignment Score: ${score.furniture_score.toFixed(2)}/10
            
            Analysis: AI evaluates spatial distribution and alignment patterns of furniture
          `,
          relatedObjects: furnitureItems,
          description: 'Measures how well chairs and desks are arranged and aligned in the classroom.'
        };
      
      case 'trash':
        const trashItems = detectionsArray.filter((d: any) => 
          d.class.includes('trash') || d.class.includes('bin') || d.class.includes('waste')
        );
        return {
          title: 'Trash Bin Condition Computation',
          score: score.trash_score,
          formula: 'Evaluates bin presence, overflow status, and surrounding cleanliness',
          computation: `
            Trash Bins Detected: ${trashItems.filter((d: any) => d.class.includes('bin')).length}
            Waste Around Bin: ${trashItems.filter((d: any) => !d.class.includes('bin')).length}
            Condition Score: ${score.trash_score.toFixed(2)}/10
            
            Status: ${score.trash_score >= 7 ? 'Good - Bin present and clean' : 'Needs attention'}
          `,
          relatedObjects: trashItems,
          description: 'Checks if trash bins are present, not overflowing, and surroundings are clean.'
        };
      
      case 'wall':
        const wallItems = detectionsArray.filter((d: any) => 
          d.class.includes('board') || d.class.includes('whiteboard') || d.class.includes('bulletin')
        );
        return {
          title: 'Wall/Board Cleanliness Computation',
          score: score.wall_score,
          formula: 'Assesses board cleanliness, wall condition, and poster organization',
          computation: `
            Whiteboards Detected: ${wallItems.filter((d: any) => d.class.includes('whiteboard')).length}
            Bulletin Boards: ${wallItems.filter((d: any) => d.class.includes('bulletin')).length}
            Cleanliness Score: ${score.wall_score.toFixed(2)}/10
            
            Evaluation: Board condition and wall organization assessed
          `,
          relatedObjects: wallItems,
          description: 'Evaluates whiteboard/blackboard cleanliness and overall wall condition.'
        };
      
      case 'clutter':
        const clutterItems = detectionsArray.filter((d: any) => 
          d.class.includes('bag') || d.class.includes('bottle') || d.class.includes('book') || 
          d.class.includes('folder') || d.class.includes('backpack')
        );
        return {
          title: 'Clutter Detection Computation',
          score: score.clutter_score,
          formula: 'Base Score (10) - (Clutter Items × Penalty)',
          computation: `
            Base Score: 10.00
            Bags/Backpacks: ${clutterItems.filter((d: any) => d.class.includes('bag') || d.class.includes('backpack')).length}
            Bottles: ${clutterItems.filter((d: any) => d.class.includes('bottle')).length}
            Books/Folders: ${clutterItems.filter((d: any) => d.class.includes('book') || d.class.includes('folder')).length}
            Total Clutter Items: ${clutterItems.length}
            Penalty Applied: ${(10 - score.clutter_score).toFixed(2)}
            Final Score: ${score.clutter_score.toFixed(2)}/10
          `,
          relatedObjects: clutterItems,
          description: 'Detects personal items and objects left behind in the classroom.'
        };
      
      default:
        return null;
    }
  };

  const data = getCategoryData();
  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="text-2xl font-semibold">{data.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Score Display */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {data.score.toFixed(2)}<span className="text-3xl text-blue-400">/10</span>
            </div>
            <div className="text-sm text-blue-800">{data.description}</div>
          </div>

          {/* Formula */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Formula:</h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm">
              {data.formula}
            </div>
          </div>

          {/* Computation */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Computation:</h4>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <pre className="text-sm whitespace-pre-wrap font-mono">{data.computation}</pre>
            </div>
          </div>

          {/* Related Objects */}
          {data.relatedObjects.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Related Objects Detected ({data.relatedObjects.length}):
              </h4>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {data.relatedObjects.map((obj: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                      <span className="font-medium capitalize">{obj.class.replace(/_/g, ' ')}</span>
                      <span className="text-gray-600">{(obj.confidence * 100).toFixed(1)}% confidence</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {data.relatedObjects.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <p className="text-green-800">✓ No issues detected in this category</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
