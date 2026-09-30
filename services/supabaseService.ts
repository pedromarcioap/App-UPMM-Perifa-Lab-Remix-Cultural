import {
  getSupabase,
  isSupabaseConfigured,
  uploadImageToSupabase,
  persistArtworkToSupabase,
  fetchArtworksFromSupabase,
  persistCommentToSupabase,
  fetchArtworkAnalysisFromSupabase,
  checkSupabaseStatus
} from '../supabase';
import { PhotoBase, Comment, ArtworkAnalysis, SupabaseIntegrationStatus } from '../types';

/**
 * Serviço de Orquestração do Supabase (Armazenamento, Banco Relacional e Análise Visual)
 */
export class SupabaseService {
  /**
   * Pipeline de upload escalável:
   * 1. Se Supabase Storage estiver ativo, envia a imagem para o bucket 'artworks' e obtém a URL pública CDN.
   * 2. Persiste o registro na tabela relacional 'artworks'.
   * 3. Dispara a fila assíncrona de análise visual técnica por IA (Proporção, Perspectiva, Valores).
   */
  static async processArtworkSubmission(
    photo: PhotoBase,
    rawImageFileOrDataUrl: File | string,
    onAnalysisComplete?: (analysis: ArtworkAnalysis) => void
  ): Promise<{ photo: PhotoBase; uploadedToStorage: boolean }> {
    let finalPhoto: PhotoBase = { ...photo };
    let uploadedToStorage = false;

    // 1. Upload para Supabase Storage se configurado
    if (isSupabaseConfigured()) {
      try {
        const uploadResult = await uploadImageToSupabase(rawImageFileOrDataUrl, 'artworks');
        if (uploadResult.publicUrl) {
          finalPhoto.imageUrl = uploadResult.publicUrl;
          finalPhoto.storagePath = uploadResult.storagePath || undefined;
          uploadedToStorage = true;
        }
      } catch (err) {
        console.warn('[SupabaseService] Fallback para armazenamento otimizado inline:', err);
      }

      // 2. Persistência na tabela relacional 'artworks'
      try {
        await persistArtworkToSupabase(finalPhoto);
      } catch (dbErr) {
        console.warn('[SupabaseService] Erro ao sincronizar tabela relacional:', dbErr);
      }
    }

    // 3. Fila de Análise Visual Assíncrona de IA (Proporção, Perspectiva, Tons)
    this.triggerAsyncVisionAnalysis(finalPhoto)
      .then(analysis => {
        if (analysis && onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
      })
      .catch(err => {
        console.warn('[SupabaseService] Aviso na fila de análise técnica:', err);
      });

    return { photo: finalPhoto, uploadedToStorage };
  }

  /**
   * Dispara a análise visual da obra de arte sem travar a interface do usuário
   */
  static async triggerAsyncVisionAnalysis(photo: PhotoBase): Promise<ArtworkAnalysis | null> {
    try {
      const response = await fetch('/api/artworks/analyze-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artworkId: photo.id,
          imageUrl: photo.imageUrl,
          userId: photo.userId,
          medium: photo.tags?.join(', ') || 'estudo visual de desenho'
        })
      });

      if (!response.ok) {
        return null;
      }

      const analysis: ArtworkAnalysis = await response.json();
      return analysis;
    } catch (err) {
      console.warn('[SupabaseService] Falha ao comunicar com o analisador visual:', err);
      return null;
    }
  }

  /**
   * Sincronizar comentário ou redline com o Supabase
   */
  static async syncComment(comment: Comment): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    const res = await persistCommentToSupabase(comment);
    return res.success;
  }

  /**
   * Carregar obras do Supabase com fallback seguro
   */
  static async getArtworks(): Promise<PhotoBase[]> {
    if (!isSupabaseConfigured()) return [];
    return await fetchArtworksFromSupabase();
  }

  /**
   * Obter status detalhado de conectividade
   */
  static async getStatus(): Promise<SupabaseIntegrationStatus> {
    const status = await checkSupabaseStatus();
    return {
      configured: status.configured,
      url: status.url || undefined,
      authActive: status.authActive,
      storageActive: status.storageActive,
      databaseActive: status.databaseActive,
      sessionUserEmail: status.sessionUserEmail || undefined
    };
  }
}
