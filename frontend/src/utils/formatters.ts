export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (timeString: string): string => {
  return timeString;
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number): string => {
  return amount === 0 ? 'Free' : `₹${amount.toFixed(2)}`;
};

export const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'open':
      return '#10b981'; // green
    case 'full':
      return '#f59e0b'; // amber
    case 'registration_closed':
      return '#ef4444'; // red
    case 'completed':
      return '#6b7280'; // gray
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export const getRegistrationStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return '#10b981'; // green
    case 'waitlist':
      return '#f59e0b'; // amber
    case 'cancelled':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getDaysUntilEvent = (eventDate: string): number => {
  const today = new Date();
  const event = new Date(eventDate);
  const diffTime = event.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isEventUpcoming = (eventDate: string): boolean => {
  return getDaysUntilEvent(eventDate) > 0;
};

export const isRegistrationOpen = (registrationDeadline: string, eventDate: string): boolean => {
  const now = new Date();
  const deadline = new Date(registrationDeadline);
  const event = new Date(eventDate);
  return deadline > now && event > now;
};