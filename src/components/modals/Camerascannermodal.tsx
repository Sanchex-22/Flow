import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useTheme } from '../../context/themeContext';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (serial: string) => void;
  deviceBrand?: string; // Para aplicar validaciones específicas por marca
}

const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  deviceBrand = '',
}) => {
  const { isDarkMode } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Detectar si es dispositivo móvil
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Clases dinámicas
  const modalBg = isDarkMode ? 'bg-gray-900' : 'bg-white';
  const textClass = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const subTextClass = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClass = isDarkMode
    ? 'w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';
  const buttonClass = isDarkMode
    ? 'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
    : 'px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors';

  // Limpiar y validar datos escaneados
  const cleanSerialNumber = (raw: string): string => {
    let cleaned = raw.trim();

    // Eliminar prefijos comunes
    const prefixes = ['S/N:', 'SN:', 'SERIAL:', 'Serial Number:', 'S/N '];
    for (const prefix of prefixes) {
      if (cleaned.toUpperCase().startsWith(prefix.toUpperCase())) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }

    // Eliminar espacios internos
    cleaned = cleaned.replace(/\s+/g, '');

    // Correcciones comunes de OCR
    // Solo aplicar si parece que el serial tiene números al final
    if (/\d/.test(cleaned)) {
      // Reemplazar O por 0 al final
      cleaned = cleaned.replace(/O$/gi, '0');
      // Reemplazar I por 1 en contextos numéricos
      cleaned = cleaned.replace(/I(?=\d)/gi, '1');
      cleaned = cleaned.replace(/(?<=\d)I/gi, '1');
    }

    return cleaned;
  };

  // Validar formato según marca
  const validateSerialFormat = (serial: string, brand: string): boolean => {
    if (!serial || serial.length < 5) return false;

    const brandUpper = brand.toUpperCase();

    // Validaciones específicas por marca
    const validations: Record<string, RegExp> = {
      DELL: /^[A-Z0-9]{7}$/, // Service Tag de 7 caracteres
      HP: /^[A-Z0-9]{10}$/, // Serial de 10 caracteres típicamente
      LENOVO: /^[A-Z0-9]{8,10}$/, // 8-10 caracteres
      APPLE: /^[A-Z0-9]{12}$/, // 12 caracteres
      CISCO: /^[A-Z]{3}\d{8}[A-Z0-9]{2}$/, // Formato específico de Cisco
    };

    if (validations[brandUpper]) {
      return validations[brandUpper].test(serial);
    }

    // Validación genérica: entre 5 y 20 caracteres alfanuméricos
    return /^[A-Z0-9]{5,20}$/i.test(serial);
  };

  // Iniciar escáner
  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' }, // Cámara trasera
        config,
        (decodedText) => {
          // Éxito al escanear código de barras/QR
          const cleaned = cleanSerialNumber(decodedText);
          setScannedData(cleaned);
          stopScanner();
        },
        (errorMessage) => {
            // Error de escaneo (no crítico, solo para debug)
            console.warn('Error de escaneo:', errorMessage);
        }
      );
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setIsCameraAvailable(false);
      setIsScanning(false);
    }
  };

  // Detener escáner
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  // Toggle Flash (si está disponible)
  const toggleFlash = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;

      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any],
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          console.error('Flash no disponible:', err);
        }
      }
    }
  };

  // Confirmar y enviar serial
  const handleConfirm = () => {
    if (!scannedData.trim()) {
      setError('Por favor ingresa o escanea un número serial');
      return;
    }

    const isValid = validateSerialFormat(scannedData, deviceBrand);

    if (!isValid && deviceBrand) {
      setError(
        `El formato no coincide con un serial típico de ${deviceBrand}. ¿Deseas continuar de todas formas?`
      );
      // Permitir continuar de todas formas después de advertencia
    }

    onScanSuccess(scannedData);
    handleClose();
  };

  // Cerrar modal
  const handleClose = () => {
    stopScanner();
    setScannedData('');
    setError('');
    setFlashEnabled(false);
    onClose();
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className={`${modalBg} rounded-xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto transition-colors`}
      >
        {/* Header */}
        <div className="border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold ${textClass}`}>
                Escanear Número Serial
              </h2>
              <p className={`text-sm mt-1 ${subTextClass}`}>
                {isMobileDevice
                  ? 'Enfoca el código de barras o la etiqueta del equipo'
                  : 'Esta función está optimizada para dispositivos móviles'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`${buttonClass} !p-2`}
              aria-label="Cerrar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Instrucciones */}
          {!isScanning && !scannedData && (
            <div
              className={`rounded-lg p-4 border ${
                isDarkMode
                  ? 'bg-blue-900/30 border-blue-700 text-blue-200'
                  : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}
            >
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1 text-sm">
                  <p className="font-semibold mb-2">💡 Consejos para un escaneo exitoso:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Busca el código de barras en la etiqueta del equipo</li>
                    <li>Asegúrate de tener buena iluminación (usa el flash si es necesario)</li>
                    <li>Mantén la cámara estable y enfocada</li>
                    <li>Si no hay código de barras, puedes escribir el serial manualmente</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className={`rounded-lg p-4 border ${
                isDarkMode
                  ? 'bg-red-900/30 border-red-700 text-red-200'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Scanner / Input Area */}
          {isMobileDevice && isCameraAvailable ? (
            <div className="space-y-4">
              {/* Botón para iniciar escaneo */}
              {!isScanning && !scannedData && (
                <button
                  onClick={startScanner}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Abrir Cámara
                </button>
              )}

              {/* Visor de cámara */}
              {isScanning && (
                <div className="relative">
                  <div
                    id="qr-reader"
                    className="rounded-lg overflow-hidden"
                    style={{ width: '100%' }}
                  />

                  {/* Controles de cámara */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={toggleFlash}
                      className={`p-3 rounded-full ${
                        flashEnabled ? 'bg-yellow-500' : 'bg-gray-800/80'
                      } text-white backdrop-blur-sm`}
                      aria-label="Toggle flash"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={stopScanner}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full backdrop-blur-sm font-semibold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-lg p-6 border text-center ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-300'
              }`}
            >
              <svg
                className={`w-16 h-16 mx-auto mb-4 ${subTextClass}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <p className={`text-sm ${subTextClass}`}>
                La función de escaneo de cámara está optimizada para dispositivos móviles.
                <br />
                Ingresa el número serial manualmente.
              </p>
            </div>
          )}

          {/* Input manual / confirmación */}
          <div className="space-y-2">
            <label className={`block text-sm font-semibold ${textClass}`}>
              Número Serial {deviceBrand && `(${deviceBrand})`}
            </label>
            <input
              type="text"
              value={scannedData}
              onChange={(e) => setScannedData(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="Ej: ABC123456789 o escanea el código"
              autoComplete="off"
            />
            <p className={`text-xs ${subTextClass}`}>
              {scannedData
                ? '✓ Verifica que el número sea correcto antes de confirmar'
                : 'Escribe el serial manualmente o usa la cámara para escanearlo'}
            </p>
          </div>

          {/* Información del formato esperado */}
          {deviceBrand && (
            <div
              className={`rounded-lg p-3 text-xs ${
                isDarkMode
                  ? 'bg-gray-800 text-gray-400'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <p className="font-semibold mb-1">Formato esperado para {deviceBrand}:</p>
              {deviceBrand.toUpperCase() === 'DELL' && (
                <p>Service Tag de 7 caracteres alfanuméricos (Ej: 1A2B3C4)</p>
              )}
              {deviceBrand.toUpperCase() === 'HP' && (
                <p>Serial de 10 caracteres alfanuméricos (Ej: ABC1234DEF)</p>
              )}
              {deviceBrand.toUpperCase() === 'LENOVO' && (
                <p>Serial de 8-10 caracteres alfanuméricos (Ej: R12AB3CD)</p>
              )}
              {deviceBrand.toUpperCase() === 'APPLE' && (
                <p>Serial de 12 caracteres alfanuméricos (Ej: C02ABC123DEF)</p>
              )}
              {!['DELL', 'HP', 'LENOVO', 'APPLE'].includes(deviceBrand.toUpperCase()) && (
                <p>Entre 5 y 20 caracteres alfanuméricos</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } flex justify-end gap-3`}
        >
          <button onClick={handleClose} className={buttonClass}>
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!scannedData.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-semibold"
          >
            Confirmar Serial
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScannerModal;