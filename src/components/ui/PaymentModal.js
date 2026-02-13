'use client';

import { useState } from 'react';
import { X, CheckCircle, Loader2, Smartphone, CreditCard, Banknote, QrCode, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import CreditIndicator from '@/components/ui/CreditIndicator';

/**
 * PaymentModal — Modal de cobro con soporte para Yape/Plin/Efectivo/Tarjeta.
 *
 * @param {boolean}  isOpen      — Controla visibilidad
 * @param {function} onClose     — Cierra el modal
 * @param {number}   total       — Monto total a cobrar
 * @param {function} onConfirm   — Callback al confirmar pago: ({ paymentMethod, transactionId, notes })
 * @param {boolean}  submitting  — Estado de envío
 */
export default function PaymentModal({ isOpen, onClose, total, onConfirm, submitting, customer }) {
    const [selectedMethod, setSelectedMethod] = useState('cash');
    const [transactionId, setTransactionId] = useState('');
    const [cashReceived, setCashReceived] = useState('');
    const [isFiado, setIsFiado] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    // Credit validation
    const customerDebt = customer?.balance || 0;
    const creditLimit = customer?.credit_limit || 0;
    const newDebt = customerDebt + total;
    const exceedsLimit = creditLimit > 0 && newDebt > creditLimit;
    const availableCredit = Math.max(0, creditLimit - customerDebt);

    const isDigitalWallet = selectedMethod === 'yape' || selectedMethod === 'plin';
    const isCard = selectedMethod === 'card';
    const isCash = selectedMethod === 'cash';

    const cashChange = isCash && cashReceived
        ? parseFloat(cashReceived) - total
        : 0;

    const handleConfirm = () => {
        if (isFiado && exceedsLimit) {
            setError(`🚫 Excede el límite de crédito. Disponible: ${formatCurrency(availableCredit)}`);
            return;
        }
        if (!isFiado && isDigitalWallet && !transactionId.trim()) {
            setError('Ingresa el número de operación');
            return;
        }
        if (!isFiado && isCard && !transactionId.trim()) {
            setError('Ingresa el número de voucher');
            return;
        }
        setError('');
        onConfirm({
            paymentMethod: isFiado ? 'credit' : selectedMethod,
            transactionId: transactionId.trim() || null,
        });
    };

    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        setTransactionId('');
        setCashReceived('');
        setIsFiado(false);
        setError('');
    };

    const walletLabel = selectedMethod === 'yape' ? 'Yape' : 'Plin';
    const walletColor = selectedMethod === 'yape'
        ? { bg: 'bg-purple-500', light: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' }
        : { bg: 'bg-teal-500', light: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', glow: 'shadow-teal-500/20' };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal — full-width on mobile, constrained on desktop */}
            <div
                className="relative w-full sm:max-w-lg bg-surface-900 border border-surface-700/50 
                           rounded-t-3xl sm:rounded-2xl shadow-2xl animate-slide-up 
                           max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-surface-900/95 backdrop-blur-xl px-6 pt-5 pb-3 border-b border-surface-700/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-surface-100">Cobrar</h2>
                            <p className="text-xs text-surface-500">Selecciona el método de pago</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-surface-800 transition-colors text-surface-400 hover:text-surface-200"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Total */}
                    <div className="mt-3 text-center py-3 rounded-xl bg-surface-800/80 border border-surface-700/50">
                        <p className="text-xs text-surface-500 uppercase font-semibold tracking-wide">Total a pagar</p>
                        <p className="text-3xl font-extrabold text-primary-400 mt-1">{formatCurrency(total)}</p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Payment Method Selector */}
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {PAYMENT_METHODS.map((pm) => (
                            <button
                                key={pm.value}
                                onClick={() => handleMethodChange(pm.value)}
                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200
                                    ${selectedMethod === pm.value
                                        ? pm.value === 'yape'
                                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                            : pm.value === 'plin'
                                                ? 'bg-teal-500/10 border-teal-500/50 shadow-lg shadow-teal-500/10'
                                                : 'bg-primary-500/10 border-primary-500/50 shadow-lg shadow-primary-500/10'
                                        : 'bg-surface-800/50 border-surface-700/30 hover:border-surface-600'
                                    }`}
                            >
                                <span className="text-2xl">{pm.icon}</span>
                                <span className={`text-xs font-semibold ${selectedMethod === pm.value
                                    ? pm.value === 'yape' ? 'text-purple-400'
                                        : pm.value === 'plin' ? 'text-teal-400'
                                            : 'text-primary-400'
                                    : 'text-surface-400'
                                    }`}>
                                    {pm.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* === FIADO / CRÉDITO TOGGLE === */}
                    {customer && creditLimit > 0 && (
                        <div className="animate-fade-in">
                            <button
                                onClick={() => { setIsFiado(!isFiado); setError(''); }}
                                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3
                                    ${isFiado
                                        ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                                        : 'bg-surface-800/50 border-surface-700/30 hover:border-surface-600'
                                    }`}
                            >
                                <div className={`w-12 h-7 rounded-full relative transition-all duration-200 flex-shrink-0
                                    ${isFiado ? 'bg-amber-500' : 'bg-surface-600'}`}
                                >
                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-200
                                        ${isFiado ? 'left-[calc(100%-26px)]' : 'left-0.5'}`}
                                    />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={`text-sm font-bold ${isFiado ? 'text-amber-400' : 'text-surface-300'}`}>
                                        📌 Venta al Fiado
                                    </p>
                                    <p className="text-[11px] text-surface-500">
                                        Disponible: {formatCurrency(availableCredit)} de {formatCurrency(creditLimit)}
                                    </p>
                                </div>
                            </button>

                            {isFiado && (
                                <div className="mt-3 space-y-3 animate-fade-in">
                                    <CreditIndicator customer={customer} />
                                    {exceedsLimit && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-semibold text-red-400">🚫 Límite de crédito excedido</p>
                                                <p className="text-[11px] text-red-400/80 mt-0.5">
                                                    Deuda actual: {formatCurrency(customerDebt)} + Esta venta: {formatCurrency(total)} = {formatCurrency(newDebt)}
                                                </p>
                                                <p className="text-[11px] text-red-400/80">
                                                    Límite: {formatCurrency(creditLimit)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* === EFECTIVO === */}
                    {isCash && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                <label className="text-xs font-semibold text-green-400 uppercase mb-2 block">
                                    <Banknote className="w-3.5 h-3.5 inline mr-1" />
                                    Monto recibido (opcional)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-field text-lg font-bold text-center"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    min="0"
                                    step="0.01"
                                />
                                {cashReceived && parseFloat(cashReceived) >= total && (
                                    <div className="mt-3 text-center py-2 rounded-lg bg-green-500/10">
                                        <span className="text-xs text-surface-400">Cambio: </span>
                                        <span className="text-lg font-bold text-green-400">
                                            {formatCurrency(cashChange)}
                                        </span>
                                    </div>
                                )}
                                {cashReceived && parseFloat(cashReceived) < total && (
                                    <p className="mt-2 text-xs text-amber-400 text-center">
                                        Faltan {formatCurrency(total - parseFloat(cashReceived))}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === YAPE / PLIN === */}
                    {isDigitalWallet && (
                        <div className="space-y-4 animate-fade-in">
                            {/* QR Code */}
                            <div className={`p-5 rounded-xl ${walletColor.light} border ${walletColor.border} text-center`}>
                                <div className="flex justify-center mb-3">
                                    <div className={`w-48 h-48 rounded-2xl ${walletColor.bg}/10 border-2 ${walletColor.border} 
                                                    flex items-center justify-center overflow-hidden`}>
                                        <div className="text-center p-4">
                                            <QrCode className={`w-20 h-20 mx-auto ${walletColor.text} mb-2`} />
                                            <p className={`text-xs font-semibold ${walletColor.text}`}>
                                                Escanea con {walletLabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-surface-500 mb-1">Total a {selectedMethod === 'yape' ? 'Yapear' : 'Plinear'}</p>
                                <p className={`text-2xl font-extrabold ${walletColor.text}`}>
                                    {formatCurrency(total)}
                                </p>
                            </div>

                            {/* Transaction ID */}
                            <div>
                                <label className={`text-xs font-semibold ${walletColor.text} uppercase mb-2 block`}>
                                    <Smartphone className="w-3.5 h-3.5 inline mr-1" />
                                    Nº de Operación / Constancia *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: 12345678"
                                    className="input-field text-center text-lg font-mono tracking-wider"
                                    value={transactionId}
                                    onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                    maxLength={20}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs text-red-400 mt-1.5">{error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === TARJETA === */}
                    {isCard && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                                <label className="text-xs font-semibold text-blue-400 uppercase mb-2 block">
                                    <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                                    Nº de Voucher / Aprobación *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Últimos 4 dígitos o Nº aprobación"
                                    className="input-field text-center text-lg font-mono tracking-wider"
                                    value={transactionId}
                                    onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                    maxLength={20}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs text-red-400 mt-1.5">{error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === TRANSFERENCIA === */}
                    {selectedMethod === 'transfer' && (
                        <div className="space-y-3 animate-fade-in">
                            <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                                <label className="text-xs font-semibold text-cyan-400 uppercase mb-2 block">
                                    🏦 Nº de Operación Bancaria
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nº de operación o CCI"
                                    className="input-field text-center text-lg font-mono tracking-wider"
                                    value={transactionId}
                                    onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
                                    maxLength={30}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — Confirm Button */}
                <div className="sticky bottom-0 bg-surface-900/95 backdrop-blur-xl px-6 py-4 border-t border-surface-700/50">
                    {error && (
                        <p className="text-xs text-red-400 text-center mb-2 animate-fade-in">{error}</p>
                    )}
                    <button
                        onClick={handleConfirm}
                        disabled={submitting || (isFiado && exceedsLimit)}
                        className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-200 
                                    flex items-center justify-center gap-2 active:scale-[0.98]
                                    ${isFiado
                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25'
                                : selectedMethod === 'yape'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/25'
                                    : selectedMethod === 'plin'
                                        ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-lg shadow-teal-500/25'
                                        : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25'
                            }
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                {isFiado
                                    ? `📌 Registrar Fiado — ${formatCurrency(total)}`
                                    : isDigitalWallet
                                        ? `Validar Pago ${walletLabel}`
                                        : `Confirmar Cobro — ${formatCurrency(total)}`
                                }
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
