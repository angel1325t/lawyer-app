// screens/LawyerDocumentsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import {
  documentService,
  LawyerDocument,
} from '../../services/documentService';
import DocumentViewer from '../../components/documents/DocumentViewer';

// Componente de Input Modal
function InputModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  placeholder = '',
}: {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState('');

  const handleConfirm = () => {
    onConfirm(value.trim());
    setValue('');
  };

  const handleCancel = () => {
    onCancel();
    setValue('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="items-center justify-center flex-1 px-6 bg-black/50">
        <View className="w-full max-w-md p-6 bg-white rounded-2xl">
          <Text className="mb-2 text-xl font-bold text-gray-900">{title}</Text>
          {message ? (
            <Text className="mb-4 text-gray-600">{message}</Text>
          ) : null}
          
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            className="px-4 py-3 mb-6 border border-gray-300 rounded-lg"
            autoFocus
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 py-3 bg-gray-200 rounded-lg"
            >
              <Text className="font-semibold text-center text-gray-700">
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              className="flex-1 py-3 bg-blue-600 rounded-lg"
            >
              <Text className="font-semibold text-center text-white">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function LawyerDocumentsScreen() {
  const [documents, setDocuments] = useState<LawyerDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<LawyerDocument | null>(null);

  // Estados para el modal de input
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [inputModalConfig, setInputModalConfig] = useState<{
    title: string;
    message?: string;
    placeholder?: string;
    onConfirm: (value: string) => void;
  }>({
    title: '',
    onConfirm: () => {},
  });

  // Archivo temporal mientras se pide tipo y descripción
  const [pendingFile, setPendingFile] = useState<any>(null);
  const [pendingType, setPendingType] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentService.getMyDocuments();
      if (res.success && res.documents) {
        setDocuments(res.documents);
      } else {
        Alert.alert('Error', res.error || 'No se pudieron cargar los documentos');
      }
    } catch (err) {
      console.error('Error cargando documentos:', err);
      Alert.alert('Error', 'Ocurrió un problema al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const showInputModal = (
    title: string,
    message: string,
    placeholder: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      setInputModalConfig({
        title,
        message,
        placeholder,
        onConfirm: (value) => {
          setInputModalVisible(false);
          resolve(value);
        },
      });
      setInputModalVisible(true);
    });
  };

  const handlePickAndUpload = async () => {
    try {
      console.log('Opening document picker...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('Document selection cancelled');
        return;
      }

      const file = result.assets[0];
      
      console.log('File selected:', {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      });

      setPendingFile(file);

      // Pedir tipo de documento
      console.log('Requesting document type...');
      const typeRaw = await showInputModal(
        'Tipo de documento',
        'Ejemplo: Cédula, Título, Certificado, Contrato, Otro',
        'Ej: Cédula'
      );

      console.log('Type received:', typeRaw);

      if (!typeRaw) {
        console.log('Document type cancelled');
        setPendingFile(null);
        return;
      }

      const type = typeRaw || 'Otro';
      setPendingType(type);

      // Pedir descripción (opcional)
      console.log('Requesting description...');
      const description = await showInputModal(
        'Descripción (opcional)',
        'Añade detalles sobre el documento',
         'Ej: Cédula frontal'
      );

      console.log('Description received:', description);
      console.log('Starting upload with:', { type, description });

      setUploading(true);

      const uploadRes = await documentService.uploadDocument(file, type, description);

      console.log('Upload completed:', uploadRes);

      if (uploadRes.success) {
        Alert.alert('Éxito', 'Documento subido correctamente');
        await loadDocuments();
      } else {
        Alert.alert('Error', uploadRes.error || 'No se pudo subir el documento');
      }
    } catch (err) {
      console.error('Error completo en handlePickAndUpload:', err);
      Alert.alert('Error', 'No se pudo completar la subida del documento');
    } finally {
      setUploading(false);
      setPendingFile(null);
      setPendingType('');
    }
  };

  const handleDelete = (doc: LawyerDocument) => {
    Alert.alert(
      'Eliminar documento',
      `¿Seguro que deseas eliminar "${doc.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await documentService.deleteDocument(doc.id);
              if (res.success) {
                setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
                Alert.alert('Eliminado', 'Documento eliminado correctamente');
              } else {
                Alert.alert('Error', res.error || 'No se pudo eliminar');
              }
            } catch (err) {
              console.error('Error eliminando:', err);
              Alert.alert('Error', 'Ocurrió un problema al eliminar');
            }
          },
        },
      ]
    );
  };

  const handlePreview = (doc: LawyerDocument) => {
    setSelectedDoc(doc);
    setViewerVisible(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const DocumentItem = ({ doc }: { doc: LawyerDocument }) => (
    <View className="p-4 mb-3 bg-white border border-gray-200 shadow-sm rounded-xl">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="font-semibold text-gray-900" numberOfLines={2}>
            {doc.name}
          </Text>
          <Text className="mt-1 text-sm text-gray-600">
            Tipo: {doc.type} • {doc.file_category.toUpperCase()}
          </Text>

          {doc.description ? (
            <Text className="mt-1 text-sm text-gray-500" numberOfLines={2}>
              ↳ {doc.description}
            </Text>
          ) : null}

          <View className="flex-row items-center mt-2">
            <Text className="text-xs text-gray-400">
              {new Date(doc.upload_date).toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            {doc.size > 0 && (
              <>
                <Text className="mx-2 text-xs text-gray-400">•</Text>
                <Text className="text-xs text-gray-400">
                  {formatFileSize(doc.size)}
                </Text>
              </>
            )}
          </View>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => handlePreview(doc)}
            className="p-2"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="eye-outline" size={24} color="#2563eb" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDelete(doc)}
            className="p-2 ml-1"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-5 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">Mis Documentos</Text>
        <Text className="mt-1 text-gray-600">
          Documentos de verificación profesional
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-5">
          <TouchableOpacity
            onPress={handlePickAndUpload}
            disabled={uploading}
            className={`flex-row items-center justify-center p-6 mb-6 border-2 border-dashed rounded-xl ${
              uploading
                ? 'bg-gray-50 border-gray-300'
                : 'bg-blue-50 border-blue-300'
            }`}
          >
            {uploading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#2563eb" size="large" />
                <Text className="ml-4 text-blue-700">Subiendo...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={32} color="#2563eb" />
                <Text className="ml-4 text-lg font-medium text-blue-700">
                  Subir nuevo documento
                </Text>
              </>
            )}
          </TouchableOpacity>

          {loading ? (
            <View className="items-center justify-center flex-1 py-20">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-4 text-gray-600">Cargando documentos...</Text>
            </View>
          ) : documents.length === 0 ? (
            <View className="items-center py-20">
              <Ionicons name="folder-open-outline" size={80} color="#9ca3af" />
              <Text className="mt-6 text-lg font-medium text-gray-600">
                No tienes documentos subidos aún
              </Text>
              <Text className="px-8 mt-2 text-center text-gray-500">
                Toca el botón superior para comenzar a subir tus documentos de verificación
              </Text>
            </View>
          ) : (
            <>
              <Text className="mb-3 text-sm text-gray-600">
                {documents.length} documento{documents.length !== 1 ? 's' : ''}
              </Text>
              {documents.map((doc) => (
                <DocumentItem key={doc.id} doc={doc} />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de Input */}
      <InputModal
        visible={inputModalVisible}
        title={inputModalConfig.title}
        message={inputModalConfig.message}
        placeholder={inputModalConfig.placeholder}
        onConfirm={inputModalConfig.onConfirm}
        onCancel={() => {
          setInputModalVisible(false);
          setPendingFile(null);
        }}
      />

      {selectedDoc && (
        <DocumentViewer
          documentId={selectedDoc.id}
          documentName={selectedDoc.name}
          visible={viewerVisible}
          onClose={() => {
            setViewerVisible(false);
            setSelectedDoc(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}