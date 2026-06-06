import app from './app.js';
import prisma from './config/db.js';

const PORT = 3001; // Use a different port to avoid conflicts

async function runTests() {
  console.log('🤖 Running backend endpoint validation tests...');

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`Test server started on http://localhost:${PORT}`);
  });

  try {
    // 1. Verify Health check
    console.log('\n--- 1. Health check ---');
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health check status:', healthRes.status);
    console.log('Health check payload:', healthData);

    if (healthData.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // 2. Login as Procurement Officer
    console.log('\n--- 2. Procurement Officer Login ---');
    const officerLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'officer@vendorbridge.com',
        password: 'password123',
      }),
    });
    const officerLoginData = await officerLoginRes.json();
    console.log('Officer Login status:', officerLoginRes.status);
    console.log('Officer Role:', officerLoginData.user?.role);
    console.log('Token generated successfully:', !!officerLoginData.token);

    if (!officerLoginData.token) {
      throw new Error('Officer login failed');
    }

    const officerToken = officerLoginData.token;

    // 3. Fetch RFQs as Procurement Officer (should see the seeded RFQ)
    console.log('\n--- 3. Fetch RFQs as Procurement Officer ---');
    const rfqsRes = await fetch(`http://localhost:${PORT}/api/rfqs`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const rfqsData = await rfqsRes.json();
    console.log('Fetch RFQs status:', rfqsRes.status);
    console.log('Number of RFQs returned:', rfqsData.length);
    console.log('RFQ Title:', rfqsData[0]?.title);

    if (rfqsData.length === 0) {
      throw new Error('Seeded RFQ not retrieved');
    }

    // 4. Login as Vendor 1
    console.log('\n--- 4. Vendor Login ---');
    const vendorLoginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor1@techcore.com',
        password: 'password123',
      }),
    });
    const vendorLoginData = await vendorLoginRes.json();
    console.log('Vendor Login status:', vendorLoginRes.status);
    console.log('Vendor Role:', vendorLoginData.user?.role);
    console.log('Vendor ID linked to User:', vendorLoginData.user?.vendorId);

    const vendorToken = vendorLoginData.token;

    // 5. Fetch RFQs as Vendor (Should only see RFQs they are invited to)
    console.log('\n--- 5. Fetch RFQs as Vendor ---');
    const vendorRfqsRes = await fetch(`http://localhost:${PORT}/api/rfqs`, {
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    const vendorRfqsData = await vendorRfqsRes.json();
    console.log('Fetch RFQs as Vendor status:', vendorRfqsRes.status);
    console.log('Number of RFQs returned to Vendor:', vendorRfqsData.length);

    // 6. Test RBAC: Access audit logs as Vendor (Should be Forbidden: 403)
    console.log('\n--- 6. Test RBAC (Access logs as Vendor) ---');
    const logsRes = await fetch(`http://localhost:${PORT}/api/audit/logs`, {
      headers: { Authorization: `Bearer ${vendorToken}` },
    });
    const logsData = await logsRes.json();
    console.log('Access logs status:', logsRes.status);
    console.log('Response payload:', logsData);

    if (logsRes.status !== 403) {
      throw new Error('RBAC validation failed: Vendor was able to access audit logs');
    }

    console.log('\n✅ All integration tests passed successfully!');
  } catch (error) {
    console.error('❌ Tests failed with error:', error);
  } finally {
    // Close HTTP server and DB client disconnect
    server.close(() => {
      console.log('\nTest server shut down.');
    });
    await prisma.$disconnect();
  }
}

runTests();
