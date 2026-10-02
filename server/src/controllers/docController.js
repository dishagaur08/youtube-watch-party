const ragService = require('../services/ragService');

// Upload and chunk document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Document file required (PDF or TXT)' });
    }

    const userId = req.user?._id || req.user?.id || 'guest';
    const docRecord = await ragService.processDocument({
      filePath: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Document parsed and indexed into vector store',
      data: {
        id: docRecord._id,
        title: docRecord.title,
        originalName: docRecord.originalName,
        fileSize: docRecord.fileSize,
        chunkCount: docRecord.chunkCount,
        uploadedAt: docRecord.uploadedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List user's indexed documents
const listDocuments = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || 'guest';
    const docs = ragService.getUserDocuments(userId).map(d => ({
      id: d._id,
      _id: d._id,
      title: d.title,
      originalName: d.originalName,
      fileSize: d.fileSize,
      chunkCount: d.chunkCount,
      uploadedAt: d.uploadedAt,
    }));

    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ask question over document library with Citations
const askDocument = async (req, res) => {
  try {
    const { query, documentId } = req.body;
    const userId = req.user?._id || req.user?.id || 'guest';

    if (!query) {
      return res.status(400).json({ success: false, message: 'Question query is required' });
    }

    const result = await ragService.askQuestion({
      query,
      documentId,
      userId,
    });

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user?._id || req.user?.id || 'guest';

    const deleted = ragService.deleteDocument(docId, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  askDocument,
  deleteDocument,
};
