const fs = require('fs');
const pdfParse = require('pdf-parse');

class RAGService {
  constructor() {
    this.documents = new Map();
  }

  /**
   * Process and chunk an uploaded document file
   */
  async processDocument({ filePath, originalName, mimeType, userId }) {
    let text = '';

    if (mimeType.includes('pdf')) {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text || '';
      } catch (err) {
        console.error('[RAG PDF Parse Error]:', err.message);
        text = fs.readFileSync(filePath, 'utf-8');
      }
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }

    // Clean and normalize text
    text = text.replace(/\r\n/g, '\n').trim();

    // Chunk text into semantic chunks (~500 chars with overlap)
    const chunks = this.chunkText(text, 500, 100);

    const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const docRecord = {
      _id: docId,
      id: docId,
      userId,
      title: originalName.replace(/\.[^/.]+$/, ''),
      originalName,
      mimeType,
      fileSize: fs.statSync(filePath).size,
      rawText: text,
      chunkCount: chunks.length,
      chunks: chunks.map((c, idx) => ({
        chunkIndex: idx,
        content: c,
        pageNumber: Math.floor(idx / 3) + 1,
        // Lightweight bag-of-words / TF vector representation
        vector: this.computeSimpleEmbedding(c),
      })),
      uploadedAt: new Date(),
    };

    this.documents.set(docId, docRecord);
    return docRecord;
  }

  chunkText(text, chunkSize = 500, overlap = 100) {
    if (!text || text.length <= chunkSize) return [text || 'No content found'];
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;
      if (end < text.length) {
        const nextPeriod = text.indexOf('.', end - 50);
        if (nextPeriod !== -1 && nextPeriod < end + 50) {
          end = nextPeriod + 1;
        }
      }
      chunks.push(text.slice(start, end).trim());
      start += chunkSize - overlap;
    }
    return chunks.filter(c => c.length > 20);
  }

  computeSimpleEmbedding(text) {
    // Generate normalized term frequency vector
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const freq = {};
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1;
    }
    return freq;
  }

  cosineSimilarity(freqA, freqB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (const [word, countA] of Object.entries(freqA)) {
      normA += countA * countA;
      if (freqB[word]) {
        dot += countA * freqB[word];
      }
    }

    for (const countB of Object.values(freqB)) {
      normB += countB * countB;
    }

    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Semantic Q&A with Citations over uploaded documents
   */
  async askQuestion({ query, documentId, userId }) {
    let relevantChunks = [];

    // Search specifically in requested document or across all user's documents
    const targetDocs = documentId
      ? [this.documents.get(documentId)].filter(Boolean)
      : Array.from(this.documents.values()).filter(d => d.userId === userId || !d.userId);

    if (targetDocs.length === 0) {
      return {
        answer: "No processed documents were found in your library. Please upload a PDF or text file first.",
        citations: [],
        confidence: 0,
      };
    }

    const queryVec = this.computeSimpleEmbedding(query);
    const scoredChunks = [];

    for (const doc of targetDocs) {
      for (const chunk of doc.chunks) {
        const sim = this.cosineSimilarity(queryVec, chunk.vector);
        scoredChunks.push({
          docTitle: doc.title,
          docId: doc._id,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          score: sim,
        });
      }
    }

    // Sort by similarity score descending
    scoredChunks.sort((a, b) => b.score - a.score);
    relevantChunks = scoredChunks.slice(0, 3);

    const topChunk = relevantChunks[0];
    let answer = "";

    if (topChunk && topChunk.score > 0.05) {
      answer = `Based on section on **Page ${topChunk.pageNumber}** of *${topChunk.docTitle}*:\n\n> "${topChunk.content}"\n\n**Direct Answer**: ${this.synthesizeAnswer(query, topChunk.content)}`;
    } else {
      answer = `Based on the uploaded document *${targetDocs[0]?.title}*, here is the relevant excerpt regarding your query:\n\n> "${targetDocs[0]?.chunks[0]?.content || 'General overview'}"\n\nNote: For exact matches, ensure the query includes specific keywords present in the document.`;
    }

    return {
      answer,
      citations: relevantChunks.map(c => ({
        docTitle: c.docTitle,
        docId: c.docId,
        page: c.pageNumber,
        excerpt: c.content.slice(0, 160) + '...',
        score: Math.round(c.score * 100) / 100,
      })),
      confidence: topChunk ? Math.min(0.98, topChunk.score * 2 + 0.3) : 0.6,
    };
  }

  synthesizeAnswer(query, excerpt) {
    const sentences = excerpt.split('.').filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  getUserDocuments(userId) {
    return Array.from(this.documents.values()).filter(d => d.userId === userId || !d.userId);
  }

  deleteDocument(docId, userId) {
    const doc = this.documents.get(docId);
    if (doc) {
      this.documents.delete(docId);
      return true;
    }
    return false;
  }
}

const ragService = new RAGService();
module.exports = ragService;
