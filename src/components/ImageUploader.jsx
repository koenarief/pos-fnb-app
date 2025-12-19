import React, { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, storage } from "../firebase/config";
import PropTypes from "prop-types";
import { File, Camera } from "lucide-react";
import LiveCameraCapture from "./LiveCameraCapture";

ImageUploader.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  setImageUrl: PropTypes.func.isRequired,
};

function ImageUploader({ imageUrl, setImageUrl }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);
  const [error, setError] = useState(null);
  const userId = auth.currentUser?.uid;
  const fileInputRef = useRef(null);

  const handleButtonClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const cameraButtonClick = (e) => {
    e.preventDefault();
    setOpenCamera(true);
  };

  // --- Fungsi Upload Utama ---
  const handleUpload = (file) => {
    if (!file) return;

    // Reset state sebelumnya
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setImageUrl("");

    // 1. Buat referensi storage
    const storageRef = ref(
      storage,
      `users/${userId}/${Date.now()}_${file.name}`,
    );

    // 2. Mulai proses upload
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Pantau kemajuan upload
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setUploadProgress(progress);
      },
      (uploadError) => {
        // Tangani error
        // console.error("Upload error:", uploadError);
        setError("Gagal mengunggah file. Silakan coba lagi.");
        setIsUploading(false);
      },
      () => {
        // 3. Ambil URL publik setelah upload selesai
        getDownloadURL(uploadTask.snapshot.ref)
          .then((downloadURL) => {
            setImageUrl(downloadURL);
            setIsUploading(false);
          })
          .catch((urlError) => {
            // console.error("Error getting download URL:", urlError);
            setError("Gagal mendapatkan URL publik.");
            setIsUploading(false);
          });
      },
    );
  };

  // --- Handler Perubahan File (Instant Upload) ---
  const handleFileChange = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Panggil fungsi upload saat file dipilih
      handleUpload(selectedFile);
      // Reset input agar pengguna dapat memilih file yang sama lagi
      e.target.value = null;
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white">
      <div className="p-2 text-center">
        {/* Hasil Unggahan (URL dan Gambar) */}
        {imageUrl && !isUploading && (
          <div className="mt-4 w-48 h-48 rounded-lg overflow-hidden mx-auto">
            <img
              src={imageUrl}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Input File */}
        <button
          onClick={handleButtonClick}
          disabled={isUploading}
          className="mt-4 px-4 py-2 text-sm font-semibold text-gray-800 bg-indigo-100 rounded-lg shadow-md hover:bg-indigo-200 disabled:opacity-50"
        >
          <File />
        </button>
        <button
          className="mt-4 ml-2 px-4 py-2 text-sm font-semibold text-gray-800 bg-indigo-100 rounded-lg shadow-md hover:bg-indigo-200 disabled:opacity-50"
          onClick={cameraButtonClick}
        >
          <Camera />
        </button>
        {openCamera && (
          <LiveCameraCapture
            onCancel={() => setOpenCamera(false)}
            onConfirm={(url) => {
              setImageUrl(url);
            }}
          />
        )}

        <div className="mb-6">
          <input
            ref={fileInputRef}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2 
                       file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                       file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 
                       hover:file:bg-indigo-100 disabled:opacity-50 hidden"
            type="file"
            id="imageUpload"
            onChange={handleFileChange}
            accept="image/*"
            disabled={isUploading}
          />
        </div>

        {/* Status Upload dan Progress Bar */}
        {isUploading && (
          <div className="mt-4">
            <p className="text-indigo-600 text-sm mb-1">
              Mengunggah... ({uploadProgress}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Pesan Error */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
