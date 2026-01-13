/**
 * Test script to verify image organization structure
 * Run with: node test-image-organization.js
 */

const path = require('path');

// Test path parsing logic (same as Python)
function testPathOrganization(imagePath) {
  console.log('\n' + '='.repeat(60));
  console.log('Testing path:', imagePath);
  console.log('='.repeat(60));
  
  // Parse path
  const pathParts = imagePath.replace(/\\/g, '/').split('/');
  
  // Find Grade and Section folders
  let gradeFolder = null;
  let sectionFolder = null;
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    if (part.startsWith('Grade-')) {
      gradeFolder = part;
      if (i + 1 < pathParts.length && pathParts[i + 1].startsWith('Section-')) {
        sectionFolder = pathParts[i + 1];
      }
      break;
    }
  }
  
  console.log('Grade folder:', gradeFolder);
  console.log('Section folder:', sectionFolder);
  
  // Create date folder
  const now = new Date();
  const dateFolder = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  
  console.log('Date folder:', dateFolder);
  console.log('Time string:', timeStr);
  
  // Build organized path
  let relativePath;
  if (gradeFolder && sectionFolder) {
    relativePath = path.join(gradeFolder, sectionFolder, dateFolder, `annotated_${timeStr}.jpg`);
  } else {
    relativePath = path.join(dateFolder, `annotated_${timeStr}.jpg`);
  }
  
  // Normalize for web (forward slashes)
  relativePath = relativePath.replace(/\\/g, '/');
  
  console.log('\n✓ Organized path:', relativePath);
  console.log('✓ Full URL:', `http://localhost:3000/uploads/${relativePath}`);
  
  return relativePath;
}

// Test cases
console.log('\n🧪 IMAGE ORGANIZATION TEST SUITE\n');

// Test 1: Standard upload path
testPathOrganization('C:/Users/Admin/CLEANLENESS/web-portal/public/uploads/Grade-7/Section-A/2026-01-13/original_08-00-00.jpg');

// Test 2: Different grade/section
testPathOrganization('C:/Users/Admin/CLEANLENESS/web-portal/public/uploads/Grade-8/Section-B/2026-01-13/original_14-30-00.jpg');

// Test 3: Unix-style path
testPathOrganization('/var/www/uploads/Grade-9/Section-C/2026-01-13/original_16-00-00.jpg');

// Test 4: Path without Grade/Section (fallback)
testPathOrganization('C:/Users/Admin/CLEANLENESS/web-portal/public/uploads/random_image.jpg');

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!');
console.log('='.repeat(60) + '\n');

// Expected structure visualization
console.log('📁 EXPECTED FOLDER STRUCTURE:\n');
console.log('public/uploads/');
console.log('├── Grade-7/');
console.log('│   ├── Section-A/');
console.log('│   │   ├── 2026-01-13/');
console.log('│   │   │   ├── original_08-00-00.jpg');
console.log('│   │   │   ├── annotated_08-00-00.jpg');
console.log('│   │   │   ├── original_14-00-00.jpg');
console.log('│   │   │   ├── annotated_14-00-00.jpg');
console.log('│   │   ├── 2026-01-14/');
console.log('│   │   │   ├── original_08-00-00.jpg');
console.log('│   │   │   ├── annotated_08-00-00.jpg');
console.log('│   ├── Section-B/');
console.log('│   │   ├── 2026-01-13/');
console.log('├── Grade-8/');
console.log('│   ├── Section-A/');
console.log('│   │   ├── 2026-01-13/');
console.log('\n');
