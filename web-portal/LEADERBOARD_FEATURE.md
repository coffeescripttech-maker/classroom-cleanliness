# Leaderboard Feature

## Overview
Complete leaderboard system that ranks classrooms based on their cleanliness scores with real-time updates, trend tracking, and filtering capabilities.

## Features Implemented

### 1. Main Leaderboard Page (`/dashboard/leaderboard`)
- **Top 3 Podium Display**: Visual podium showcasing the top 3 classrooms
- **Full Rankings Table**: Complete list of all classrooms ranked by performance
- **Real-time Updates**: Automatically reflects new scores as they're added
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 2. Filtering Options
- **Time Period Filter**:
  - All Time (default)
  - Today
  - This Week (last 7 days)
  - This Month (last 30 days)
- **Grade Level Filter**: Filter by specific grade (Grade 7, 8, 9, etc.)

### 3. Ranking Display
Each entry shows:
- **Rank Position**: 1st, 2nd, 3rd with special icons, then numbered
- **Classroom Name**: Room identifier
- **Building Location**: Physical location
- **Grade & Section**: Academic classification
- **Average Score**: Mean score across all analyses (out of 50)
- **Latest Rating**: Most recent rating (Excellent/Good/Fair/Poor)
- **Total Analyses**: Number of times analyzed
- **Trend Indicator**: Up/Down/Stable with improvement value

### 4. Visual Elements

#### Podium Cards (Top 3)
- **1st Place**: 
  - Gold trophy icon
  - Tallest card (h-64)
  - Yellow gradient background
  - Center position
- **2nd Place**:
  - Silver medal icon
  - Medium card (h-52)
  - Gray gradient background
  - Left position
- **3rd Place**:
  - Bronze award icon
  - Shorter card (h-48)
  - Amber gradient background
  - Right position

#### Rank Icons
- 🏆 Gold Trophy - 1st place
- 🥈 Silver Medal - 2nd place
- 🥉 Bronze Award - 3rd place
- Numbers - 4th place and below

#### Trend Indicators
- ↗️ Green arrow + positive number = Improving
- ↘️ Red arrow + negative number = Declining
- ➖ Gray dash + 0 = Stable

#### Rating Badges
- **Excellent**: Green badge (45-50 points)
- **Good**: Blue badge (35-44 points)
- **Fair**: Yellow badge (25-34 points)
- **Poor**: Red badge (below 25 points)

## API Endpoint

### GET /api/leaderboard
Returns ranked list of classrooms with scores and trends.

**Query Parameters:**
- `period`: Filter by time period (today, week, month, all)
- `grade`: Filter by grade level (e.g., "Grade 7")

**Response:**
```json
[
  {
    "rank": 1,
    "classroom_id": 23,
    "classroom_name": "Room 101",
    "grade_level": "Grade 7",
    "section_name": "Section A",
    "building": "Main Building",
    "average_score": 42.5,
    "total_analyses": 5,
    "latest_score": 45.2,
    "latest_rating": "Excellent",
    "trend": "up",
    "improvement": 3.5
  }
]
```

## Ranking Algorithm

### Score Calculation
```sql
Average Score = SUM(all scores) / COUNT(analyses)
```

### Ranking Logic
1. Primary sort: Average score (descending)
2. Secondary sort: Total analyses (descending)
3. Ties broken by number of analyses

### Trend Calculation
```
Trend = Most Recent Score - Previous Score

If improvement > 0: "up" (improving)
If improvement < 0: "down" (declining)
If improvement = 0: "stable" (no change)
```

## Database Query

The leaderboard uses a complex SQL query with:
- **JOIN**: Combines classrooms, sections, grades, and scores
- **GROUP BY**: Aggregates scores per classroom
- **AVG()**: Calculates average scores
- **COUNT()**: Counts total analyses
- **Subqueries**: Gets latest and previous scores for trend
- **CASE**: Determines trend direction
- **ORDER BY**: Ranks by average score

## Usage Instructions

### Viewing the Leaderboard
1. Navigate to Dashboard → Leaderboard
2. See top 3 classrooms on podium
3. Scroll down for full rankings table

### Filtering Results
1. **By Time Period**:
   - Select from dropdown (Today, Week, Month, All Time)
   - Rankings update automatically
2. **By Grade Level**:
   - Select specific grade from dropdown
   - See only classrooms in that grade

### Understanding Trends
- **Green ↗️ +3.5**: Classroom improved by 3.5 points
- **Red ↘️ -2.1**: Classroom declined by 2.1 points
- **Gray ➖ 0.0**: No change in score

## Competitive Features

### Motivation System
- **Visual Podium**: Makes top 3 feel special
- **Trend Tracking**: Shows improvement over time
- **Public Display**: Can be shown on screens
- **Grade Competition**: Sections compete within grades

### Gamification Elements
- Trophy/medal icons for top performers
- Color-coded rankings
- Improvement indicators
- Total analyses count (engagement metric)

## Integration with Other Features

### Dashboard
- Shows top 5 preview on main dashboard
- Links to full leaderboard page

### Classrooms
- Each classroom page can show its rank
- Link to leaderboard from classroom view

### Images
- After analysis, scores update leaderboard
- Real-time ranking changes

## Example Scenarios

### Scenario 1: Daily Competition
- Filter: "Today"
- Shows which classrooms cleaned best today
- Encourages daily maintenance

### Scenario 2: Weekly Winners
- Filter: "This Week"
- Identifies consistent performers
- Good for weekly awards

### Scenario 3: Grade Level Competition
- Filter: "Grade 7"
- Shows rankings within grade
- Fair comparison among peers

### Scenario 4: Overall Champions
- Filter: "All Time"
- Historical best performers
- Long-term excellence recognition

## Display Options

### For Students
- Show on classroom screens
- Display in hallways
- Update after each analysis
- Motivate cleanliness

### For Teachers
- Monitor classroom performance
- Track improvement trends
- Identify areas needing attention
- Reward top performers

### For Administrators
- Overall school cleanliness view
- Grade-level comparisons
- Time-based analysis
- Data-driven decisions

## Future Enhancements

Potential additions:
1. **Export to PDF**: Print leaderboard for display
2. **Historical Charts**: Graph score trends over time
3. **Achievements**: Badges for milestones
4. **Notifications**: Alert when rank changes
5. **Public View**: Separate page for public display
6. **Weekly Reports**: Email summaries to teachers
7. **Comparison Mode**: Compare two classrooms
8. **Prediction**: Forecast future rankings

## Technical Details

### Performance
- Efficient SQL query with proper indexes
- Caching for frequently accessed data
- Pagination for large datasets
- Optimized for real-time updates

### Scalability
- Handles hundreds of classrooms
- Supports multiple schools
- Time-based filtering reduces load
- Grade filtering improves performance

### Data Integrity
- Only includes active classrooms
- Requires at least 1 analysis to rank
- Handles missing data gracefully
- Validates score ranges

## Troubleshooting

### No data showing
- Ensure classrooms have been analyzed
- Check if filters are too restrictive
- Verify database connection
- Check cleanliness_scores table

### Incorrect rankings
- Verify score calculations
- Check date filters
- Ensure all analyses are saved
- Review SQL query logic

### Trends not updating
- Need at least 2 analyses per classroom
- Check analyzed_at timestamps
- Verify score storage
- Review trend calculation logic

## Success Metrics

Track these to measure impact:
- **Engagement**: Number of analyses per classroom
- **Improvement**: Average trend direction
- **Competition**: Score variance between classrooms
- **Consistency**: Frequency of analyses
- **Excellence**: Number of "Excellent" ratings

## Best Practices

1. **Regular Updates**: Analyze classrooms consistently
2. **Fair Comparison**: Use grade-level filters
3. **Celebrate Success**: Recognize top performers
4. **Address Issues**: Help low-ranking classrooms
5. **Track Trends**: Monitor improvement over time
6. **Public Display**: Show leaderboard prominently
7. **Incentivize**: Reward high rankings
8. **Educate**: Explain scoring system to students
