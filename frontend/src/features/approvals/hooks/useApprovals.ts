import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ApprovalRequest {
  id: string;
  title: string;
  amount: string;
  requester: string;
  department: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

let MOCK_APPROVALS: ApprovalRequest[] = [
  { id: 'APP-2026-001', title: 'IT Hardware Upgrade - Q3', amount: '$120,000.00', requester: 'John Doe', department: 'Information Technology', description: 'Procurement of 30 developer laptops and server rack memory expansions for scaling services.', status: 'PENDING', createdAt: '2026-06-01' },
  { id: 'APP-2026-002', title: 'Marketing Campaign Sourcing', amount: '$45,000.00', requester: 'Sarah Lee', department: 'Marketing & PR', description: 'Outsourced video production and ad placements with vendor MediaCorp.', status: 'PENDING', createdAt: '2026-06-03' },
  { id: 'APP-2026-003', title: 'Office Expansion Ergonomics', amount: '$15,000.00', requester: 'Aman Patel', department: 'Operations & Facilities', description: 'Desks, chairs, and acoustic panels for the newly opened collaborative workspace wing.', status: 'PENDING', createdAt: '2026-06-05' },
];

export const useApprovals = () => {
  return useQuery<ApprovalRequest[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return [...MOCK_APPROVALS];
    },
  });
};

export const useExecuteApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: 'APPROVE' | 'REJECT'; comment?: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      MOCK_APPROVALS = MOCK_APPROVALS.map((app) => {
        if (app.id === id) {
          return {
            ...app,
            status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
          };
        }
        return app;
      });

      console.log(`Executed action ${action} on approval ${id} with comment: ${comment}`);
      return { id, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
};
