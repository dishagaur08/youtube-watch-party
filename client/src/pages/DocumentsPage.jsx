import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Trash2, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [query, setQuery] = useState('');
  const [qaResult, setQaResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/docs');
      if (res.data?.success) {
        setDocuments(res.data.data);
        if (res.data.data.length > 0 && !selectedDoc) {
          setSelectedDoc(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch docs error:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Upload document error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setQaResult(null);

    try {
      const res = await api.post('/docs/ask', {
        query: query.trim(),
        documentId: selectedDoc?.id || selectedDoc?._id,
      });
      if (res.data?.success) {
        setQaResult(res.data.data);
      }
    } catch (err) {
      console.error('Ask document error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await api.delete(`/docs/${docId}`);
      setDocuments(prev => prev.filter(d => (d.id || d._id) !== docId));
      if ((selectedDoc?.id || selectedDoc?._id) === docId) {
        setSelectedDoc(null);
        setQaResult(null);
      }
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-vyntra-border/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>AI Document Intelligence & Vector RAG</span>
          </h2>
          <p className="text-xs text-slate-400">Upload PDFs/text files, extract vector embeddings & query with verified citations</p>
        </div>

        {/* Upload Trigger */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.txt,.json,.md"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cyan transition-all hover:scale-105 disabled:opacity-50"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{uploading ? 'Vectorizing Document...' : 'Upload Knowledge File'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Document Library */}
        <div className="bg-vyntra-card rounded-3xl p-5 border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Document Library</span>
          </h3>

          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No documents uploaded yet. Upload a PDF or text file to test RAG intelligence.
              </div>
            ) : (
              documents.map((doc) => {
                const isSelected = (selectedDoc?.id || selectedDoc?._id) === (doc.id || doc._id);
                return (
                  <div
                    key={doc.id || doc._id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border-cyan-500 shadow-glow-cyan'
                        : 'bg-vyntra-surface/40 hover:bg-vyntra-surface border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-white truncate">{doc.title || doc.originalName}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {doc.chunkCount || 1} Chunks Vectorized
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id || doc._id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Semantic Q&A Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Bar */}
          <form onSubmit={handleAskQuestion} className="p-3 bg-vyntra-card rounded-2xl border border-white/10 flex items-center gap-2 shadow-lg">
            <Search className="w-4 h-4 text-cyan-400 ml-2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={selectedDoc ? `Ask questions regarding "${selectedDoc.title}"...` : "Upload or select a document to ask questions..."}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-40"
            >
              <span>{loading ? 'Searching...' : 'Ask RAG'}</span>
            </button>
          </form>

          {/* Answer & Verified Citations Card */}
          {qaResult && (
            <div className="bg-vyntra-card rounded-3xl p-6 border border-cyan-500/30 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Synthesized Answer</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Confidence: {Math.round((qaResult.confidence || 0.95) * 100)}%
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {qaResult.answer}
              </div>

              {/* Exact Source Citations */}
              {qaResult.citations && qaResult.citations.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Verified Citations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {qaResult.citations.map((cite, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-vyntra-surface/40 border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-cyan-300">
                          <span>{cite.docTitle}</span>
                          <span>Page {cite.page}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic line-clamp-3">"{cite.excerpt}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
