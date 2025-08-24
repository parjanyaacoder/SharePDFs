import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import Comments from './Comments';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function SharedPDFViewer() {
  const { shareToken } = useParams();
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  useEffect(() => {
    const fetchSharedPdf = async () => {
      try {
        const pdfsRef = collection(db, 'pdfs');
        const q = query(pdfsRef, where(`shareTokens.${shareToken}.sharedAt`, '!=', null));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('Shared PDF not found or link has expired');
        }

        const pdfDoc = querySnapshot.docs[0];
        const data = pdfDoc.data();
        const sharedAt = new Date(data.shareTokens[shareToken].sharedAt);
        const now = new Date();
        const hoursDiff = (now - sharedAt) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          throw new Error('This share link has expired. Please request a new link.');
        }

        setPdfData({ ...data, id: pdfDoc.id });

        const storageRef = ref(storage, data.storagePath);
        const url = await getDownloadURL(storageRef);
        setDownloadUrl(url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPdf();
  }, [shareToken]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 text-lg">Loading PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-800">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{pdfData?.title || 'Shared PDF'}</h1>
          </div>
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <span>Show Comments</span>
          </button>
        </div>

        <div className="border rounded-lg p-4 min-h-[600px] bg-gray-100 flex flex-col items-center">
          {downloadUrl && (
            <>
              <Document
                file={downloadUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onError={onDocumentLoadError}
                className="flex flex-col items-center overflow-auto w-full"
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-lg"
                />
              </Document>
              {numPages && (
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                    disabled={pageNumber <= 1}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                    disabled={pageNumber >= numPages}
                    className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Comments
        pdfId={pdfData?.id}
        isOpen={isCommentsOpen}
        onToggle={() => setIsCommentsOpen(!isCommentsOpen)}
        isShared={true}
      />
    </div>
  );
}

export default SharedPDFViewer;
