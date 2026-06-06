import app from './app.js';
import prisma from './config/db.js';

const PORT = 3001;

async function runTests() {
  console.log('🤖 Running advanced business logic & approval chain verification tests...');

  const server = app.listen(PORT, () => {
    console.log(`Test server started on http://localhost:${PORT}`);
  });

  try {
    // -------------------------------------------------------------
    // Helper Logins
    // -------------------------------------------------------------
    const login = async (email, password) => {
      const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return data.token;
    };

    const officerToken = await login('officer@vendorbridge.com', 'password123');
    const headToken = await login('head@vendorbridge.com', 'password123');
    const financeToken = await login('finance@vendorbridge.com', 'password123');
    const vendor1Token = await login('vendor1@techcore.com', 'password123');
    const vendor2Token = await login('vendor2@infrasupplies.com', 'password123');

    // 1. Fetch Seeded RFQ to collect items
    const rfqRes = await fetch(`http://localhost:${PORT}/api/rfqs`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const rfqs = await rfqRes.json();
    const activeRfq = rfqs[0];
    const chairItem = activeRfq.items.find(i => i.itemName === 'Ergonomic chairs');
    const deskItem = activeRfq.items.find(i => i.itemName === 'Standing desks');

    console.log(`\nActive RFQ Found: "${activeRfq.title}" (ID: ${activeRfq.id})`);

    // 2. Vendor 1 (TechCore) submits a bid
    // Chairs: 25 * 5000 = 125,000 | Desks: 10 * 12000 = 120,000 | Subtotal = 245,000
    // Tax = 18% GST -> Total = 289,100
    console.log('\n--- 1. Submitting Quotation from Vendor 1 (TechCore) ---');
    const q1Res = await fetch(`http://localhost:${PORT}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vendor1Token}`,
      },
      body: JSON.stringify({
        rfqId: activeRfq.id,
        deliveryDays: 12,
        taxRate: 18.0,
        terms: 'Payment term: Net 30',
        items: [
          { rfqItemId: chairItem.id, unitPrice: 5000.0 },
          { rfqItemId: deskItem.id, unitPrice: 12000.0 },
        ],
      }),
    });
    const q1Data = await q1Res.json();
    console.log('Vendor 1 bid status:', q1Res.status);
    console.log('Vendor 1 bid total:', q1Data.totalAmount); // Should be 289100

    if (q1Data.totalAmount !== 289100) {
      throw new Error(`Cost calculation error: expected 289100, got ${q1Data.totalAmount}`);
    }

    // 3. Vendor 2 (Infra Supplies) submits a bid (Lower Price)
    // Chairs: 25 * 3000 = 75,000 | Desks: 10 * 8200 = 82,000 | Subtotal = 157,000
    // Tax = 18% GST -> Total = 185,260 (matches approx the screen wireframe total of ~185k)
    console.log('\n--- 2. Submitting Quotation from Vendor 2 (Infra Supplies) ---');
    const q2Res = await fetch(`http://localhost:${PORT}/api/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${vendor2Token}`,
      },
      body: JSON.stringify({
        rfqId: activeRfq.id,
        deliveryDays: 10,
        taxRate: 18.0,
        terms: 'Payment term: Net 45',
        items: [
          { rfqItemId: chairItem.id, unitPrice: 3000.0 },
          { rfqItemId: deskItem.id, unitPrice: 8200.0 },
        ],
      }),
    });
    const q2Data = await q2Res.json();
    console.log('Vendor 2 bid status:', q2Res.status);
    console.log('Vendor 2 bid total:', q2Data.totalAmount); // Should be 185260

    if (q2Data.totalAmount !== 185260) {
      throw new Error(`Cost calculation error: expected 185260, got ${q2Data.totalAmount}`);
    }

    // 4. Compare Quotations Side-by-Side (Verify compare endpoint)
    console.log('\n--- 3. Fetching Quotation Comparison Page ---');
    const compareRes = await fetch(`http://localhost:${PORT}/api/quotations/compare?rfqId=${activeRfq.id}`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const compareData = await compareRes.json();
    console.log('Compare status:', compareRes.status);
    console.log('Compare quotes counts:', compareData.quotations?.length);
    
    // Assert lowest price is correctly flagged
    const v1Quote = compareData.quotations.find(q => q.vendorId === q1Data.vendorId);
    const v2Quote = compareData.quotations.find(q => q.vendorId === q2Data.vendorId);
    console.log('Is TechCore flagged as lowest price?', v1Quote?.isLowestPrice); // false
    console.log('Is Infra Supplies flagged as lowest price?', v2Quote?.isLowestPrice); // true

    if (v1Quote?.isLowestPrice !== false || v2Quote?.isLowestPrice !== true) {
      throw new Error('Comparison error: lowest price flag is incorrect');
    }

    // 5. Select Quotation to launch Approval Workflow
    console.log('\n--- 4. Selecting Quotation 2 for Approval ---');
    const selectRes = await fetch(`http://localhost:${PORT}/api/quotations/${q2Data.id}/select`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const selectData = await selectRes.json();
    console.log('Select status:', selectRes.status);
    console.log('Selected workflow step:', selectData.workflow?.currentStep); // L1_PENDING

    const workflowId = selectData.workflow?.id;

    // 6. Rahul Mehta (PROCUREMENT_HEAD) L1 Review
    console.log('\n--- 5. Approving L1 Review (Rahul Mehta) ---');
    const approveL1Res = await fetch(`http://localhost:${PORT}/api/approvals/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${headToken}`,
      },
      body: JSON.stringify({
        workflowId,
        action: 'APPROVE',
        remarks: 'Prices are competitive. Passed to L2.',
      }),
    });
    const approveL1Data = await approveL1Res.json();
    console.log('L1 status:', approveL1Res.status);
    console.log('L1 Action workflow next step:', approveL1Data.currentStep); // L2_PENDING

    if (approveL1Data.currentStep !== 'L2_PENDING') {
      throw new Error('Approval workflow L1 state progression error');
    }

    // 7. Priya Shah (FINANCE_MANAGER) L2 Approval
    console.log('\n--- 6. Approving L2 Final Stage (Priya Shah) ---');
    const approveL2Res = await fetch(`http://localhost:${PORT}/api/approvals/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`,
      },
      body: JSON.stringify({
        workflowId,
        action: 'APPROVE',
        remarks: 'Budget aligned. Purchase Order generated.',
      }),
    });
    const approveL2Data = await approveL2Res.json();
    console.log('L2 status:', approveL2Res.status);
    console.log('L2 Action workflow next step:', approveL2Data.currentStep); // APPROVED

    if (approveL2Data.currentStep !== 'APPROVED') {
      throw new Error('Approval workflow L2 state progression error');
    }

    // 8. Verify Purchase Order was auto-generated
    console.log('\n--- 7. Verifying Purchase Order Generation ---');
    const poListRes = await fetch(`http://localhost:${PORT}/api/pos`, {
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    const poList = await poListRes.json();
    console.log('PO list count:', poList.length);
    console.log('Auto-generated PO details:', {
      poNumber: poList[0]?.poNumber,
      vendorName: poList[0]?.vendor?.name,
      totalAmount: poList[0]?.totalAmount,
    });

    if (poList.length === 0 || poList[0].totalAmount !== 185260) {
      throw new Error('Purchase Order verification failed: mismatch in total value or PO not created');
    }

    console.log('\n✅ All Business Logic and Approval Chain tests passed successfully!');
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
