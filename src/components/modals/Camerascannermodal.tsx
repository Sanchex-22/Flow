import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Tesseract from 'tesseract.js';
import { useTheme } from '../../context/themeContext';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (serial: string) => void;
  deviceBrand?: string;
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
  const [isCheckingCamera, setIsCheckingCamera] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [scanMode, setScanMode] = useState<'barcode' | 'ocr'>('barcode');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const readerIdRef = useRef(`qr-reader-${Date.now()}`);

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
    const prefixes = ['S/N:', 'SN:', 'SERIAL:', 'Serial Number:', 'S/N ', 'Serial:', 'P/N:'];
    for (const prefix of prefixes) {
      if (cleaned.toUpperCase().startsWith(prefix.toUpperCase())) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }

    // Eliminar espacios y caracteres no alfanuméricos
    cleaned = cleaned.replace(/[^A-Z0-9]/gi, '');

    // Correcciones comunes de OCR
    if (/\d/.test(cleaned)) {
      // Corregir O por 0
      cleaned = cleaned.replace(/O(?=\d)/gi, '0');
      cleaned = cleaned.replace(/(?<=\d)O/gi, '0');
      // Corregir I por 1
      cleaned = cleaned.replace(/I(?=\d)/gi, '1');
      cleaned = cleaned.replace(/(?<=\d)I/gi, '1');
      // Corregir Z por 2
      cleaned = cleaned.replace(/Z(?=\d)/gi, '2');
      // Corregir S por 5
      cleaned = cleaned.replace(/S(?=\d)/gi, '5');
      // Corregir B por 8
      cleaned = cleaned.replace(/B(?=\d)/gi, '8');
    }

    return cleaned;
  };

  // Validar formato según marca
  const validateSerialFormat = (serial: string, brand: string): boolean => {
    if (!serial || serial.length < 5) return false;

    const brandUpper = brand.toUpperCase();
    const validations: Record<string, RegExp> = {
      DELL: /^[A-Z0-9]{7}$/,
      HP: /^[A-Z0-9]{10}$/,
      LENOVO: /^[A-Z0-9]{8,10}$/,
      APPLE: /^[A-Z0-9]{12}$/,
      CISCO: /^[A-Z]{3}\d{8}[A-Z0-9]{2}$/,
    };

    if (validations[brandUpper]) {
      return validations[brandUpper].test(serial);
    }

    return /^[A-Z0-9]{5,20}$/i.test(serial);
  };

  // Verificar permisos de cámara
  const checkCameraPermissions = async (): Promise<boolean> => {
    setIsCheckingCamera(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        setError('No se encontró ninguna cámara en este dispositivo.');
        setIsCameraAvailable(false);
        setIsCheckingCamera(false);
        return false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        stream.getTracks().forEach(track => track.stop());
        
        setIsCameraAvailable(true);
        setError('');
        setIsCheckingCamera(false);
        return true;
      } catch (permissionError: any) {
        if (permissionError.name === 'NotAllowedError') {
          setError('⚠️ Permisos de cámara denegados. Por favor, permite el acceso a la cámara en la configuración de tu navegador.');
        } else if (permissionError.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara disponible.');
        } else if (permissionError.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra aplicación. Por favor, cierra otras apps que usen la cámara.');
        } else {
          setError(`Error al acceder a la cámara: ${permissionError.message}`);
        }
        
        setIsCameraAvailable(false);
        setIsCheckingCamera(false);
        return false;
      }
    } catch (error: any) {
      setError('Error al verificar dispositivos de cámara.');
      setIsCameraAvailable(false);
      setIsCheckingCamera(false);
      return false;
    }
  };

  // Capturar imagen del video para OCR
  const captureImageForOCR = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/png');
  };

  // Procesar OCR
  const processOCR = async () => {
    setIsProcessingOCR(true);
    setError('');

    try {
      const imageData = captureImageForOCR();
      if (!imageData) {
        setError('No se pudo capturar la imagen');
        setIsProcessingOCR(false);
        return;
      }

      const result = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              // Opcional: mostrar progreso
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      const rawText = result.data.text;
      const cleaned = cleanSerialNumber(rawText);

      if (cleaned.length >= 5) {
        setScannedData(cleaned);
        stopScanner();
      } else {
        setError('No se pudo leer el texto. Intenta de nuevo con mejor iluminación o ingresa manualmente.');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError('Error al procesar la imagen. Intenta de nuevo o ingresa el serial manualmente.');
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Iniciar escáner de código de barras
  const startBarcodeScanner = async () => {
    try {
      setError('');
      setIsScanning(true);

      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        setIsScanning(false);
        return;
      }

      const scanner = new Html5Qrcode(readerIdRef.current);
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          const cleaned = cleanSerialNumber(decodedText);
          setScannedData(cleaned);
          stopScanner();
        },
        (errorMessage) => {
            // Opcional: manejar errores de escaneo
            console.warn('Scan error:', errorMessage);
        }
      );
    } catch (err: any) {
      console.error('Error starting barcode scanner:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('⚠️ Permisos de cámara denegados. Ve a la configuración de tu navegador y permite el acceso a la cámara.');
      } else {
        setError('No se pudo iniciar el escáner de códigos de barras. Intenta el modo OCR.');
      }
      
      setIsCameraAvailable(false);
      setIsScanning(false);
    }
  };

  // Iniciar modo OCR
  const startOCRMode = async () => {
    try {
      setError('');
      setIsScanning(true);

      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Error starting OCR mode:', err);
      setError('No se pudo iniciar la cámara para OCR.');
      setIsScanning(false);
    }
  };

  // Detener escáner
  const stopScanner = async () => {
    // Detener html5-qrcode
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }

    // Detener stream de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsScanning(false);
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
    }

    onScanSuccess(scannedData);
    handleClose();
  };

  // Cerrar modal
  const handleClose = () => {
    stopScanner();
    setScannedData('');
    setError('');
    setScanMode('barcode');
    onClose();
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  // Reset estado cuando el modal se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setScannedData('');
      setError('');
      setIsCameraAvailable(true);
      setScanMode('barcode');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        className={`${modalBg} rounded-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transition-colors`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 sticky top-0 z-10 bg-inherit">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h2 className={`text-xl sm:text-2xl font-bold ${textClass} truncate`}>
                Escanear Número Serial
              </h2>
              <p className={`text-xs sm:text-sm mt-1 ${subTextClass}`}>
                {isMobileDevice
                  ? 'Enfoca el código de barras o la etiqueta del equipo'
                  : 'Esta función está optimizada para dispositivos móviles'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`${buttonClass} !p-2 flex-shrink-0`}
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Selector de modo */}
          {!isScanning && !scannedData && isMobileDevice && isCameraAvailable && (
            <div className="flex gap-2 p-1 bg-gray-700/30 rounded-lg">
              <button
                onClick={() => setScanMode('barcode')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  scanMode === 'barcode'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Código de Barras
              </button>
              <button
                onClick={() => setScanMode('ocr')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  scanMode === 'ocr'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔤 Leer Texto (OCR)
              </button>
            </div>
          )}

          {/* Instrucciones */}
          {!isScanning && !scannedData && (
            <div
              className={`rounded-lg p-3 sm:p-4 border text-sm ${
                isDarkMode
                  ? 'bg-blue-900/30 border-blue-700 text-blue-200'
                  : 'bg-blue-50 border-blue-300 text-blue-800'
              }`}
            >
              <div className="flex gap-2 sm:gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 text-xs sm:text-sm">
                  <p className="font-semibold mb-2">
                    💡 {scanMode === 'barcode' ? 'Modo Código de Barras:' : 'Modo Lectura de Texto (OCR):'}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {scanMode === 'barcode' ? (
                      <>
                        <li>Busca el código de barras en la etiqueta</li>
                        <li>Enfócalo dentro del recuadro</li>
                        <li>Se detectará automáticamente</li>
                      </>
                    ) : (
                      <>
                        <li>Enfoca el texto del número serial</li>
                        <li>Asegúrate de tener buena iluminación</li>
                        <li>Click en "Capturar" cuando esté enfocado</li>
                        <li>Podrás corregir el texto detectado</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className={`rounded-lg p-3 sm:p-4 border text-sm ${
                isDarkMode
                  ? 'bg-red-900/30 border-red-700 text-red-200'
                  : 'bg-red-50 border-red-300 text-red-800'
              }`}
            >
              <div className="flex gap-2 sm:gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-xs sm:text-sm flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Scanner Area */}
          {isMobileDevice && isCameraAvailable ? (
            <div className="space-y-4">
              {/* Botón para iniciar */}
              {!isScanning && !scannedData && (
                <button
                  onClick={scanMode === 'barcode' ? startBarcodeScanner : startOCRMode}
                  disabled={isCheckingCamera}
                  className="w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isCheckingCamera ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verificando permisos...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {scanMode === 'barcode' ? 'Abrir Escáner de Barras' : 'Abrir Cámara OCR'}
                    </>
                  )}
                </button>
              )}

              {/* Visor para código de barras */}
              {isScanning && scanMode === 'barcode' && (
                <div className="relative">
                  <div
                    id={readerIdRef.current}
                    className="rounded-lg overflow-hidden w-full"
                    style={{ minHeight: '250px' }}
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <button
                      onClick={stopScanner}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-full backdrop-blur-sm font-semibold text-sm sm:text-base shadow-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Visor para OCR */}
              {isScanning && scanMode === 'ocr' && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                    <button
                      onClick={stopScanner}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full backdrop-blur-sm font-semibold text-sm sm:text-base shadow-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={processOCR}
                      disabled={isProcessingOCR}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-full backdrop-blur-sm font-semibold text-sm sm:text-base shadow-lg flex items-center gap-2"
                    >
                      {isProcessingOCR ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          </svg>
                          Capturar y Leer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`rounded-lg p-4 sm:p-6 border text-center ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
              }`}
            >
              <svg className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${subTextClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className={`text-xs sm:text-sm ${subTextClass}`}>
                {!isMobileDevice
                  ? 'La función de escaneo está optimizada para dispositivos móviles.'
                  : 'No se pudo acceder a la cámara. Verifica los permisos.'}
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
                isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
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
          className={`p-4 sm:p-6 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          } flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 bg-inherit`}
        >
          <button 
            onClick={handleClose} 
            className={`${buttonClass} w-full sm:w-auto order-2 sm:order-1`}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!scannedData.trim()}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold order-1 sm:order-2"
          >
            Confirmar Serial
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraScannerModal;