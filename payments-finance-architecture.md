# Payments, Deposits and Finance Architecture

## 1. Financial system principles

- The server is the source of truth for price, tax, discount, payable balance and payment state.
- Use integer minor currency units (e.g. paise for INR) where currency exponent is known; otherwise use an explicitly chosen fixed-precision decimal type. Never use binary floating point for money.
- Store currency with every monetary aggregate; do not mix currencies without an explicit FX workflow.
- Separate payment attempt, successful transaction/capture, refund, settlement and ledger entry.
- Financial transactions are append-only or corrected through reversing entries; do not silently overwrite history.
- Provider webhook/callback receipt does not equal verified capture until signature and provider state are verified.

## 2. Core entities

- `payment_intent`: amount due, currency, purpose (order, booking deposit, booking balance), customer and metadata.
- `payment_attempt`: provider, method, provider order/reference, state and retry count.
- `payment_transaction`: authorized/captured/failed/voided transaction with unique provider references.
- `refund`: amount, reason, original transaction, provider reference and state.
- `financial_ledger_entry`: immutable debit/credit or movement facts linked to source aggregate.
- `invoice`: immutable issued document with line/tax/customer snapshots and invoice number.
- `settlement`: provider settlement batch, fees, adjustment and payout status.
- `cash_movement`: cash in/out, sales, refunds, drawer transfer and variance.
- `reconciliation_case`: discrepancy requiring review.

## 3. Order and appointment obligations

Orders and bookings represent obligations. A deposit is an amount paid against an appointment's total obligation, not a second order. On POS billing, compute remaining balance from authoritative obligations and captured transactions. Do not infer deposit capture solely from booking status.

## 4. Payment workflow

1. Backend calculates payable amount from authoritative catalog/order/booking snapshot.
2. Backend creates payment intent and provider order/reference.
3. Client completes provider SDK/redirect flow.
4. Backend verifies callback signature and/or provider API state.
5. Provider webhook is received and authenticated against raw request body.
6. Webhook inbox deduplicates by provider event ID and queues durable processing.
7. Payment state and ledger/outbox update in transaction.
8. Reconciliation worker checks stale pending attempts and provider records.

Handle out-of-order and duplicate events. Do not downgrade a captured payment because a late failed event arrives. Do not double capture, double refund or double post ledger entries.

## 5. Tax and invoices

Implement versioned tax settings and store the applied tax snapshot on every order/booking invoice line. Support tax classification codes where required. Invoice numbering must be unique by legal entity/series and safe under concurrent issuance. Invoice PDFs are generated from immutable invoice data, not current product settings.

## 6. Financial reporting definitions

Document gross sales, discounts, tax collected, shipping, payment capture, refund amount, net sales, fees, payout, cash expected, cash counted, outstanding balance and forfeited deposit. Every chart/table must define date basis (order date, capture date, shipment date, settlement date) and timezone.

## 7. Reconciliation

Compare internal captured/refunded transactions against provider transactions and settlements. Create cases for missing webhook, amount mismatch, duplicate provider event, reversal, provider fee mismatch or settlement gap. Allow only permitted roles to resolve; require reason and retain before/after audit.
