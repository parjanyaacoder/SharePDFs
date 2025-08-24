import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function SharePDF({ pdfId, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  const generateShareLink = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const shareToken = Math.random().toString(36).substring(2, 15);

      const pdfRef = doc(db, 'pdfs', pdfId);
      await updateDoc(pdfRef, {
        [`shareTokens.${shareToken}`]: {
          sharedAt: new Date().toISOString(),
        },
      });

      const link = `${window.location.origin}/shared/${shareToken}`;
      setShareLink(link);
    } catch (error) {
      setError('Failed to generate share link. Please try again.');
      console.error('Error generating share link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Share PDF</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!shareLink ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              Generate a unique link to share this PDF with others. Anyone with the link will be
              able to view and comment on the PDF. The link will expire after 24 hours.
            </p>
            <button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">Share this link with others:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Anyone with this link can view and comment on the PDF.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SharePDF;
