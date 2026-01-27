export const getUserRole = (): 'worker' | 'client' | 'shef' => {
  if (typeof window === 'undefined') return 'worker';
  return (localStorage.getItem('userRole') as 'worker' | 'client' | 'shef') || 'worker';
};
