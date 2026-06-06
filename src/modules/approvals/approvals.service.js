import prisma from '../../config/db.js';

export const getPendingWorkflows = async (role) => {
  if (role === 'ADMIN') {
    return prisma.approvalWorkflow.findMany({
      where: {
        currentStep: { in: ['L1_PENDING', 'L2_PENDING'] },
      },
      include: {
        quotation: {
          include: {
            rfq: true,
            vendor: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  const currentStep = role === 'PROCUREMENT_HEAD' ? 'L1_PENDING' : role === 'FINANCE_MANAGER' ? 'L2_PENDING' : null;
  if (!currentStep) return [];

  return prisma.approvalWorkflow.findMany({
    where: { currentStep },
    include: {
      quotation: {
        include: {
          rfq: true,
          vendor: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const submitApprovalAction = async (workflowId, action, remarks, actor) => {
  return prisma.$transaction(async (tx) => {
    // 1. Fetch workflow details
    const workflow = await tx.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        quotation: {
          include: {
            rfq: true,
          },
        },
      },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const { role, id: actorId } = actor;

    // Validate workflow step matches role (or bypass if ADMIN)
    if (role !== 'ADMIN') {
      if (workflow.currentStep === 'L1_PENDING' && role !== 'PROCUREMENT_HEAD') {
        throw new Error('Forbidden: Only the Procurement Head can approve this L1 review step');
      }
      if (workflow.currentStep === 'L2_PENDING' && role !== 'FINANCE_MANAGER') {
        throw new Error('Forbidden: Only the Finance Manager can approve this L2 approval step');
      }
    }

    const currentStepName = workflow.currentStep === 'L1_PENDING' ? 'L1' : 'L2';
    let nextStep = workflow.currentStep;

    // 2. Action Logic
    if (action === 'REJECT') {
      nextStep = 'REJECTED';
      // Mark quotation as REJECTED
      await tx.quotation.update({
        where: { id: workflow.quotationId },
        data: { status: 'REJECTED' },
      });
    } else if (action === 'APPROVE') {
      if (workflow.currentStep === 'L1_PENDING') {
        nextStep = 'L2_PENDING';
      } else if (workflow.currentStep === 'L2_PENDING') {
        nextStep = 'APPROVED';

        // Final Approval reached!
        // A. Accept this quotation
        await tx.quotation.update({
          where: { id: workflow.quotationId },
          data: { status: 'ACCEPTED' },
        });

        // B. Reject other quotations for the same RFQ
        await tx.quotation.updateMany({
          where: {
            rfqId: workflow.rfqId,
            id: { not: workflow.quotationId },
          },
          data: { status: 'REJECTED' },
        });

        // C. Update RFQ status
        await tx.rFQ.update({
          where: { id: workflow.rfqId },
          data: { status: 'PO_GENERATED' },
        });

        // D. Auto-generate Purchase Order
        const poCount = await tx.purchaseOrder.count();
        const nextPoNumber = `PO-2026-${String(poCount + 1).padStart(4, '0')}`;
        
        // Calculate due date (PO date + delivery days from quotation)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + workflow.quotation.deliveryDays);

        await tx.purchaseOrder.create({
          data: {
            poNumber: nextPoNumber,
            rfqId: workflow.rfqId,
            quotationId: workflow.quotationId,
            vendorId: workflow.quotation.vendorId,
            dueDate,
            status: 'SENT',
            totalAmount: workflow.quotation.totalAmount,
          },
        });
      }
    }

    // 3. Record Approval Action
    await tx.approvalAction.create({
      data: {
        workflowId,
        step: currentStepName,
        action,
        remarks,
        actorId,
      },
    });

    // 4. Update workflow state
    const updatedWorkflow = await tx.approvalWorkflow.update({
      where: { id: workflowId },
      data: { currentStep: nextStep },
    });

    // 5. Write immutable audit log
    await tx.auditLog.create({
      data: {
        action: `WORKFLOW_${action}`,
        userId: actorId,
        details: JSON.stringify({ workflowId, action, nextStep, quotationId: workflow.quotationId }),
      },
    });

    return updatedWorkflow;
  });
};
