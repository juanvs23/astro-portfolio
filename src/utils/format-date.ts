export function formatDate(
  dateStr: string,
  months: string[],
): string {
  const [year, month] = dateStr.split('-');
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}
