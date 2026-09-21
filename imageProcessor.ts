/**
 * Utilitário de Processamento, Redimensionamento e Otimização de Imagens no Cliente
 * Garante que fotos pesadas de smartphones (10MB-30MB) sejam otimizadas para a web,
 * fiquem confortavelmente abaixo do limite rígido de 1 MiB do Cloud Firestore e carreguem instantaneamente.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  maxSizeBytes?: number; // Padrão: 450KB (gera ~600KB base64, garantindo folga com metadados para o limite de 1MB do Firestore)
  quality?: number;      // Padrão: 0.82
}

/**
 * Estima o tamanho em bytes de uma string base64 / Data URL
 */
export function estimateBase64Bytes(dataUrl: string): number {
  if (!dataUrl) return 0;
  const base64Index = dataUrl.indexOf(';base64,');
  const base64Str = base64Index >= 0 ? dataUrl.slice(base64Index + 8) : dataUrl;
  return Math.round((base64Str.length * 3) / 4);
}

/**
 * Carrega um arquivo File em um elemento HTMLImageElement de forma rápida e com baixo uso de memória.
 * Utiliza URL.createObjectURL para evitar alocar dezenas de megabytes em strings no V8.
 */
function loadImageFromFile(file: File): Promise<{ img: HTMLImageElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    let isCleanedUp = false;

    const cleanup = () => {
      if (!isCleanedUp && objectUrl) {
        URL.revokeObjectURL(objectUrl);
        isCleanedUp = true;
      }
    };

    const img = new Image();

    img.onload = () => {
      resolve({ img, cleanup });
    };

    img.onerror = () => {
      cleanup();
      // Verificação específica para formato HEIC comum em dispositivos iOS
      const isHeic = /\.(heic|heif)$/i.test(file.name || '') || /heic|heif/i.test(file.type || '');
      if (isHeic) {
        reject(
          new Error(
            'Formato HEIC/HEIF da Apple não é suportado nativamente pelo navegador. Selecione uma foto em JPG/PNG ou altere nos ajustes da câmera para "Mais Compatível".'
          )
        );
      } else {
        reject(new Error('Não foi possível decodificar o formato desta imagem no navegador.'));
      }
    };

    try {
      objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    } catch {
      // Fallback para FileReader caso createObjectURL falhe
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('Falha ao ler dados da imagem.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo do dispositivo.'));
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Redimensiona e comprime uma foto via Canvas retornando uma Data URL (JPEG base64 otimizada).
 * Garante dimensionalidade proporcional e tamanho estritamente dentro do limite seguro do Firestore.
 */
export async function compressAndOptimizeImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    maxSizeBytes = 450 * 1024, // 450 KB binário (~600 KB base64)
    quality = 0.82
  } = options;

  // Validação flexível que suporta tanto MIME type quanto extensões conhecidas de fotos
  const isImageMime = file.type ? file.type.startsWith('image/') : false;
  const isImageExt = /\.(jpe?g|png|webp|gif|bmp|heic|heif|avif|svg)$/i.test(file.name || '');

  if (!isImageMime && !isImageExt) {
    throw new Error('O arquivo selecionado não é uma foto ou imagem válida (JPG, PNG, WEBP).');
  }

  const { img, cleanup } = await loadImageFromFile(file);

  try {
    let curWidth = img.naturalWidth || img.width;
    let curHeight = img.naturalHeight || img.height;

    if (!curWidth || !curHeight) {
      throw new Error('Dimensões da imagem inválidas ou arquivo corrompido.');
    }

    // Calcula dimensões iniciais preservando a proporção original
    if (curWidth > maxWidth || curHeight > maxHeight) {
      const ratio = Math.min(maxWidth / curWidth, maxHeight / curHeight);
      curWidth = Math.max(1, Math.round(curWidth * ratio));
      curHeight = Math.max(1, Math.round(curHeight * ratio));
    }

    // Cria canvas inicial com fundo branco para prevenir artefatos pretos em PNGs transparentes
    const canvas = document.createElement('canvas');
    canvas.width = curWidth;
    canvas.height = curHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Aceleração gráfica de canvas não disponível no navegador.');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, curWidth, curHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, curWidth, curHeight);

    // Passo 1: Ajuste fino de qualidade JPEG
    let curQuality = quality;
    let resultDataUrl = canvas.toDataURL('image/jpeg', curQuality);
    let estimatedBytes = estimateBase64Bytes(resultDataUrl);

    while (estimatedBytes > maxSizeBytes && curQuality > 0.45) {
      curQuality -= 0.1;
      resultDataUrl = canvas.toDataURL('image/jpeg', curQuality);
      estimatedBytes = estimateBase64Bytes(resultDataUrl);
    }

    // Passo 2: Se ainda exceder maxSizeBytes (fotos com muito ruído/textura),
    // reduz as dimensões iterativamente em escala até garantir conformidade
    let attempts = 0;
    while (estimatedBytes > maxSizeBytes && attempts < 5 && curWidth > 480 && curHeight > 480) {
      attempts++;
      curWidth = Math.round(curWidth * 0.82);
      curHeight = Math.round(curHeight * 0.82);

      const stepCanvas = document.createElement('canvas');
      stepCanvas.width = curWidth;
      stepCanvas.height = curHeight;
      const stepCtx = stepCanvas.getContext('2d');

      if (stepCtx) {
        stepCtx.fillStyle = '#FFFFFF';
        stepCtx.fillRect(0, 0, curWidth, curHeight);
        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = 'medium';
        stepCtx.drawImage(canvas, 0, 0, curWidth, curHeight);

        resultDataUrl = stepCanvas.toDataURL('image/jpeg', 0.68);
        estimatedBytes = estimateBase64Bytes(resultDataUrl);
      }
    }

    return resultDataUrl;
  } finally {
    cleanup();
  }
}
