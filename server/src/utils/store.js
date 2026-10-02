const bcrypt = require('bcryptjs');

// In-Memory resilient store for zero-downtime development and testing
class MemoryStore {
  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.communities = new Map();
    this.channels = new Map();
    this.calls = new Map();
    this.streams = new Map();
    this.gameRooms = new Map();
    this.gameStats = new Map();
    this.watchRooms = new Map();
    this.aiConversations = new Map();
    this.documents = new Map();
    this.notifications = new Map();
    this.stories = new Map();
    this.reports = new Map();
    this.auditLogs = new Map();
    this.friendRequests = new Map();

    this.initDefaultData();
  }

  initDefaultData() {
    const hashedPassword = bcrypt.hashSync('vyntra123', 10);
    
    // Seed Users
    const adminUser = {
      _id: 'usr_admin_1',
      username: 'admin',
      email: 'admin@vyntra.io',
      password: hashedPassword,
      displayName: 'Vyntra Admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      bio: 'VYNTRA System Administrator & Lead Architect.',
      status: 'online',
      role: 'admin',
      isVerified: true,
      friends: ['usr_disha_2', 'usr_alex_3'],
      following: ['usr_disha_2'],
      followers: ['usr_disha_2'],
      createdAt: new Date(),
    };

    const dishaUser = {
      _id: 'usr_disha_2',
      username: 'disha',
      email: 'disha@vyntra.io',
      password: hashedPassword,
      displayName: 'Disha Patel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      bio: 'Building the next-generation web & gaming universe ✨',
      status: 'online',
      role: 'user',
      isVerified: true,
      friends: ['usr_admin_1', 'usr_alex_3', 'usr_sarah_4'],
      following: ['usr_admin_1', 'usr_alex_3'],
      followers: ['usr_admin_1'],
      createdAt: new Date(),
    };

    const alexUser = {
      _id: 'usr_alex_3',
      username: 'alex_gamer',
      email: 'alex@vyntra.io',
      password: hashedPassword,
      displayName: 'Alex Rivers',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
      bio: 'Grandmaster Chess Player & Unreal Streamer ♟️🎮',
      status: 'online',
      role: 'user',
      isVerified: true,
      friends: ['usr_admin_1', 'usr_disha_2'],
      following: ['usr_disha_2'],
      followers: ['usr_disha_2'],
      createdAt: new Date(),
    };

    const sarahUser = {
      _id: 'usr_sarah_4',
      username: 'sarah_ai',
      email: 'sarah@vyntra.io',
      password: hashedPassword,
      displayName: 'Dr. Sarah Lin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&auto=format&fit=crop&q=80',
      bio: 'AI Researcher & Neural Systems Enthusiast 🧠',
      status: 'idle',
      role: 'user',
      isVerified: true,
      friends: ['usr_disha_2'],
      following: ['usr_disha_2'],
      followers: ['usr_disha_2'],
      createdAt: new Date(),
    };

    this.users.set(adminUser._id, adminUser);
    this.users.set(dishaUser._id, dishaUser);
    this.users.set(alexUser._id, alexUser);
    this.users.set(sarahUser._id, sarahUser);

    // Seed Conversations
    const conv1 = {
      _id: 'conv_1',
      type: 'direct',
      participants: ['usr_admin_1', 'usr_disha_2'],
      lastMessage: 'msg_2',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 5),
      createdAt: new Date(),
    };
    const conv2 = {
      _id: 'conv_2',
      type: 'direct',
      participants: ['usr_disha_2', 'usr_alex_3'],
      lastMessage: 'msg_3',
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date(),
    };
    this.conversations.set(conv1._id, conv1);
    this.conversations.set(conv2._id, conv2);

    // Seed Messages
    const msg1 = {
      _id: 'msg_1',
      conversationId: 'conv_1',
      sender: 'usr_admin_1',
      content: 'Welcome to VYNTRA! All real-time, voice, gaming and AI systems are initialized.',
      type: 'text',
      reactions: [{ emoji: '🔥', users: ['usr_disha_2'] }],
      readBy: [{ user: 'usr_disha_2', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
    };
    const msg2 = {
      _id: 'msg_2',
      conversationId: 'conv_1',
      sender: 'usr_disha_2',
      content: 'Awesome! Ready to test live streaming and multiplayer chess.',
      type: 'text',
      reactions: [{ emoji: '🚀', users: ['usr_admin_1'] }],
      readBy: [{ user: 'usr_admin_1', readAt: new Date() }],
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    };
    const msg3 = {
      _id: 'msg_3',
      conversationId: 'conv_2',
      sender: 'usr_alex_3',
      content: 'Hey Disha! Up for a blitz chess match on VYNTRA?',
      type: 'text',
      reactions: [],
      readBy: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    };
    this.messages.set(msg1._id, msg1);
    this.messages.set(msg2._id, msg2);
    this.messages.set(msg3._id, msg3);

    // Seed Communities
    const comm1 = {
      _id: 'comm_1',
      name: 'Vyntra Developers Hub',
      description: 'Official developer community for VYNTRA APIs, extensions and real-time tech.',
      icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
      owner: 'usr_admin_1',
      isPrivate: false,
      members: [
        { user: 'usr_admin_1', role: 'owner', joinedAt: new Date() },
        { user: 'usr_disha_2', role: 'admin', joinedAt: new Date() },
        { user: 'usr_alex_3', role: 'member', joinedAt: new Date() },
        { user: 'usr_sarah_4', role: 'member', joinedAt: new Date() },
      ],
      inviteCode: 'DEV-VYNTRA',
      createdAt: new Date(),
    };

    const comm2 = {
      _id: 'comm_2',
      name: 'Nebula Gaming Arena',
      description: 'Multiplayer matches, tournaments, watch parties, and gaming highlights.',
      icon: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
      owner: 'usr_alex_3',
      isPrivate: false,
      members: [
        { user: 'usr_alex_3', role: 'owner', joinedAt: new Date() },
        { user: 'usr_disha_2', role: 'member', joinedAt: new Date() },
      ],
      inviteCode: 'NEBULA-GAME',
      createdAt: new Date(),
    };

    this.communities.set(comm1._id, comm1);
    this.communities.set(comm2._id, comm2);

    // Seed Channels
    const chan1 = { _id: 'chan_1', communityId: 'comm_1', name: 'announcements', type: 'announcement', category: 'Information', position: 0 };
    const chan2 = { _id: 'chan_2', communityId: 'comm_1', name: 'general-chat', type: 'text', category: 'Text Channels', position: 1 };
    const chan3 = { _id: 'chan_3', communityId: 'comm_1', name: 'ai-discussion', type: 'text', category: 'Text Channels', position: 2 };
    const chan4 = { _id: 'chan_4', communityId: 'comm_1', name: 'Dev Voice Lounge', type: 'voice', category: 'Voice Rooms', position: 3 };

    const chan5 = { _id: 'chan_5', communityId: 'comm_2', name: 'game-lobby', type: 'text', category: 'Lobby', position: 0 };
    const chan6 = { _id: 'chan_6', communityId: 'comm_2', name: 'Gaming Voice Alpha', type: 'voice', category: 'Voice Channels', position: 1 };

    this.channels.set(chan1._id, chan1);
    this.channels.set(chan2._id, chan2);
    this.channels.set(chan3._id, chan3);
    this.channels.set(chan4._id, chan4);
    this.channels.set(chan5._id, chan5);
    this.channels.set(chan6._id, chan6);

    // Seed Streams
    const stream1 = {
      _id: 'stream_1',
      title: 'Grandmaster Chess Speedrun & Real-Time AI Analysis',
      description: 'Playing top players while explaining opening theory and analyzing positional tactics.',
      streamer: 'usr_alex_3',
      category: 'Gaming',
      thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&auto=format&fit=crop&q=80',
      isLive: true,
      viewerCount: 42,
      peakViewers: 120,
      tags: ['Chess', 'Grandmaster', 'Competitive'],
      startedAt: new Date(Date.now() - 1000 * 60 * 45),
    };
    const stream2 = {
      _id: 'stream_2',
      title: 'Building Next-Gen Neural LLM Agents Live with Vyntra RAG',
      description: 'Live coding session implementing real-time vector embeddings and streaming assistants.',
      streamer: 'usr_sarah_4',
      category: 'Tech & AI',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      isLive: true,
      viewerCount: 89,
      peakViewers: 154,
      tags: ['AI', 'React', 'LiveCoding'],
      startedAt: new Date(Date.now() - 1000 * 60 * 20),
    };
    this.streams.set(stream1._id, stream1);
    this.streams.set(stream2._id, stream2);

    // Seed Watch Room
    const watch1 = {
      _id: 'watch_1',
      roomId: 'room_lounge_4k',
      title: 'Synthwave & Cyberpunk Ambient Lounge',
      host: 'usr_admin_1',
      mediaType: 'youtube',
      mediaUrl: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
      playbackState: { isPlaying: true, currentTime: 142, lastUpdated: new Date() },
      participants: ['usr_admin_1', 'usr_disha_2'],
      queue: [],
    };
    this.watchRooms.set(watch1.roomId, watch1);

    // Seed Game Stats
    this.gameStats.set('usr_disha_2', {
      user: 'usr_disha_2',
      rating: 1350,
      totalPlayed: 18,
      wins: 12,
      losses: 4,
      draws: 2,
      gameSpecific: {
        chess: { played: 8, wins: 5 },
        tictactoe: { played: 4, wins: 4 },
        rps: { played: 3, wins: 2 },
        quiz: { played: 3, wins: 1 },
      },
      achievements: [
        { id: 'first_win', title: 'First Victory', unlockedAt: new Date() },
        { id: 'chess_master', title: 'Tactician', unlockedAt: new Date() },
      ],
    });

    this.gameStats.set('usr_alex_3', {
      user: 'usr_alex_3',
      rating: 1680,
      totalPlayed: 45,
      wins: 38,
      losses: 5,
      draws: 2,
      gameSpecific: {
        chess: { played: 30, wins: 28 },
        tictactoe: { played: 5, wins: 4 },
        rps: { played: 5, wins: 3 },
        quiz: { played: 5, wins: 3 },
      },
      achievements: [
        { id: 'grandmaster', title: 'Grandmaster ELO', unlockedAt: new Date() },
        { id: 'unbeaten_streak', title: '10 Win Streak', unlockedAt: new Date() },
      ],
    });
  }
}

const store = new MemoryStore();
module.exports = store;
