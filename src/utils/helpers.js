/**
 * Format tanggal ke format lokal Indonesia
 * @param {string|Date} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Format status event ke badge styling class
 * @param {string} status
 * @returns {string}
 */
export function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'open':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'closed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'ongoing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
