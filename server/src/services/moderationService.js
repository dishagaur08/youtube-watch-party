class ModerationService {
  constructor() {
    this.bannedKeywords = [
      'hate', 'scam', 'phishing', 'malware', 'exploit', 'bot_spam_token_123',
    ];
    this.userActionHistory = new Map();
  }

  /**
   * Check content for toxicity, harassment, and spam
   */
  async filterContent(text) {
    if (!text || typeof text !== 'string') return { isClean: true, flags: [] };

    const lower = text.toLowerCase();
    const flags = [];

    // Check banned keywords
    for (const word of this.bannedKeywords) {
      if (lower.includes(word)) {
        flags.push(`flagged_term_${word}`);
      }
    }

    // Check excessive caps / shouting
    if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) {
      flags.push('excessive_caps');
    }

    // Check repeated characters (e.g., 'aaaaaaa')
    if (/(.)\1{7,}/.test(text)) {
      flags.push('character_flood');
    }

    return {
      isClean: flags.length === 0,
      flags,
      sanitizedText: this.sanitize(text),
    };
  }

  sanitize(text) {
    let sanitized = text;
    for (const word of this.bannedKeywords) {
      const reg = new RegExp(word, 'gi');
      sanitized = sanitized.replace(reg, '***');
    }
    return sanitized;
  }

  /**
   * Rate limiting / spam prevention per user
   */
  checkUserSpamRate(userId, maxPerMinute = 30) {
    const now = Date.now();
    const history = this.userActionHistory.get(userId) || [];
    const oneMinAgo = now - 60 * 1000;
    const recent = history.filter(t => t > oneMinAgo);

    recent.push(now);
    this.userActionHistory.set(userId, recent);

    if (recent.length > maxPerMinute) {
      return { isSpamming: true, count: recent.length };
    }
    return { isSpamming: false, count: recent.length };
  }
}

const moderationService = new ModerationService();
module.exports = moderationService;
