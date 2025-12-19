import React, { useRef, useEffect, useState } from "react";
import { auth, storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PropTypes from "prop-types";
import { SwitchCamera, Camera, X } from 'lucide-react';

LiveCameraCapture.propTypes = {
  onConfirm: PropTypes.object.isRequired,
  onCancel: PropTypes.object.isRequired,
};

export default function LiveCameraCapture({ onConfirm, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [depan, setDepan] = useState(false);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    async function getCameraStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: depan ? "user" : "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
      }
    }
    getCameraStream();

    // Stop the camera stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [depan]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png"); // Get image as data URL
      setImageSrc(imageDataUrl);

      let mediaStream = videoRef.current.srcObject;

      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => {
        track.stop(); // Stop each individual track
      });
      mediaStream = null;
      uploadToFirebase();
    }
  };

  const uploadToFirebase = () => {
    const storageRef = ref(
      storage,
      `users/${userId}/${Date.now()}_idkasir.jpg`,
    ); // Path in Storage
    const canvas = canvasRef.current;

    canvas.toBlob(
      (blob) => {
        uploadBytes(storageRef, blob)
          .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadUrl) => {
              onConfirm(downloadUrl);
              onCancel(); // close dialog
            });
          })
          .catch((error) => {
            console.error("Error uploading image:", error);
          });
      },
      "image/jpeg",
      0.8,
    ); // Get Blob from canvas
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg mx-auto">
        {imageSrc ? (
          <img src={imageSrc} alt="Captured" />
        ) : (
          <video ref={videoRef} autoPlay playsInline />
        )}
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={() => setDepan(!depan)}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <SwitchCamera className="w-4 h-4"/>
          </button>
          <button
            onClick={capturePhoto}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Camera className="w-4 h-4"/>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </div>
  );
}
