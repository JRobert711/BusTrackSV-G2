// Simple toast replacement that doesn't break
// This replaces sonner's toast to avoid React hook errors

export const toast = {
  success: (message: string, options?: { description?: string }) => {
    console.log('✅', message, options?.description || '');
  },
  error: (message: string, options?: { description?: string }) => {
    console.error('❌', message, options?.description || '');
  },
  warning: (message: string, options?: { description?: string }) => {
    console.warn('⚠️', message, options?.description || '');
  },
  info: (message: string, options?: { description?: string }) => {
    console.info('ℹ️', message, options?.description || '');
  },
};

