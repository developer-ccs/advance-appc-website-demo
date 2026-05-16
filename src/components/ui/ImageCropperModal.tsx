"use client";

import {
  Check,
  Crop,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useEffect, useRef, useState } from "react";

const ImageCropperModal = ({
  file,
  onSave,
  onCancel,
}: {
  file: File;
  onSave: (croppedFile: File) => void;
  onCancel: () => void;
}) => {
  const cropperRef = useRef<any>(null);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleSave = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      cropperRef.current.cropper.getCroppedCanvas().toBlob(
        (blob: Blob | null) => {
          if (blob) {
            // Create a new File from the blob
            const croppedFile = new File([blob], file.name, {
              type: file.type || "image/jpeg",
            });
            onSave(croppedFile);
          }
        },
        file.type || "image/jpeg",
        0.9, // Image Quality
      );
    }
  };

  const handleRotate = (degree: number) => {
    cropperRef.current?.cropper?.rotate(degree);
  };

  const handleFlip = (direction: "x" | "y") => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    if (direction === "x") {
      cropper.scaleX(cropper.getData().scaleX === -1 ? 1 : -1);
    } else {
      cropper.scaleY(cropper.getData().scaleY === -1 ? 1 : -1);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Crop size={18} className="text-blue-900" />
            <h3 className="text-lg font-serif font-bold text-blue-900">
              Edit Image
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="p-4 bg-gray-50 flex-1 relative min-h-100">
          {imageSrc && (
            <Cropper
              src={imageSrc}
              style={{ height: 400, width: "100%" }}
              aspectRatio={1}
              guides={true}
              ref={cropperRef}
              viewMode={1}
              dragMode="move"
              background={false}
              responsive={true}
              checkOrientation={false}
            />
          )}
        </div>

        {/* Toolbar & Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4 bg-white rounded-b-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRotate(-90)}
              className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 transition"
              title="Rotate Left"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => handleRotate(90)}
              className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 transition"
              title="Rotate Right"
            >
              <RotateCw size={18} />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              onClick={() => handleFlip("x")}
              className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 transition"
              title="Flip Horizontal"
            >
              <FlipHorizontal size={18} />
            </button>
            <button
              onClick={() => handleFlip("y")}
              className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-gray-700 transition"
              title="Flip Vertical"
            >
              <FlipVertical size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-blue-900 text-white rounded hover:bg-blue-800 cursor-pointer transition"
            >
              <Check size={16} /> Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;
