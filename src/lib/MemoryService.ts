import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  setDoc, 
  doc, 
  getDoc,
  serverTimestamp,
  where,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ChatMessage, PersonalityTraits } from './gemini';

export interface MemoryFragment {
  id?: string;
  userId: string;
  content: string;
  keywords: string[];
  sentiment: string;
  importance: number;
  createdAt: any;
  decayedImportance?: number; // Calculated on the fly
}

export interface IntimacyData {
  level: number; // 0-100
  stage: string;
  days: number;
  lastInteraction: any;
  points: number;
}

export const MemoryService = {
  // Intimacy Tracking
  async getIntimacyData(userId: string): Promise<IntimacyData> {
    const path = `users/${userId}/personality/intimacy`;
    try {
      const snapshot = await getDoc(doc(db, path));
      if (snapshot.exists()) {
        return snapshot.data() as IntimacyData;
      }
      return {
        level: 10,
        stage: 'STRANGER',
        days: 1,
        lastInteraction: serverTimestamp(),
        points: 0
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { level: 0, stage: 'ERROR', days: 0, lastInteraction: null, points: 0 };
    }
  },

  async updateIntimacy(userId: string, pointsToAdd: number) {
    const path = `users/${userId}/personality/intimacy`;
    try {
      const current = await this.getIntimacyData(userId);
      const newPoints = (current.points || 0) + pointsToAdd;
      
      // Points to Level logic (logarithmic-ish)
      // Level 0-100.
      // Every 100 points = 1 level? Or maybe more complex.
      // Let's say: Level = min(100, floor(sqrt(newPoints / 10)))
      const newLevel = Math.min(100, Math.floor(Math.sqrt((newPoints || 0) / 2)));
      
      let newStage = 'STRANGER';
      if (newLevel >= 90) newStage = 'SOULMATE';
      else if (newLevel >= 75) newStage = 'EPIC_LOVER';
      else if (newLevel >= 60) newStage = 'LOVER';
      else if (newLevel >= 45) newStage = 'INTIMATE_FRIEND';
      else if (newLevel >= 30) newStage = 'FRIEND';
      else if (newLevel >= 15) newStage = 'ACQUAINTANCE';

      await setDoc(doc(db, path), {
        points: newPoints,
        level: newLevel,
        stage: newStage,
        days: (current.days || 1) + (pointsToAdd > 0 ? 0.1 : 0), // Incremental days based on activity
        lastInteraction: serverTimestamp()
      }, { merge: true });
      
      return { level: newLevel, stage: newStage };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync Chat History
  async saveChatMessage(userId: string, message: ChatMessage) {
    const path = `users/${userId}/chatHistory`;
    try {
      await addDoc(collection(db, path), {
        ...message,
        userId,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getChatHistory(userId: string, limitCount: number = 20) {
    const path = `users/${userId}/chatHistory`;
    try {
      const q = query(
        collection(db, path),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateMessageReactions(userId: string, messageId: string, reactions: string[]) {
    const path = `users/${userId}/chatHistory/${messageId}`;
    try {
      await updateDoc(doc(db, path), {
        reactions
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Personality DNA
  async savePersonalityDNA(userId: string, dna: PersonalityTraits & { romanceLevel: number }) {
    const path = `users/${userId}/personality/dna`;
    try {
      await setDoc(doc(db, path), {
        ...dna,
        userId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getPersonalityDNA(userId: string) {
    const path = `users/${userId}/personality/dna`;
    try {
      const snapshot = await getDoc(doc(db, path));
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Learning System (Preferences)
  async saveUserPreferences(userId: string, prefs: any) {
    const path = `users/${userId}/preferences/settings`;
    try {
      await setDoc(doc(db, path), {
        ...prefs,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUserPreferences(userId: string) {
    const path = `users/${userId}/preferences/settings`;
    try {
      const snapshot = await getDoc(doc(db, path));
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveReminder(userId: string, text: string, time?: string) {
    const path = `users/${userId}/reminders`;
    try {
      await addDoc(collection(db, path), {
        text,
        time: time || 'Unspecified',
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // User Profile
  async getUserProfile(userId: string) {
    const path = `users/${userId}`;
    try {
      const snapshot = await getDoc(doc(db, path));
      return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Semantic Memory (Mocked with keyword filter)
  async saveMemoryFragment(userId: string, fragment: Omit<MemoryFragment, 'userId' | 'createdAt'>) {
    const path = `users/${userId}/memories`;
    try {
      await addDoc(collection(db, path), {
        ...fragment,
        userId,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async searchMemories(userId: string, queryText: string) {
    const path = `users/${userId}/memories`;
    try {
      const keywords = queryText.toLowerCase().split(' ').filter(k => k.length > 3);
      
      const q = query(
        collection(db, path),
        orderBy('createdAt', 'desc'),
        limit(50) // Fetch more to allow for filtering and ranking
      );
      const snapshot = await getDocs(q);
      const now = Date.now();
      
      let memories = snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate()?.getTime() || now;
        const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        
        // Memory Decay Formula: 
        // Effective Importance = Base Importance * exp(-decayRate * age)
        // decayRate: 0.05 means ~5% decay per day.
        const decayRate = 0.05; 
        const decayedImportance = (data.importance || 5) * Math.exp(-decayRate * ageInDays);
        
        return { 
          id: doc.id, 
          ...data, 
          decayedImportance 
        } as MemoryFragment;
      });
      
      // Filter by keywords if any match, or just use semantic relevance
      if (keywords.length > 0) {
        memories = memories.filter(m => 
          m.keywords?.some(k => keywords.includes(k.toLowerCase())) ||
          m.content.toLowerCase().includes(queryText.toLowerCase())
        );
      }
      
      // Sort by decayed importance (newer/more important memories bubble up)
      return memories.sort((a, b) => (b.decayedImportance || 0) - (a.decayedImportance || 0)).slice(0, 10);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};
