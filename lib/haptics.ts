/**
 * Haptic feedback utility using Web Vibration API for mobile devices.
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(25);
        break;
      case 'heavy':
        navigator.vibrate([40, 30, 40]);
        break;
      case 'success':
        navigator.vibrate([15, 50, 20]);
        break;
      case 'error':
        navigator.vibrate([50, 40, 50, 40, 50]);
        break;
    }
  } catch {
    // Ignore if not supported or blocked by user agent
  }
}
