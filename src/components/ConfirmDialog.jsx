import React from 'react';
import PropTypes from 'prop-types';

ConfirmDialog.propTypes = {
  isOpen: PropTypes.object.isRequired,
  onConfirm: PropTypes.object.isRequired,
  onCancel: PropTypes.object.isRequired,
  text: PropTypes.object.isRequired,
};

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  text,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
        <h2 className="text-xl font-semibold mb-4">Konfirmasi</h2>
        <p className="mb-6">{text}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
