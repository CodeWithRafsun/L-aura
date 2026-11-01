import React, { useEffect, useState } from 'react';
import { X, QrCode, Check, ShieldCheck, Printer, ExternalLink, RefreshCw } from 'lucide-react';
import { DiningTable, TableSession } from '../types/index.ts';
import { generateQrDataUrl } from '../utils/qr.ts';

interface TableSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: DiningTable[];
  currentTableNumber: string | null;
  onSelectTable: (table: DiningTable) => void;
  onCloseSession: (tableNumber: string) => Promise<void>;
}

export const TableSimulatorModal: React.FC<TableSimulatorModalProps> = ({
  isOpen,
  onClose,
  tables,
  currentTableNumber,
  onSelectTable,
  onCloseSession,
}) => {
  if (!isOpen) return null;

  const [selectedTable, setSelectedTable] = useState<DiningTable>(
    tables.find(t => t.tableNumber === currentTableNumber) || tables[0] || {} as any
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    async function loadQR() {
      if (!selectedTable?.tableNumber) return;
      const origin = window.location.origin;
      const fullUrl = `${origin}/?table=${selectedTable.tableNumber}&token=${selectedTable.qrSecretToken}`;
      const url = await generateQrDataUrl(fullUrl);
      setQrCodeDataUrl(url);
    }
    loadQR();
  }, [selectedTable]);

  const handleApply = (table: DiningTable) => {
    onSelectTable(table);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Table QR Code Identification & Session Simulator</span>
            </div>
            <h2 className="text-xl font-serif font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
              Select or Scan a Table QR Code
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Tables Selection List */}
          <div className="md:col-span-6 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
              Restaurant Dining Tables ({tables.length})
            </label>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {tables.map(table => {
                const isCurrent = currentTableNumber === table.tableNumber;
                const isSelectedInModal = selectedTable?.tableNumber === table.tableNumber;

                return (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelectedInModal
                        ? 'bg-amber-500/10 border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-mono font-bold text-sm text-neutral-800 dark:text-neutral-200">
                        {table.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            Table {table.tableNumber}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950 font-semibold font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                          {table.section} · {table.capacity} Guests
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        table.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600' :
                        table.status === 'Preparing' ? 'bg-amber-500/10 text-amber-600' :
                        table.status === 'Occupied' ? 'bg-sky-500/10 text-sky-600' :
                        'bg-neutral-500/10 text-neutral-500'
                      }`}>
                        {table.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Printable Physical QR Card Preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 text-center">
            
            {/* Table QR Card */}
            <div className="p-6 bg-white text-neutral-950 rounded-2xl shadow-xl border border-neutral-200 max-w-xs w-full space-y-3">
              <div className="text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                  L'AURA MODERN DINING
                </p>
                <h3 className="text-xl font-serif font-bold text-neutral-900">
                  Table {selectedTable?.tableNumber}
                </h3>
                <p className="text-[10px] text-neutral-400">
                  {selectedTable?.section}
                </p>
              </div>

              {/* QR Image */}
              <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center justify-center">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`Table ${selectedTable?.tableNumber} QR Code`}
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 bg-neutral-200 animate-pulse rounded" />
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-[11px] font-medium text-neutral-800">
                  Scan to Explore Menu & Order
                </p>
                <p className="text-[9px] text-neutral-500 font-mono break-all">
                  Token: {selectedTable?.qrSecretToken}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => handleApply(selectedTable)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-amber-400 dark:text-neutral-950 dark:hover:bg-amber-300 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Simulate Dining at Table {selectedTable?.tableNumber}</span>
              </button>

              {currentTableNumber === selectedTable?.tableNumber && (
                <button
                  onClick={async () => {
                    await onCloseSession(selectedTable.tableNumber);
                    onClose();
                  }}
                  className="w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  Clear & End Session for Table {selectedTable?.tableNumber}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
