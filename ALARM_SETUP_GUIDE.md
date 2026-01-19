# Alarm Sound Setup Guide

## Overview
The schedule checker now supports custom alarm sounds using your `alarm1.wav` file.

## Installation Steps

### 1. Install pygame (Required for alarm sound)
```bash
pip install pygame
```

Or use the updated startup script which will install it automatically:
```bash
start-schedule-checker.bat
```

### 2. Verify Alarm File Location
Make sure your `alarm1.wav` file is in the correct location:
```
web-portal/public/alarm1.wav
```

✅ **Your alarm file is already in the correct location!**

### 3. Test Alarm Sound
Run the test script to verify everything works:
```bash
cd web-portal/python-api
python test_alarm.py
```

This will:
- Check if alarm1.wav exists
- Verify pygame installation
- Play the alarm sound once
- Show any errors

## How It Works

### Alarm Timing (Option A)
If you set a schedule with:
- **Capture Time**: 1:00 PM
- **Cleanup Time**: 5 minutes (300 seconds)
- **Alarm Duration**: 10 seconds

The timeline will be:
```
12:55:00 PM - 🔔 Alarm starts playing (10 seconds)
12:55:10 PM - ⏳ Cleanup time begins (5 minutes)
1:00:00 PM  - 📸 Image captured at EXACT scheduled time
```

### Alarm Playback Priority
1. **pygame** (Primary) - Best audio quality, loops the WAV file
2. **winsound** (Fallback) - Windows built-in, plays WAV once
3. **System beep** (Last resort) - If alarm file not found

## Troubleshooting

### No Sound Playing
1. Check if pygame is installed: `pip list | findstr pygame`
2. Verify alarm file exists: Check `web-portal/public/uploads/alarm1.wav`
3. Run test script: `python web-portal/python-api/test_alarm.py`
4. Check Windows volume settings

### pygame Not Found
```bash
pip install pygame
```

### Alarm File Not Found
Move your `alarm1.wav` to:
```
web-portal/public/alarm1.wav
```

### Sound Too Short/Long
The system will loop your alarm sound to match the alarm duration setting.
- If alarm1.wav is 2 seconds and alarm duration is 10 seconds, it plays 5 times
- Adjust the alarm duration in your schedule settings

## Testing Your Setup

1. **Test the alarm sound**:
   ```bash
   cd web-portal/python-api
   python test_alarm.py
   ```

2. **Create a test schedule**:
   - Set capture time to 2 minutes from now
   - Enable alarm with 5-10 second duration
   - Set cleanup time to 1 minute
   - Watch the schedule checker logs

3. **Monitor the logs**:
   ```
   [INFO] 🔔 Playing alarm for 10 seconds
   [INFO] 🔊 Playing alarm1.wav (5 times)
   [INFO] ⏳ Waiting 60s (1 min) for cleanup...
   [INFO] 📸 Capture time reached: 13:20:00
   ```

## Schedule Checker Logs
When alarm plays, you'll see:
```
[INFO] 🔔 Playing alarm for 10 seconds
[INFO] 🔊 Playing alarm1.wav (5 times)
```

If there's an issue:
```
[WARNING] ⚠️ pygame not installed, trying winsound...
[WARNING] ⚠️ Alarm file not found: alarm1.wav
[INFO] 🔔 Using system beep instead
```

## Next Steps
1. Install pygame: `pip install pygame`
2. Verify alarm file location
3. Run test script: `python web-portal/python-api/test_alarm.py`
4. Restart schedule checker if it's running
5. Test with a real schedule
