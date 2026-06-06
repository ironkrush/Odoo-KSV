import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Star, CheckCircle, Award, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useRfqDetails, useQuotations, useAwardQuotation } from '../hooks/useRfq';

export const QuotationComparison: React.FC = () => {
  const { rfqId } = useParams<{ rfqId: string }>();
  const navigate = useNavigate();
  const { data: rfq, isLoading: isRfqLoading, error: rfqError } = useRfqDetails(rfqId);
  const { data: rawQuotations, isLoading: isQuotesLoading, error: quotesError } = useQuotations(rfqId);
  const quotations = rawQuotations || [];
  const awardQuotationMutation = useAwardQuotation();

  const isLoading = isRfqLoading || isQuotesLoading;
  const hasError = rfqError || quotesError || !rfq;

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center text-status-red">
        <p className="font-semibold">Failed to load RFQ comparison details.</p>
      </div>
    );
  }

  const handleAwardContract = async (quotationId: string) => {
    if (!rfqId) return;
    if (window.confirm('Are you sure you want to award this contract? This action will reject all other bids and close this RFQ.')) {
      try {
        await awardQuotationMutation.mutateAsync({ rfqId, quotationId });
      } catch (error) {
        console.error('Failed to award contract:', error);
      }
    }
  };

  const isClosed = rfq.status === 'CLOSED';

  return (
    <div className="flex flex-col gap-comfortable">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-border-soft pb-4 text-left">
        <button 
          onClick={() => navigate('/rfqs')}
          className="p-2 rounded-full text-text-secondary hover:bg-surface-container transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg font-bold text-text-primary tracking-tight">Comparison Matrix</h1>
            <Badge variant={isClosed ? 'success' : 'warning'}>
              {rfq.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-body-sm text-text-secondary mt-0.5">Analyze bidding terms side-by-side and award procurement contracts.</p>
        </div>
      </div>

      {/* RFQ Specifications Summary */}
      <Card className="p-comfortable text-left">
        <h2 className="text-title-md font-semibold text-text-primary mb-2">{rfq.title}</h2>
        <p className="text-body-sm text-text-secondary leading-relaxed">{rfq.description}</p>
        <div className="flex flex-wrap gap-comfortable mt-4 pt-4 border-t border-border-soft text-body-sm text-text-secondary">
          <p>Estimate Budget: <span className="font-semibold text-text-primary">{rfq.amount}</span></p>
          <p>Created Date: <span className="font-semibold text-text-primary">{rfq.createdAt}</span></p>
          <p>Requested By: <span className="font-semibold text-text-primary">{rfq.reqBy}</span></p>
        </div>
      </Card>

      {/* Comparison Matrix Table */}
      {quotations.length === 0 ? (
        <Card className="py-12 text-center text-text-secondary">
          <ShieldAlert className="h-12 w-12 mx-auto text-text-disabled mb-3" />
          <p className="font-semibold text-body-md">No quotations submitted yet.</p>
          <p className="text-body-sm text-text-muted mt-1">Vendors are still preparing bids. Check back later.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-border-main">
                  <th className="px-comfortable py-4 text-label-md text-text-secondary font-bold uppercase w-1/4">Bidding Parameter</th>
                  {quotations.map((quote) => (
                    <th key={quote.id} className="px-comfortable py-4 text-label-md text-text-primary font-bold uppercase text-center border-l border-border-soft">
                      <div className="flex flex-col items-center gap-1">
                        <span>{quote.vendorName}</span>
                        <div className="flex items-center gap-0.5 text-primary text-[12px] lowercase tracking-normal">
                          <Star className="h-3 w-3 fill-status-amber text-status-amber" />
                          <span>{quote.vendorRating}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft text-body-sm text-text-primary">
                {/* Cost Row */}
                <tr>
                  <td className="px-comfortable py-4 font-semibold text-text-secondary bg-[#FCFBF8]">Bidded Price</td>
                  {quotations.map((quote) => (
                    <td key={quote.id} className="px-comfortable py-4 text-center border-l border-border-soft font-bold text-body-md text-primary">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(quote.amount)}
                    </td>
                  ))}
                </tr>

                {/* Lead Time Row */}
                <tr>
                  <td className="px-comfortable py-4 font-semibold text-text-secondary bg-[#FCFBF8]">Delivery Timeline</td>
                  {quotations.map((quote) => (
                    <td key={quote.id} className="px-comfortable py-4 text-center border-l border-border-soft">
                      {quote.deliveryDays} Calendar Days
                    </td>
                  ))}
                </tr>

                {/* Terms Row */}
                <tr>
                  <td className="px-comfortable py-4 font-semibold text-text-secondary bg-[#FCFBF8]">Payment Terms</td>
                  {quotations.map((quote) => (
                    <td key={quote.id} className="px-comfortable py-4 text-center border-l border-border-soft font-medium">
                      {quote.paymentTerms}
                    </td>
                  ))}
                </tr>

                {/* Award Button triggers */}
                <tr>
                  <td className="px-comfortable py-4 font-semibold text-text-secondary bg-[#FCFBF8]">Contract Status</td>
                  {quotations.map((quote) => {
                    const isAwarded = quote.status === 'AWARDED';
                    return (
                      <td key={quote.id} className="px-comfortable py-6 text-center border-l border-border-soft">
                        {isClosed ? (
                          isAwarded ? (
                            <div className="flex flex-col items-center gap-1 text-primary">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-bold uppercase text-[11px] tracking-wide mt-1">Contract Awarded</span>
                            </div>
                          ) : (
                            <span className="text-text-disabled font-medium">Bid Rejected</span>
                          )
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-primary hover:bg-primary-container-hover"
                            icon={<Award className="h-4 w-4" />}
                            onClick={() => handleAwardContract(quote.id)}
                            isLoading={awardQuotationMutation.isPending}
                          >
                            Award Contract
                          </Button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
