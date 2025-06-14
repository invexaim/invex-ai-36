
// Re-export from the new modular structure for backward compatibility
export { createClientSlice, useClientStore } from './client';
export type { ClientState } from './client';
export default useClientStore;
