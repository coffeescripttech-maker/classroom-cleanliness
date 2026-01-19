"""
Test script to verify alarm sound playback
"""
from pathlib import Path
import time

def test_alarm():
    """Test alarm sound playback"""
    alarm_file = Path(__file__).parent.parent / 'public' / 'alarm1.wav'
    
    print(f"Looking for alarm file at: {alarm_file}")
    print(f"File exists: {alarm_file.exists()}")
    
    if not alarm_file.exists():
        print("\n❌ ERROR: alarm1.wav not found!")
        print(f"   Expected location: {alarm_file}")
        print("\n   Please ensure alarm1.wav is in: web-portal/public/uploads/")
        return False
    
    print(f"\n✅ Alarm file found: {alarm_file.name}")
    print(f"   Size: {alarm_file.stat().st_size} bytes")
    
    # Try pygame
    try:
        import pygame
        print("\n✅ pygame is installed")
        
        pygame.mixer.init()
        print("✅ pygame mixer initialized")
        
        # Load and play the sound
        pygame.mixer.music.load(str(alarm_file))
        sound = pygame.mixer.Sound(str(alarm_file))
        duration = sound.get_length()
        
        print(f"✅ Sound loaded successfully")
        print(f"   Duration: {duration:.2f} seconds")
        
        print("\n🔊 Playing alarm sound...")
        pygame.mixer.music.play()
        
        while pygame.mixer.music.get_busy():
            time.sleep(0.1)
        
        pygame.mixer.quit()
        print("✅ Alarm playback completed!")
        return True
        
    except ImportError:
        print("\n❌ pygame is NOT installed")
        print("   Install with: pip install pygame")
        
        # Try winsound fallback
        try:
            import winsound
            print("\n✅ winsound is available (Windows fallback)")
            print("🔊 Playing alarm with winsound...")
            winsound.PlaySound(str(alarm_file), winsound.SND_FILENAME)
            print("✅ Alarm playback completed!")
            return True
        except Exception as e:
            print(f"\n❌ winsound failed: {e}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error playing alarm: {e}")
        return False

if __name__ == '__main__':
    print("="*60)
    print("Alarm Sound Test")
    print("="*60)
    success = test_alarm()
    print("\n" + "="*60)
    if success:
        print("✅ TEST PASSED - Alarm system is working!")
    else:
        print("❌ TEST FAILED - Please fix the issues above")
    print("="*60)
