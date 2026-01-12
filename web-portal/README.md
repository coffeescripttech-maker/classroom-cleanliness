# Classroom Cleanliness Admin Portal

Web-based admin portal for managing classroom cleanliness monitoring system.

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MySQL
- **AI Integration:** Python Flask API

## Quick Start

### 1. Install Dependencies

```bash
cd web-portal
npm install
```

### 2. Setup Database

```bash
# Create MySQL database
mysql -u root -p < database/schema.sql
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classroom_cleanliness

PYTHON_AI_URL=http://localhost:5000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 4. Start Python AI API

```bash
cd python-api
pip install -r requirements.txt
python app.py
```

Python API will run on `http://localhost:5000`

### 5. Start Next.js Dev Server

```bash
npm run dev
```

Web portal will run on `http://localhost:3000`

## Project Structure

```
web-portal/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── classrooms/        # Classroom management
│   ├── schedules/         # Schedule management
│   ├── images/            # Image gallery
│   ├── leaderboard/       # Leaderboard
│   └── ...
├── components/            # React components
├── lib/                   # Utilities
├── types/                 # TypeScript types
├── database/              # Database schema
└── python-api/            # Python Flask API
```

## Features

### ✅ Implemented
- Database schema
- API routes for classrooms
- Leaderboard API
- Python AI integration
- TypeScript types
- Basic components

### 🚧 To Implement
- Authentication
- Dashboard UI
- Schedule management UI
- Image upload & gallery
- Camera management
- Reports & analytics

## API Endpoints

### Classrooms
- `GET /api/classrooms` - List classrooms
- `POST /api/classrooms` - Create classroom
- `GET /api/classrooms/[id]` - Get classroom
- `PUT /api/classrooms/[id]` - Update classroom
- `DELETE /api/classrooms/[id]` - Delete classroom

### Leaderboard
- `GET /api/scores/leaderboard` - Get rankings

### Python AI
- `POST /api/python-ai/analyze` - Analyze image

## Python AI API

### Endpoints

```
GET  /api/health           # Health check
POST /api/analyze          # Analyze single image
POST /api/batch-analyze    # Analyze multiple images
```

### Example Request

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "data/classroom2.png",
    "classroom_id": "Room 101",
    "use_owlvit": true
  }'
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Database

### Create Database

```sql
CREATE DATABASE classroom_cleanliness;
```

### Run Schema

```bash
mysql -u root -p classroom_cleanliness < database/schema.sql
```

### Default Login

```
Username: admin
Password: (set during first run)
```

## Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=classroom_cleanliness

# Python AI API
PYTHON_AI_URL=http://localhost:5000

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760
```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker (Optional)

```bash
docker-compose up -d
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT
