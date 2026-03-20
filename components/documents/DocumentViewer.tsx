import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { X, FileText, File } from 'lucide-react-native';
import {
  documentService,
  DocumentPreview,
} from '../../services/documentService';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface DocumentViewerProps {
  documentId: number;
  documentName: string;
  visible: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentName,
  visible,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      loadPreview();
    }
  }, [visible, documentId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await documentService.getDocumentPreview(documentId);

      if (res.success && res.document) {
        setPreview(res.document);
      } else {
        setError(res.error || 'No se pudo cargar la vista previa');
      }
    } catch (err) {
      console.error('Error cargando preview:', err);
      setError('Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!preview) return;

    try {
      setDownloading(true);

      // Usamos cacheDirectory preferentemente (archivos temporales)
      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

      if (!baseDir) {
        throw new Error('No hay directorio disponible');
      }

      // Nombre seguro: reemplazamos caracteres problemáticos
      const safeFileName = documentName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileUri = `${baseDir}${safeFileName}`;

      await FileSystem.writeAsStringAsync(fileUri, preview.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const sharingAvailable = await Sharing.isAvailableAsync();

      if (sharingAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: preview.mimetype,
          dialogTitle: 'Guardar documento',
        });
      } else {
        Alert.alert(
          'Guardado',
          'El archivo fue guardado en el dispositivo.\n\nPuedes encontrarlo en la carpeta de descargas o cache.'
        );
      }
    } catch (err) {
      console.error('Error al descargar/guardar:', err);
      Alert.alert('Error', 'No se pudo descargar o guardar el documento');
    } finally {
      setDownloading(false);
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-600">Cargando vista previa...</Text>
        </View>
      );
    }

    if (error || !preview) {
      return (
        <View className="items-center justify-center flex-1 p-6">
          <File size={64} color="#9ca3af" />
          <Text className="mt-4 text-center text-gray-600">{error || 'No se pudo cargar el documento'}</Text>
        </View>
      );
    }

    if (preview.file_category === 'image') {
      return (
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', padding: 20 }}
          maximumZoomScale={4}
          minimumZoomScale={0.5}
        >
          <Image
            source={{ uri: `data:${preview.mimetype};base64,${preview.data}` }}
            style={{ width: width - 40, height: height * 0.7 }}
            resizeMode="contain"
          />
        </ScrollView>
      );
    }

    return (
      <View className="items-center justify-center flex-1 p-6">
        <FileText size={80} color="#2563eb" />
        <Text className="mt-6 text-xl font-semibold text-center text-gray-900">
          {documentName}
        </Text>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading}
          className={`mt-8 px-10 py-4 rounded-xl ${downloading ? 'bg-gray-400' : 'bg-blue-600'}`}
        >
          <Text className="text-lg font-semibold text-white">
            {downloading ? 'Descargando...' : 'Descargar documento'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
          <Text
            className="flex-1 pr-4 text-xl font-semibold text-gray-900"
            numberOfLines={1}
          >
            {documentName}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            className="p-3 bg-gray-100 rounded-full"
          >
            <X size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View className="flex-1">{renderPreview()}</View>
      </View>
    </Modal>
  );
};

export default DocumentViewer;