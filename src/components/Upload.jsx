import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, db } from '../../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { auth } from '../../firebase';

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const generateUniqueFileName = (originalFileName) => {
    const timestamp = new Date().getTime();
    const fileExtension = originalFileName.split('.').pop();
    const fileNameWithoutExtension = originalFileName.slice(0, originalFileName.lastIndexOf('.'));
    return `${fileNameWithoutExtension}_${timestamp}.${fileExtension}`;
  };

  const validateTitle = (title) => {
    if (title.length < 3) {
      return 'Title must be at least 3 characters long';
    }
    if (title.length > 100) {
      return 'Title must not exceed 100 characters';
    }
    return '';
  };

  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file';
    }
    if (file.type !== 'application/pdf') {
      return 'Please upload a PDF file';
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }
    return '';
  };

  const isFormValid = () => {
    return title && file && !validateTitle(title) && !validateFile(file);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const titleError = validateTitle(newTitle);
    if (titleError) {
      setError(titleError);
    } else {
      setError('');
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    const fileError = validateFile(selectedFile);
    if (fileError) {
      setError(fileError);
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const uniqueFileName = generateUniqueFileName(file.name);
      const storageRef = ref(storage, `pdfs/${user.uid}/${uniqueFileName}`);
      await uploadBytes(storageRef, file);

      await addDoc(collection(db, 'pdfs'), {
        title,
        fileName: uniqueFileName,
        originalFileName: file.name,
        storagePath: `pdfs/${user.uid}/${uniqueFileName}`,
        userId: user.uid,
        userEmail: user.email,
        userDisplayName: user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-8 flex justify-center items-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Upload PDF</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                PDF Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
                minLength={3}
                maxLength={100}
                placeholder="Enter a title (3-100 characters)"
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                PDF File
              </label>
              <div
                onClick={handleBoxClick}
                className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <div className="text-blue-600 font-medium">
                    {file ? file.name : 'Click to select PDF file'}
                  </div>
                  <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleBackToDashboard}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
