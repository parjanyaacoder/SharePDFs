import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../../firebase';

function Comments({ pdfId, isOpen, onToggle, isShared = false }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [guestName, setGuestName] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!pdfId) return;

    const commentsRef = collection(db, 'pdfs', pdfId, 'comments');
    const q = query(commentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [pdfId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (isShared && !guestName.trim()) return;

    setIsPosting(true);
    try {
      const commentsRef = collection(db, 'pdfs', pdfId, 'comments');
      await addDoc(commentsRef, {
        text: newComment.trim(),
        userId: currentUser?.uid || 'guest',
        userName: currentUser?.displayName || guestName.trim() || 'Anonymous',
        timestamp: serverTimestamp(),
        isGuest: !currentUser,
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div
      className={`fixed z-50 right-0 top-0 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ width: '350px' }}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 h-16 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Comments</h2>
          <button onClick={onToggle} className="p-2 hover:bg-gray-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-800">{comment.userName}</span>
                <span className="text-sm text-gray-500">{formatTimestamp(comment.timestamp)}</span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmitComment} className="space-y-2">
            {isShared && !currentUser && (
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name..."
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              readOnly={isPosting}
            />
            <button
              type="submit"
              disabled={
                !newComment.trim() || isPosting || (isShared && !currentUser && !guestName.trim())
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed relative"
            >
              {isPosting ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Posting...
                </span>
              ) : (
                'Post Comment'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Comments;
