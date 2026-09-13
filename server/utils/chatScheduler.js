// Chat scheduling utility
// Determine if chat is currently open based on IST timezone

const isChatOpen = () => {
  // IST is UTC+5:30
  const istTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  
  // Chat is open from 22:00 (10 PM) to 04:00 (4 AM)
  const currentTimeInMinutes = hours * 60 + minutes;
  const openTimeInMinutes = 22 * 60; // 22:00 = 1320
  const closeTimeInMinutes = 4 * 60;  // 04:00 = 240
  
  // Chat spans midnight
  if (openTimeInMinutes > closeTimeInMinutes) {
    return currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes;
  }
  
  return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
};

const getChatStatus = () => {
  const istTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  
  const openTime = new Date();
  openTime.setHours(22, 0, 0, 0);
  
  const closeTime = new Date();
  closeTime.setHours(4, 0, 0, 0);
  
  if (closeTime > openTime) {
    closeTime.setDate(closeTime.getDate() + 1);
  }
  
  const now = new Date(istTime);
  
  let nextEvent;
  let timeUntilNext;
  
  if (isChatOpen()) {
    nextEvent = 'closes';
    timeUntilNext = new Date(closeTime - now);
  } else {
    nextEvent = 'opens';
    if (now > openTime) {
      timeUntilNext = new Date(closeTime - now);
    } else {
      timeUntilNext = new Date(openTime - now);
    }
  }
  
  return {
    is_open: isChatOpen(),
    next_event: nextEvent,
    time_until_next: timeUntilNext,
  };
};

module.exports = { isChatOpen, getChatStatus };
