import React, { useState } from 'react';
import { QrCode, X, CheckCircle, Key } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const QRCodeScanner = ({ announcementId, onScanSuccess, onClose }) => {
  const { token, API_URL } = useAuth();
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateQRCode = async () => {
    if (!qrCodeInput.trim()) {
      setError('Veuillez entrer le code QR');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/announcements/scan-qrcode`,
        {
          qr_data: qrCodeInput.trim(),
          announcement_id: announcementId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess(response.data.message);
        if (onScanSuccess) {
          setTimeout(() => {
            onScanSuccess();
            if (onClose) onClose();
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'QR code invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-green-600" />
            Scanner le QR Code
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        <div className="mb-4">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border-2 border-dashed border-green-300">
            <QrCode className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <p className="text-center text-sm text-gray-600 mb-4">
              Demandez au déposant de vous montrer son QR code, puis entrez le code ci-dessous
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code QR
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="Collez ou entrez le code QR ici"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && validateQRCode()}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>
            <button
              onClick={validateQRCode}
              disabled={loading || !qrCodeInput.trim()}
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? 'Validation...' : 'Valider'}
            </button>
          </div>

          <p className="text-xs text-center text-gray-500">
            Vous gagnerez +50 points après validation ! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;

