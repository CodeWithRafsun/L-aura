import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, QrCode, CreditCard, Banknote, ShieldAlert, Award, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { PaymentMethodType, RestaurantSettings, TableSession, WaiterProfile } from '../types/index.ts';
import { generateQrDataUrl } from '../utils/qr.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: TableSession | null;
  tableNumber: string | null;
  settings: RestaurantSettings;
  waiters: WaiterProfile[];
  assignedWaiter?: WaiterProfile;
  onSubmitPayment: (payload: {
    method: PaymentMethodType;
    tipAmount: number;
    waiterId?: string;
    transactionReference?: string;
    receiptNote?: string;
  }) => Promise<void>;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  session,
  tableNumber,
  settings,
  waiters,
  assignedWaiter,
  onSubmitPayment,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('QR Code Payment');
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(
    assignedWaiter?.id || waiters[0]?.id || ''
  );
  const [selectedTipPercent, setSelectedTipPercent] = useState<number | 'custom' | 0>(18);
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const baseBill = session ? session.totalAccumulated : 0;

  // Calculate tip
  let calculatedTip = 0;
  if (selectedTipPercent === 'custom') {
    calculatedTip = Number(customTipAmount) || 0;
  } else if (typeof selectedTipPercent === 'number' && selectedTipPercent > 0) {
    calculatedTip = Number((baseBill * (selectedTipPercent / 100)).toFixed(2));
  }

  const finalGrandTotal = Number((baseBill + calculatedTip).toFixed(2));

  // Generate QR code for QR payment
  useEffect(() => {
    async function makeQR() {
      const paymentPayload = `LAURA-PAY://merchant=${encodeURIComponent(settings.qrPaymentDetails.merchantName)}&account=${encodeURIComponent(settings.qrPaymentDetails.accountNumber)}&table=${tableNumber}&amount=${finalGrandTotal}`;
      const url = await generateQrDataUrl(paymentPayload);
      setQrCodeDataUrl(url);
    }
    if (selectedMethod === 'QR Code Payment') {
      makeQR();
    }
  }, [selectedMethod, finalGrandTotal, tableNumber, settings]);

  const handlePay = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitPayment({
        method: selectedMethod,
        tipAmount: calculatedTip,
        waiterId: selectedWaiterId,
        transactionReference: transactionRef.trim() || undefined,
        receiptNote: receiptNote.trim() || undefined,
      });
      setIsComplete(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWaiter = waiters.find(w => w.id === selectedWaiterId) || assignedWaiter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
              <span>Table {tableNumber || '01'} Dining Tab</span>
              <span aria-hidden="true">·</span>
              <span>Final Settlement</span>
            </div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Digital Payment & Waiter Gratuity
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-7">
          
          {isComplete ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-serif text-neutral-900 dark:text-neutral-100 font-semibold">
                Payment Submitted Successfully
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                {selectedMethod === 'Online Card'
                  ? 'Your transaction has been processed and approved by the gateway.'
                  : 'Your payment record has been submitted to floor management. A staff member will verify your receipt shortly.'}
              </p>
              {calculatedTip > 0 && selectedWaiter && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 max-w-sm mx-auto">
                  Thank you for tipping {settings.currencySymbol}{calculatedTip.toFixed(2)} to {selectedWaiter.name}!
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Tab Summary Card */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Accumulated Table Bill
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {settings.currencySymbol}{baseBill.toFixed(2)}
                    </span>
                    <span className="text-xs text-neutral-500">
                      (Includes {settings.taxRatePercent}% tax & {settings.serviceChargePercent}% svc)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Grand Total with Tip
                  </span>
                  <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">
                    {settings.currencySymbol}{finalGrandTotal.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Waiter Selection Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Select Waiter / Sommelier to Tip</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">100% of tips go directly to staff</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {waiters.map(w => {
                    const isSelected = selectedWaiterId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWaiterId(w.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30'
                            : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <img
                          src={w.photoUrl}
                          alt={w.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 bg-neutral-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {w.name}
                          </p>
                          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                            {w.role}
                          </p>
                          <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            <span>{w.rating.toFixed(1)}</span>
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipping Percentage Options */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Gratuity Amount
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {settings.tippingOptions.map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setSelectedTipPercent(pct);
                        setCustomTipAmount('');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                        selectedTipPercent === pct
                          ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 font-bold shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                      }`}
                    >
                      {pct}% ({settings.currencySymbol}{(baseBill * (pct / 100)).toFixed(2)})
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setSelectedTipPercent('custom')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedTipPercent === 'custom'
                        ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 font-bold shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    Custom
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTipPercent(0);
                      setCustomTipAmount('0');
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedTipPercent === 0
                        ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 font-bold shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    No Tip
                  </button>
                </div>

                {selectedTipPercent === 'custom' && (
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-neutral-500">Custom Amount:</span>
                    <div className="relative w-36">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">
                        {settings.currencySymbol}
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={customTipAmount}
                        onChange={e => setCustomTipAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Select Settlement Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(['QR Code Payment', 'Online Card', 'Cash to Waiter', 'Cash at Counter'] as PaymentMethodType[]).map(method => {
                    const isSelected = selectedMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`p-3 rounded-xl border text-xs font-medium text-center flex flex-col items-center justify-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'bg-white dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300'
                        }`}
                      >
                        {method === 'QR Code Payment' && <QrCode className="w-5 h-5 text-amber-500" />}
                        {method === 'Online Card' && <CreditCard className="w-5 h-5 text-amber-500" />}
                        {(method === 'Cash to Waiter' || method === 'Cash at Counter') && <Banknote className="w-5 h-5 text-amber-500" />}
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Method Details */}
              {selectedMethod === 'QR Code Payment' && (
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {qrCodeDataUrl ? (
                      <div className="p-3 bg-white rounded-xl shadow-md border border-neutral-200 shrink-0">
                        <img
                          src={qrCodeDataUrl}
                          alt="L'Aura Payment QR Code"
                          className="w-36 h-36 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-36 h-36 bg-neutral-200 animate-pulse rounded-xl shrink-0" />
                    )}

                    <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                        Scan Merchant QR via Banking or Mobile Wallet
                      </p>
                      <p>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Merchant:</span> {settings.qrPaymentDetails.merchantName}
                      </p>
                      <p>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Account Ref:</span> <code className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1.5 py-0.5 rounded">{settings.qrPaymentDetails.accountNumber}</code>
                      </p>
                      <p>
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">Exact Due:</span> <strong className="font-mono text-amber-600 dark:text-amber-400 text-sm">{settings.currencySymbol}{finalGrandTotal.toFixed(2)}</strong>
                      </p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Staff will verify your transaction reference prior to clearing the table.</span>
                      </p>
                    </div>
                  </div>

                  {/* Transaction reference input */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 block mb-1">
                      Bank Transaction ID / Reference (Optional)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      placeholder="e.g. TXN-89412 or wallet confirmation code"
                      className="w-full text-xs p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {selectedMethod === 'Online Card' && (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Direct simulated high-security card checkout for instant automatic authorization.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase">Card Number</label>
                      <input
                        type="text"
                        readOnly
                        value="•••• •••• •••• 4242"
                        className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 uppercase">Expires / CVC</label>
                      <input
                        type="text"
                        readOnly
                        value="12/28 · •••"
                        className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(selectedMethod === 'Cash to Waiter' || selectedMethod === 'Cash at Counter') && (
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                    {selectedMethod === 'Cash to Waiter'
                      ? `Your assigned waiter (${selectedWaiter?.name || 'Julian Vance'}) will be summoned with your paper receipt.`
                      : 'Please present your table number at the front host register to settle.'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Amount to tender: <strong className="font-mono text-neutral-900 dark:text-neutral-100">{settings.currencySymbol}{finalGrandTotal.toFixed(2)}</strong>
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        {!isComplete && (
          <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                Final Settlement
              </span>
              <span className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">
                {settings.currencySymbol}{finalGrandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePay}
              disabled={isSubmitting || baseBill <= 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 disabled:opacity-50 transition-colors shadow-sm"
            >
              <span>{isSubmitting ? 'Recording Settlement...' : `Submit Payment`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
