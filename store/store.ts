import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Define the structure of the Dimension interface
interface Dimension {
  name: string;
  value: number;
}

// Define the structure of the PersonalityReport interface
interface PersonalityReport {
  mbti: {
    type: string;
    dimensions: Dimension[];
  };
  bigFive: Dimension[];
  learningStyles: Dimension[];
  socialLearning: number;
  independentLearning: number;
  neuroticismScore: number;
  leadershipPotential: boolean;
  collaborationSuitability: boolean;
}

// Define the structure of the StoreState interface
export interface StoreState {
  personalityReport: PersonalityReport | null;
  setPersonalityReport: (report: PersonalityReport) => void;
}

// Create the Zustand store with persist middleware
const useStore = create<StoreState>()(
  persist(
    (set) => ({
      personalityReport: null,
      setPersonalityReport: (report) => set({ personalityReport: report }),
    }),
    {
      name: 'personality-storage', // Unique name for the storage key
      storage: createJSONStorage(() => localStorage), // Use local storage as the storage option
    }
  )
);

export default useStore;
