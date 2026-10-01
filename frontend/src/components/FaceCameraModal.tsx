import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Camera as CameraIcon, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import Svg, { Ellipse, Rect, Defs, Mask } from 'react-native-svg';

interface FaceCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FaceCameraModal: React.FC<FaceCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
  title = 'Face Verification',
  subtitle = 'Position your face within the frame',
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (visible && !permission?.granted) {
      requestPermission();
    }
    if (!visible) {
      setIsProcessing(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
        skipProcessing: false,
      });

      if (!photo || !photo.base64) {
        throw new Error('Failed to capture high-quality biometric photo');
      }

      await onCapture(photo.base64);
      onClose();
    } catch (err: any) {
      console.error('Capture error:', err);
      const msg = err.response?.data?.message || err.message || 'Face recognition failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#090d16' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 50 : 20,
            paddingBottom: 16,
            backgroundColor: '#0f172a',
            borderBottomWidth: 1,
            borderBottomColor: '#334155',
            zIndex: 10,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '800' }}>{title}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12 }}>{subtitle}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            disabled={isProcessing}
            style={{
              padding: 8,
              backgroundColor: '#1e293b',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#334155',
            }}
          >
            <X size={20} color="#f8fafc" />
          </TouchableOpacity>
        </View>

        {/* Camera Permission State */}
        {!permission?.granted ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <AlertTriangle size={56} color="#f59e0b" style={{ marginBottom: 16 }} />
            <Text style={{ color: '#f8fafc', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
              Camera Permission Required
            </Text>
            <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 8, marginBottom: 24 }}>
              This application requires access to the camera to detect and register facial biometric descriptors securely.
            </Text>
            <TouchableOpacity
              onPress={requestPermission}
              style={{
                backgroundColor: '#6366f1',
                paddingVertical: 14,
                paddingHorizontal: 28,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ flex: 1, position: 'relative' }}>
            {/* Live Camera View */}
            <CameraView
              ref={cameraRef}
              facing={facing}
              style={{ flex: 1 }}
              onCameraReady={() => setCameraReady(true)}
            />

            {/* Face Alignment SVG Oval Overlay */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
              <Svg height="100%" width="100%">
                <Defs>
                  <Mask id="mask" x="0" y="0" height="100%" width="100%">
                    <Rect height="100%" width="100%" fill="#ffffff" />
                    <Ellipse
                      cx={SCREEN_WIDTH / 2}
                      cy={SCREEN_HEIGHT * 0.35}
                      rx={SCREEN_WIDTH * 0.35}
                      ry={SCREEN_HEIGHT * 0.22}
                      fill="#000000"
                    />
                  </Mask>
                </Defs>
                <Rect height="100%" width="100%" fill="rgba(9, 13, 22, 0.75)" mask="url(#mask)" />
                {/* Oval guide border */}
                <Ellipse
                  cx={SCREEN_WIDTH / 2}
                  cy={SCREEN_HEIGHT * 0.35}
                  rx={SCREEN_WIDTH * 0.35}
                  ry={SCREEN_HEIGHT * 0.22}
                  stroke={errorMessage ? '#ef4444' : '#6366f1'}
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="8 6"
                />
              </Svg>
            </View>

            {/* Error Message Toast */}
            {errorMessage && (
              <View
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  right: 20,
                  backgroundColor: 'rgba(239, 68, 68, 0.95)',
                  padding: 12,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <AlertTriangle size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', flex: 1 }}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Mandatory User Guidelines Box (Requirement 15) */}
            <View
              style={{
                position: 'absolute',
                top: SCREEN_HEIGHT * 0.58,
                left: 20,
                right: 20,
                backgroundColor: 'rgba(30, 41, 59, 0.92)',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#334155',
              }}
            >
              <Text style={{ color: '#818cf8', fontWeight: '700', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' }}>
                Instructions for Best Accuracy:
              </Text>
              <Text style={{ color: '#f8fafc', fontSize: 11, marginBottom: 2 }}>• Look directly at the camera.</Text>
              <Text style={{ color: '#f8fafc', fontSize: 11, marginBottom: 2 }}>• Keep your face inside the oval frame.</Text>
              <Text style={{ color: '#f8fafc', fontSize: 11, marginBottom: 2 }}>• Use sufficient lighting.</Text>
              <Text style={{ color: '#f8fafc', fontSize: 11, marginBottom: 2 }}>• Make sure only one person is visible.</Text>
              <Text style={{ color: '#f8fafc', fontSize: 11 }}>• Remove anything covering the face.</Text>
            </View>

            {/* Controls */}
            <View
              style={{
                position: 'absolute',
                bottom: 24,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                paddingHorizontal: 30,
              }}
            >
              <TouchableOpacity
                onPress={toggleFacing}
                disabled={isProcessing}
                style={{
                  padding: 14,
                  backgroundColor: 'rgba(30, 41, 59, 0.85)',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#475569',
                }}
              >
                <RefreshCw size={24} color="#f8fafc" />
              </TouchableOpacity>

              {/* Shutter Button */}
              <TouchableOpacity
                onPress={handleCapture}
                disabled={isProcessing}
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: '#6366f1',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 4,
                  borderColor: '#ffffff',
                  shadowColor: '#6366f1',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#ffffff" size="large" />
                ) : (
                  <CameraIcon size={32} color="#ffffff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                disabled={isProcessing}
                style={{
                  padding: 14,
                  backgroundColor: 'rgba(30, 41, 59, 0.85)',
                  borderRadius: 9999,
                  borderWidth: 1,
                  borderColor: '#475569',
                }}
              >
                <X size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
