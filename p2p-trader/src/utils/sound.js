export function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const frequencies = [880, 1100, 880, 1100];
    let time = audioCtx.currentTime;

    frequencies.forEach((freq, i) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, time + 0.18);

      oscillator.start(time);
      oscillator.stop(time + 0.2);

      time += 0.25;
    });
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendDealExpiredNotification(dealId) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Внимание! Сделка #${dealId} истекла!`, {
      body: 'Время на сделку вышло. Требуется ваше действие.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `deal-expired-${dealId}`,
      requireInteraction: true,
    });
  }
}
