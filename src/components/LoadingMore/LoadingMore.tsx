'use client';
import React from 'react';
import './LoadingMore.css';

interface LoadingMoreProps {
  text?: string;
}

export default function LoadingMore({
  text = 'Cargando más productos...',
}: LoadingMoreProps) {
  return (
    <div className="loading-more-container">
      <div className="spinner" aria-hidden="true"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
}
