/**
 * Test Login API
 */

async function testLogin() {
  console.log('Testing Login API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✓ Login successful!');
    } else {
      console.log('\n✗ Login failed!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
