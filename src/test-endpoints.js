import app from './app.js';
import prisma from './config/db.js';

const PORT = 3001;

async function runTests() {
  console.log('🤖 Running advanced role-based verification tests...');

  const server = app.listen(PORT, () => {
    console.log(`Test server started on http://localhost:${PORT}`);
  });

  try {
    // Clean up any test users/vendors to make the test idempotent
    const testUsers = await prisma.user.findMany({
      where: {
        email: { in: ['new_officer@vendorbridge.com', 'vendor_admin@globalelectronics.com'] }
      },
      select: { id: true }
    });
    const testUserIds = testUsers.map(u => u.id);

    if (testUserIds.length > 0) {
      await prisma.auditLog.deleteMany({
        where: { userId: { in: testUserIds } }
      });
      await prisma.user.deleteMany({
        where: { id: { in: testUserIds } }
      });
    }

    await prisma.vendor.deleteMany({
      where: { email: 'info@globalelectronics.com' }
    });

    // 1. Verify health
    const healthRes = await fetch(`http://localhost:${PORT}/api/health`);
    const healthData = await healthRes.json();
    console.log('Health check payload:', healthData);

    // 2. Test Registering a PROCUREMENT_OFFICER with extra fields
    console.log('\n--- 2. Registering a new Procurement Officer with details ---');
    const registerOfficerRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'new_officer@vendorbridge.com',
        name: 'Jane Officer Doe',
        password: 'password123',
        role: 'PROCUREMENT_OFFICER',
        phone: '1234567890',
        department: 'Regional Procurement Group',
        designation: 'Lead Buyer',
        approvalLimit: 75000.0,
      }),
    });
    const registerOfficerData = await registerOfficerRes.json();
    console.log('Registration status:', registerOfficerRes.status);
    console.log('Registered User details:', {
      name: registerOfficerData.name,
      role: registerOfficerData.role,
      phone: registerOfficerData.phone,
      department: registerOfficerData.department,
      approvalLimit: registerOfficerData.approvalLimit,
    });

    if (registerOfficerRes.status !== 201) {
      throw new Error(`Officer registration failed: ${JSON.stringify(registerOfficerData)}`);
    }

    // 3. Test Registering a VENDOR user with inline company creation (newVendorDetails)
    console.log('\n--- 3. Registering a Vendor User with inline company creation ---');
    const registerVendorRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor_admin@globalelectronics.com',
        name: 'John Sales Lead',
        password: 'password123',
        role: 'VENDOR',
        phone: '9998887776',
        department: 'Sales & BD',
        designation: 'VP Sales',
        newVendorDetails: {
          name: 'Global Electronics Corp',
          category: 'IT Hardware',
          gstNo: '24DDDDD4444D4Z4',
          contactNo: '0792345678',
          address: '401, Cyber Heights, GIDC',
          city: 'Gandhinagar',
          state: 'Gujarat',
          pincode: '382010',
          panNo: 'ABCDE9999X',
          bankName: 'ICICI Bank Ltd',
          bankAccNo: '999000888777',
          ifscCode: 'ICIC0009990',
          website: 'https://globalelectronics.com',
          email: 'info@globalelectronics.com',
        },
      }),
    });
    const registerVendorData = await registerVendorRes.json();
    console.log('Vendor Registration status:', registerVendorRes.status);
    console.log('Registered Vendor User linked vendorId:', registerVendorData.vendorId);

    if (registerVendorRes.status !== 201) {
      throw new Error(`Vendor registration failed: ${JSON.stringify(registerVendorData)}`);
    }

    // 4. Login as newly registered Vendor and check returns
    console.log('\n--- 4. Logging in as new Vendor User ---');
    const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor_admin@globalelectronics.com',
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('User Role:', loginData.user?.role);
    console.log('User Linked Company Name:', loginData.user?.vendor?.name);
    console.log('Vendor Company Bank Info:', {
      bankName: loginData.user?.vendor?.bankName,
      bankAccNo: loginData.user?.vendor?.bankAccNo,
      rating: loginData.user?.vendor?.rating,
      paymentTerms: loginData.user?.vendor?.paymentTerms,
    });

    if (!loginData.user?.vendor?.panNo) {
      throw new Error('Vendor company profile was not populated correctly upon login');
    }

    console.log('\n✅ Advanced Role-Based tests completed successfully!');
  } catch (error) {
    console.error('❌ Advanced tests failed:', error);
  } finally {
    server.close(() => {
      console.log('Test server shut down.');
    });
    await prisma.$disconnect();
  }
}

runTests();
