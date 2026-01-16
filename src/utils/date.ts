import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

// Backend date format: "yyyy-MM-dd HH:mm:ss"
const BACKEND_FORMAT = 'YYYY-MM-DD HH:mm:ss'

// ISO format for query parameters: "yyyy-MM-ddTHH:mm:ss"
const ISO_FORMAT = 'YYYY-MM-DDTHH:mm:ss'

/**
 * Format backend date string for display
 * @param date Backend date string "yyyy-MM-dd HH:mm:ss"
 * @returns Formatted display string or original if invalid
 */
export function formatDisplay(date: string | undefined): string {
  if (!date) return '-'
  const parsed = dayjs(date, BACKEND_FORMAT)
  return parsed.isValid() ? parsed.format(BACKEND_FORMAT) : date
}

/**
 * Convert Date object to ISO format for query parameters
 * @param date Date object
 * @returns ISO formatted string "YYYY-MM-DDTHH:mm:ss"
 */
export function toISODateTime(date: Date | number): string {
  return dayjs(date).format(ISO_FORMAT)
}

/**
 * Parse backend date string to Date object
 * @param date Backend date string "yyyy-MM-dd HH:mm:ss"
 * @returns Date object or null if invalid
 */
export function parseBackendDate(date: string | undefined): Date | null {
  if (!date) return null
  const parsed = dayjs(date, BACKEND_FORMAT)
  return parsed.isValid() ? parsed.toDate() : null
}

/**
 * Format Date object to display format
 * @param date Date object
 * @returns Formatted display string "YYYY-MM-DD HH:mm:ss"
 */
export function formatDate(date: Date | number): string {
  return dayjs(date).format(BACKEND_FORMAT)
}

/**
 * Get relative time from now
 * @param date Date string or Date object
 * @returns Relative time string
 */
export function fromNow(date: string | Date | undefined): string {
  if (!date) return '-'
  const parsed = typeof date === 'string' ? dayjs(date, BACKEND_FORMAT) : dayjs(date)
  return parsed.isValid() ? parsed.fromNow() : '-'
}
