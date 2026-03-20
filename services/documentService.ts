// services/documentService.ts
import api from './api';
import { Platform } from 'react-native';

/* =========================
   TIPOS
========================= */

export interface LawyerDocument {
  id: number;
  name: string;
  type: string; // document_type
  description: string;
  size: number;
  upload_date: string;
  mimetype: string;
  file_category: 'pdf' | 'word' | 'image' | 'other';
  download_url: string;
}

export interface DocumentPreview {
  data: string; // base64
  mimetype: string;
  name: string;
  file_category: 'pdf' | 'word' | 'image' | 'other';
}

/* =========================
   SERVICE
========================= */

export const documentService = {
  // Listar documentos del abogado
  getMyDocuments: async (): Promise<{
    success: boolean;
    documents?: LawyerDocument[];
    error?: string;
  }> => {
    try {
      const res = await api.get('/api/lawyer/documents');
      return res.data;
    } catch (err: any) {
      console.error('Error getting documents:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Error al obtener documentos',
      };
    }
  },

  // Subir documento
  uploadDocument: async (
    file: any,
    document_type: string,
    description: string = ''
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Starting upload with file:', {
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
      });

      const formData = new FormData();

      // Formato correcto para React Native
      formData.append('file', {
        uri: file.uri,
        name: file.name || `document_${Date.now()}.pdf`,
        type: file.mimeType || 'application/pdf',
      } as any);

      formData.append('document_type', document_type);
      if (description) {
        formData.append('description', description);
      }

      console.log('FormData prepared, sending request...');

      const res = await api.post('/api/lawyer/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 segundos para uploads
      });

      console.log('Upload response:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      return {
        success: false,
        error: err.response?.data?.error || err.message || 'Error al subir documento',
      };
    }
  },

  // Eliminar documento
  deleteDocument: async (
    id: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.delete(`/api/lawyer/documents/${id}`);
      return res.data;
    } catch (err: any) {
      console.error('Delete error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Error al eliminar',
      };
    }
  },

  // Vista previa (base64)
  getDocumentPreview: async (
    id: number
  ): Promise<{
    success: boolean;
    document?: DocumentPreview;
    error?: string;
  }> => {
    try {
      const res = await api.get(`/api/documents/${id}/preview`);
      return res.data;
    } catch (err: any) {
      console.error('Preview error:', err);
      return {
        success: false,
        error:
          err.response?.data?.error ||
          'No se pudo obtener vista previa',
      };
    }
  },

  // Descargar documento (web / mobile)
  downloadDocument: async (
    id: number,
    filename: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.get(`/api/documents/${id}/download`, {
        responseType: 'blob',
      });

      if (Platform.OS === 'web') {
        const url = window.URL.createObjectURL(res.data);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      return { success: true };
    } catch (err) {
      console.error('Download error:', err);
      return { success: false, error: 'Error al descargar' };
    }
  },
};