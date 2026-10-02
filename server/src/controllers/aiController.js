const aiService = require('../services/aiService');
const store = require('../utils/store');

// Main AI chat
const chat = async (req, res) => {
  try {
    const { messages = [], tone = 'balanced', conversationId } = req.body;
    const userId = req.user?._id || req.user?.id || 'guest';

    if (!messages.length) {
      return res.status(400).json({ success: false, message: 'Messages array is required' });
    }

    const reply = await aiService.chatCompletion({ messages, tone });

    // Store in AI conversation history if conversationId provided
    if (conversationId) {
      let aiConv = store.aiConversations.get(conversationId);
      if (!aiConv) {
        aiConv = { _id: conversationId, user: userId, messages: [] };
        store.aiConversations.set(conversationId, aiConv);
      }
      aiConv.messages.push({ role: 'user', content: messages[messages.length - 1].content, timestamp: new Date() });
      aiConv.messages.push({ role: 'assistant', content: reply, timestamp: new Date() });
    }

    res.status(200).json({
      success: true,
      data: {
        reply,
        tone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Smart replies suggestions
const smartReplies = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const replies = await aiService.generateSmartReplies(messages);
    res.status(200).json({ success: true, data: replies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Message tone rewrite
const rewrite = async (req, res) => {
  try {
    const { text, tone = 'professional' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const rewritten = await aiService.rewriteMessage({ text, tone });
    res.status(200).json({ success: true, data: { original: text, rewritten, tone } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// AI translation
const translate = async (req, res) => {
  try {
    const { text, targetLanguage = 'Spanish' } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required' });

    const translated = await aiService.translateMessage({ text, targetLanguage });
    res.status(200).json({ success: true, data: { original: text, translated, targetLanguage } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Summarize conversation
const summarize = async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const summaryResult = await aiService.summarizeConversation(messages);
    res.status(200).json({ success: true, data: summaryResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Extract action items
const actionItems = async (req, res) => {
  try {
    const { text = '' } = req.body;
    const items = await aiService.extractActionItems(text);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Audio transcription
const transcribe = async (req, res) => {
  try {
    const transcript = await aiService.transcribeAudio({
      audioBuffer: req.file?.buffer,
      mimeType: req.file?.mimetype,
    });
    res.status(200).json({ success: true, data: transcript });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  chat,
  smartReplies,
  rewrite,
  translate,
  summarize,
  actionItems,
  transcribe,
};
