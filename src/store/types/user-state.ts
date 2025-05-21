
export interface UserState {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  saveDataToSupabase: () => Promise<void>;
  syncDataWithSupabase: () => Promise<void>;
  clearLocalData: () => void;
  setupRealtimeUpdates: (userId: string) => (() => void);
}
