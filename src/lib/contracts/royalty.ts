import { z } from 'zod';

export const RoyaltySummarySchema = z.object({
  totalEarnings: z.number(),
  pendingPayout: z.number(),
  publishedTitles: z.number(),
  currentMonthStatus: z
    .object({
      pending: z.number(),
      calculated: z.number(),
      paid: z.number(),
      held: z.number(),
    })
    .nullable(),
});

export type RoyaltySummary = z.infer<typeof RoyaltySummarySchema>;

export const BookSalesSchema = z.object({
  bookId: z.string(),
  title: z.string(),
  genre: z.string(),
  gross: z.number(),
  processorFee: z.number(),
  platformFee: z.number(),
  refunds: z.number(),
  chargebacks: z.number(),
  net: z.number(),
  royalty: z.number(),
  thisMonthPayout: z.number(),
});

export type BookSales = z.infer<typeof BookSalesSchema>;

export const StatementListSchema = z.object({
  id: z.string(),
  periodYear: z.number(),
  periodMonth: z.number(),
  totalRoyalty: z.number(),
  status: z.enum(['PENDING', 'CALCULATED', 'APPROVED', 'PAID', 'HELD']),
});

export type StatementList = z.infer<typeof StatementListSchema>;

export const SaleLineItemSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  title: z.string(),
  grossAmount: z.number(),
  processorFee: z.number(),
  platformFee: z.number(),
  refundAmount: z.number(),
  chargebackAmount: z.number(),
  netAmount: z.number(),
  royaltyAmount: z.number(),
  transactionDate: z.string(),
  transactionId: z.string(),
  type: z.enum(['SALE', 'REFUND', 'CHARGEBACK']),
});

export const PayoutInfoSchema = z.object({
  amount: z.number(),
  method: z.enum(['PAYPAL', 'STRIPE']),
  transactionId: z.string().nullable(),
  status: z.enum(['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'FLAGGED']),
  processedAt: z.string().nullable(),
  payoutEmailHint: z.string().nullable(),
  payoutAccountHint: z.string().nullable(),
});

export const StatementDetailSchema = z.object({
  id: z.string(),
  periodYear: z.number(),
  periodMonth: z.number(),
  totalGrossSales: z.number(),
  totalProcessorFees: z.number(),
  totalPlatformFees: z.number(),
  totalRefunds: z.number(),
  totalChargebacks: z.number(),
  totalNetRevenue: z.number(),
  totalRoyalty: z.number(),
  status: z.enum(['PENDING', 'CALCULATED', 'APPROVED', 'PAID', 'HELD']),
  sales: z.array(SaleLineItemSchema),
  payoutRecords: z.array(PayoutInfoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type StatementDetail = z.infer<typeof StatementDetailSchema>;

export const CurrentStatusSchema = z.object({
  currentMonth: z.number(),
  currentYear: z.number(),
  breakdown: z.object({
    pending: z.number(),
    calculated: z.number(),
    approved: z.number(),
    paid: z.number(),
    held: z.number(),
  }),
  totalPendingPayout: z.number(),
});

export type CurrentStatus = z.infer<typeof CurrentStatusSchema>;

export const PayoutSettingsSchema = z.object({
  method: z.enum(['paypal', 'stripe']).nullable(),
  hint: z
    .object({
      type: z.literal('email'),
      value: z.string(),
    })
    .or(
      z.object({
        type: z.literal('account'),
        value: z.string(),
      }),
    )
    .nullable(),
});

export type PayoutSettings = z.infer<typeof PayoutSettingsSchema>;

export const PayoutSettingsUpdateSchema = z
  .object({
    method: z.enum(['paypal', 'stripe']),
    paypalEmail: z.string().email().optional(),
    stripeAccountId: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.method === 'paypal' && !data.paypalEmail) return false;
      if (data.method === 'stripe' && !data.stripeAccountId) return false;
      return true;
    },
    { message: 'Email or account ID required for the selected method' },
  );

export type PayoutSettingsUpdate = z.infer<typeof PayoutSettingsUpdateSchema>;
