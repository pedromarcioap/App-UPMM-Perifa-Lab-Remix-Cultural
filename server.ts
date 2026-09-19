import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Fallback cultural spots in Palmas TO when API quota is exhausted or offline
  const FALLBACK_PALMAS_SPOTS = [
    {
      web: {
        title: "Espaço Cultural José Gomes Sobrinho",
        uri: "https://maps.google.com/?q=Espaço+Cultural+José+Gomes+Sobrinho+Palmas+TO"
      }
    },
    {
      web: {
        title: "Pista de Skate Taquaralto (Região Sul)",
        uri: "https://maps.google.com/?q=Pista+de+Skate+Taquaralto+Palmas+TO"
      }
    },
    {
      web: {
        title: "Parque Cesamar & Galeria Aberta",
        uri: "https://maps.google.com/?q=Parque+Cesamar+Palmas+TO"
      }
    },
    {
      web: {
        title: "Murais de Grafite e Pista - Parque dos Povos Indígenas",
        uri: "https://maps.google.com/?q=Parque+dos+Povos+Indigenas+Palmas+TO"
      }
    },
    {
      web: {
        title: "Polo Cultural e Feira do Aureny III",
        uri: "https://maps.google.com/?q=Feira+do+Jardim+Aureny+III+Palmas+TO"
      }
    }
  ];

  let geminiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!geminiClient && process.env.GEMINI_API_KEY) {
      geminiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return geminiClient;
  }

  // Maps Grounding Endpoint using gemini-2.5-flash with googleMaps tool
  app.post("/api/maps-grounding", async (req, res) => {
    try {
      const { query, latitude, longitude } = req.body;
      const lat = typeof latitude === 'number' ? latitude : -10.2450;
      const lng = typeof longitude === 'number' ? longitude : -48.3250;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          text: `📍 **Radar de Cultura Urbana e Periférica de Palmas (Guia Local PMW)**\n\n- **Espaço Cultural José Gomes Sobrinho**: Principal polo de exposições artísticas, artes visuais e encontros urbanos de Palmas.\n- **Pista de Skate de Taquaralto**: Ponto central da cultura hip-hop, batalhas de rima e arte urbana na Região Sul.\n- **Parque dos Povos Indígenas**: Polo de murais de arte de rua ao ar livre e circulação jovem.\n- **Jardim Aureny III & Feiras de Quebrada**: Centros vitais de manifestações artísticas e gastronomia popular tocantinense.\n\n*Nota: Configure a chave GEMINI_API_KEY para consultas dinâmicas em tempo real.*`,
          groundingChunks: FALLBACK_PALMAS_SPOTS,
          isFallback: true
        });
      }

      const prompt = `Você é o Radar da Cultura Urbana e Periférica de Palmas (Tocantins). Forneça informações reais, precisas e atualizadas de locais sobre arte de rua, murais de grafite, praças, pistas de skate, feiras populares e centros culturais em Palmas (como Taquaralto, Aureny III, Morada do Sol, Taquari, Espaço Cultural e Praça dos Girassóis) usando o Google Maps. Consulta: ${query || "Pontos de arte urbana, skate e cultura em Palmas"}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

      return res.json({
        text: response.text || "Nenhuma recomendação retornada.",
        groundingChunks: groundingChunks.length > 0 ? groundingChunks : FALLBACK_PALMAS_SPOTS
      });
    } catch (error: any) {
      console.warn("Maps grounding warning / fallback:", error?.message);
      // Return helpful fallback response if rate limited or unavailable
      return res.json({
        text: `📍 **Radar de Cultura Urbana de Palmas (Guia PMW Selecionado)**\n\n- **Espaço Cultural José Gomes Sobrinho**: Murais, galerias e epicentro das artes visuais e dança de Palmas.\n- **Taquaralto & Aureny III**: Berço da cultura de rua periférica tocantinense, pistas de skate e grafite autêntico.\n- **Parque Cesamar & Bosque dos Pioneiros**: Galerias a céu aberto e intervenções artísticas integradas à natureza.\n- **Parque dos Povos Indígenas**: Murais de grande escala e espaços para criação visual.\n\n*(Consulta realizada com base nos pontos de referência cadastrados de Palmas - TO)*`,
        groundingChunks: FALLBACK_PALMAS_SPOTS,
        isFallback: true
      });
    }
  });

  // Pexels Search API Proxy (BFF) - Keeps PEXELS_API_KEY securely on the server
  app.get("/api/pexels/search", async (req, res) => {
    try {
      const query = (req.query.query as string || '').trim();
      const perPage = Math.min(Math.max(parseInt(req.query.per_page as string, 10) || 12, 1), 30);

      if (!query) {
        return res.status(400).json({ error: "O parâmetro query é obrigatório", photos: [] });
      }

      const apiKey = process.env.PEXELS_API_KEY;
      if (!apiKey) {
        console.warn("PEXELS_API_KEY não configurada no ambiente do servidor.");
        return res.status(200).json({
          photos: [],
          total_results: 0,
          warning: "Chave da API Pexels não configurada no servidor (.env)."
        });
      }

      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`,
        {
          headers: {
            Authorization: apiKey
          }
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Pexels API error HTTP ${response.status}:`, errorBody);
        return res.status(response.status).json({
          error: `Erro ao consultar Pexels (${response.status})`,
          photos: []
        });
      }

      const data = await response.json();
      return res.json(data);
    } catch (error: any) {
      console.error("Erro no proxy Pexels:", error);
      return res.status(500).json({
        error: error?.message || "Erro interno ao consultar Pexels",
        photos: []
      });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
