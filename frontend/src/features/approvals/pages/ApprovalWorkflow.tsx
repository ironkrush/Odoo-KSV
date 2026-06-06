import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building, 
  Wallet, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApprovals, useExecuteApproval, ApprovalRequest } from '../hooks/useApprovals';

export const ApprovalWorkflow: React.FC = () => {
  const { data: approvals, isLoading, error } = useApprovals();
  const executeApprovalMutation = useExecuteApproval();
  
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [comment, setComment] = useState('');

  // Sync selected approval when data is loaded/updated
  useEffect(() => {
    if (approvals && approvals.length > 0) {
      // Keep the current selection if it still exists, otherwise select the first one
      const stillExists = approvals.find((a) => a.id === selectedApproval?.id);
      setSelectedApproval(stillExists || approvals[0]);
    } else {
      setSelectedApproval(null);
    }
  }, [approvals]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (error || !approvals) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-status-red">
        <p className="font-semibold">Failed to load approval requests workflow.</p>
      </div>
    );
  }

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedApproval) return;
    try {
      await executeApprovalMutation.mutateAsync({
        id: selectedApproval.id,
        action,
        comment: comment.trim() || undefined,
      });
      setComment('');
    } catch (err) {
      console.error('Failed to submit approval choice:', err);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'neutral';
    }
  };

  return (
    <div className="flex flex-col gap-comfortable">
      {/* Page Header */}
      <div className="border-b border-border-soft pb-comfortable text-left">
        <h1 className="text-headline-xl font-bold text-text-primary tracking-tight">Approval Workflow</h1>
        <p className="text-body-md text-text-secondary mt-1">Review procurement specifications and authorize purchase order tickets.</p>
      </div>

      {approvals.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <CheckCircle className="h-12 w-12 mx-auto text-primary mb-3" />
          <p className="font-semibold text-body-md">All caught up! No approvals pending review.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-comfortable items-stretch">
          {/* LEFT PANEL: Approvals List */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {approvals.map((app) => {
              const isSelected = selectedApproval?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApproval(app)}
                  className={`p-comfortable border rounded-card cursor-pointer text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary bg-white shadow-md ring-1 ring-primary-container'
                      : 'border-border-main bg-white hover:border-border-strong hover:bg-surface-bright'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-mono text-text-secondary">{app.id}</span>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status}
                    </Badge>
                  </div>
                  <h3 className="text-body-sm font-semibold text-text-primary mt-2">{app.title}</h3>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-soft text-[12px] text-text-secondary">
                    <span>By: {app.requester}</span>
                    <span className="font-bold text-primary-deep">{app.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT PANEL: Details Panel */}
          <div className="lg:col-span-7">
            {selectedApproval ? (
              <Card className="p-comfortable flex flex-col h-full text-left justify-between">
                <div className="flex flex-col gap-comfortable">
                  {/* Title & badge */}
                  <div className="flex justify-between items-start flex-wrap gap-2 border-b border-border-soft pb-4">
                    <div>
                      <span className="text-[11px] font-mono text-text-muted">{selectedApproval.id}</span>
                      <h2 className="text-title-md font-semibold text-text-primary mt-0.5">{selectedApproval.title}</h2>
                    </div>
                    <Badge variant={getStatusBadgeVariant(selectedApproval.status)}>
                      {selectedApproval.status}
                    </Badge>
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-background/50 border border-border-soft p-4 rounded-input text-body-sm text-text-secondary">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase font-bold text-text-muted">Amount</p>
                        <p className="font-bold text-text-primary mt-0.5">{selectedApproval.amount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase font-bold text-text-muted">Requester</p>
                        <p className="font-bold text-text-primary mt-0.5">{selectedApproval.requester}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-[11px] uppercase font-bold text-text-muted">Department</p>
                        <p className="font-bold text-text-primary mt-0.5 truncate">{selectedApproval.department}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description specs */}
                  <div>
                    <h4 className="text-label-md font-bold text-text-secondary uppercase tracking-wider mb-2">Specifications</h4>
                    <p className="text-body-sm text-text-secondary leading-relaxed bg-surface-bright border border-border-soft p-3 rounded-input">
                      {selectedApproval.description}
                    </p>
                  </div>
                </div>

                {/* Conditional Actions container */}
                <div className="mt-8 pt-4 border-t border-border-soft">
                  {selectedApproval.status === 'PENDING' ? (
                    <div className="flex flex-col gap-4">
                      {/* Comment */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-label-md font-semibold text-text-secondary flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-text-muted" />
                          Approval / Rejection Comments
                        </label>
                        <textarea
                          placeholder="Provide context or instructions for this action (optional)..."
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full p-3 bg-white border border-border-main rounded-input font-body-sm text-body-sm text-text-primary placeholder:text-text-disabled outline-none focus:border-primary-container focus:ring-2 focus:ring-tint-green transition-all"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="secondary"
                          className="border-status-red text-status-red hover:bg-status-red-soft hover:border-status-red/40"
                          icon={<XCircle className="h-4 w-4" />}
                          onClick={() => handleAction('REJECT')}
                          isLoading={executeApprovalMutation.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          className="bg-primary hover:bg-primary-container-hover"
                          icon={<CheckCircle className="h-4 w-4" />}
                          onClick={() => handleAction('APPROVE')}
                          isLoading={executeApprovalMutation.isPending}
                        >
                          Approve Request
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-surface-container-low border border-border-soft rounded-input flex items-center gap-3 text-body-sm text-text-secondary">
                      <AlertCircle className="h-5 w-5 text-text-muted shrink-0" />
                      <p>
                        This purchase request ticket was **{selectedApproval.status.toLowerCase()}** on {selectedApproval.createdAt}. No further review decisions are required.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center text-text-secondary py-12">
                <p>Select an approval request from the panel list to view specifications.</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
