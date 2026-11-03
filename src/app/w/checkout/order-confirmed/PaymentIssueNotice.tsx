'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/nav/NavBar';
import { GenderStorage } from '@/shared/storage/genderStorage';

export type PaymentIssue = 'rejected' | 'review';

interface PaymentIssueNoticeProps {
  issue: PaymentIssue;
  orderId: string | null;
}

/**
 * Shown when the card callback sends the customer back with a payment that did
 * not end in a confirmed purchase.
 *
 * It deliberately does NOT read the order from the API: with `review` the order
 * may be cancelled, and its detail then answers 404 — the customer would get
 * "error al cargar el pedido" instead of the one message that tells them their
 * money was taken and what to do about it.
 */
const PaymentIssueNotice: React.FC<PaymentIssueNoticeProps> = ({
  issue,
  orderId,
}) => {
  const router = useRouter();
  const goToStore = () => router.push(`/${GenderStorage.getGender()}`);

  const rejected = issue === 'rejected';

  return (
    <div
      className="min-h-screen bg-white"
      style={{ paddingTop: 'var(--nav-height, 60px)' }}
    >
      <NavBar dynamicTransparent={false} />
      <div
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - var(--nav-height, 60px))' }}
      >
        <div
          className="text-center"
          style={{ maxWidth: '32rem', padding: '1.5rem' }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            {rejected ? '❌' : '⚠️'}
          </div>

          <h1
            className="font-bold text-gray-900"
            style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
          >
            {rejected
              ? 'No se pudo procesar tu pago'
              : 'Recibimos tu pago, pero falta confirmar tu compra'}
          </h1>

          <p className="text-gray-600" style={{ marginBottom: '1.5rem' }}>
            {rejected
              ? 'El banco no aprobó el pago, así que no se te cobró nada. Podés intentarlo de nuevo mientras tu orden siga vigente.'
              : 'Se cobró el pago, pero no pudimos confirmar la compra. Escribinos con tu número de orden y lo resolvemos.'}
          </p>

          {orderId && (
            <p
              className="text-gray-900"
              style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}
            >
              Número de orden:{' '}
              <strong style={{ letterSpacing: '0.02em' }}>#{orderId}</strong>
            </p>
          )}

          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center"
            style={{ gap: '0.75rem' }}
          >
            {rejected ? (
              <button
                type="button"
                onClick={() => router.push('/w/checkout')}
                className="bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
              >
                Volver a intentar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/contact')}
                className="bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
              >
                Contactanos
              </button>
            )}
            <button
              type="button"
              onClick={goToStore}
              className="font-semibold rounded-lg transition-colors hover:bg-gray-50"
              style={{
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                border: '1px solid #d1d5db',
                background: 'none',
                color: '#111827',
              }}
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentIssueNotice;
