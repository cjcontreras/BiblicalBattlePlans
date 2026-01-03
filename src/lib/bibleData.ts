/**
 * Bible Data Constants
 * Complete list of books with chapter counts for Bible and Apocrypha tracking
 */

export interface BibleBook {
  name: string
  chapters: number
  testament: 'OT' | 'NT' | 'Apocrypha'
  category: string
}

// ============================================
// PROTESTANT CANON - 66 BOOKS, 1,189 CHAPTERS
// ============================================

export const OLD_TESTAMENT_BOOKS: BibleBook[] = [
  // Pentateuch (Torah)
  { name: 'Genesis', chapters: 50, testament: 'OT', category: 'Pentateuch' },
  { name: 'Exodus', chapters: 40, testament: 'OT', category: 'Pentateuch' },
  { name: 'Leviticus', chapters: 27, testament: 'OT', category: 'Pentateuch' },
  { name: 'Numbers', chapters: 36, testament: 'OT', category: 'Pentateuch' },
  { name: 'Deuteronomy', chapters: 34, testament: 'OT', category: 'Pentateuch' },
  
  // Historical Books
  { name: 'Joshua', chapters: 24, testament: 'OT', category: 'History' },
  { name: 'Judges', chapters: 21, testament: 'OT', category: 'History' },
  { name: 'Ruth', chapters: 4, testament: 'OT', category: 'History' },
  { name: '1 Samuel', chapters: 31, testament: 'OT', category: 'History' },
  { name: '2 Samuel', chapters: 24, testament: 'OT', category: 'History' },
  { name: '1 Kings', chapters: 22, testament: 'OT', category: 'History' },
  { name: '2 Kings', chapters: 25, testament: 'OT', category: 'History' },
  { name: '1 Chronicles', chapters: 29, testament: 'OT', category: 'History' },
  { name: '2 Chronicles', chapters: 36, testament: 'OT', category: 'History' },
  { name: 'Ezra', chapters: 10, testament: 'OT', category: 'History' },
  { name: 'Nehemiah', chapters: 13, testament: 'OT', category: 'History' },
  { name: 'Esther', chapters: 10, testament: 'OT', category: 'History' },
  
  // Poetry & Wisdom
  { name: 'Job', chapters: 42, testament: 'OT', category: 'Poetry' },
  { name: 'Psalms', chapters: 150, testament: 'OT', category: 'Poetry' },
  { name: 'Proverbs', chapters: 31, testament: 'OT', category: 'Poetry' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'OT', category: 'Poetry' },
  { name: 'Song of Solomon', chapters: 8, testament: 'OT', category: 'Poetry' },
  
  // Major Prophets
  { name: 'Isaiah', chapters: 66, testament: 'OT', category: 'Major Prophets' },
  { name: 'Jeremiah', chapters: 52, testament: 'OT', category: 'Major Prophets' },
  { name: 'Lamentations', chapters: 5, testament: 'OT', category: 'Major Prophets' },
  { name: 'Ezekiel', chapters: 48, testament: 'OT', category: 'Major Prophets' },
  { name: 'Daniel', chapters: 12, testament: 'OT', category: 'Major Prophets' },
  
  // Minor Prophets
  { name: 'Hosea', chapters: 14, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Joel', chapters: 3, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Amos', chapters: 9, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Obadiah', chapters: 1, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Jonah', chapters: 4, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Micah', chapters: 7, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Nahum', chapters: 3, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Habakkuk', chapters: 3, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Zephaniah', chapters: 3, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Haggai', chapters: 2, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Zechariah', chapters: 14, testament: 'OT', category: 'Minor Prophets' },
  { name: 'Malachi', chapters: 4, testament: 'OT', category: 'Minor Prophets' },
]

export const NEW_TESTAMENT_BOOKS: BibleBook[] = [
  // Gospels
  { name: 'Matthew', chapters: 28, testament: 'NT', category: 'Gospels' },
  { name: 'Mark', chapters: 16, testament: 'NT', category: 'Gospels' },
  { name: 'Luke', chapters: 24, testament: 'NT', category: 'Gospels' },
  { name: 'John', chapters: 21, testament: 'NT', category: 'Gospels' },
  
  // History
  { name: 'Acts', chapters: 28, testament: 'NT', category: 'History' },
  
  // Pauline Epistles
  { name: 'Romans', chapters: 16, testament: 'NT', category: 'Pauline Epistles' },
  { name: '1 Corinthians', chapters: 16, testament: 'NT', category: 'Pauline Epistles' },
  { name: '2 Corinthians', chapters: 13, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Galatians', chapters: 6, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Ephesians', chapters: 6, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Philippians', chapters: 4, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Colossians', chapters: 4, testament: 'NT', category: 'Pauline Epistles' },
  { name: '1 Thessalonians', chapters: 5, testament: 'NT', category: 'Pauline Epistles' },
  { name: '2 Thessalonians', chapters: 3, testament: 'NT', category: 'Pauline Epistles' },
  { name: '1 Timothy', chapters: 6, testament: 'NT', category: 'Pauline Epistles' },
  { name: '2 Timothy', chapters: 4, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Titus', chapters: 3, testament: 'NT', category: 'Pauline Epistles' },
  { name: 'Philemon', chapters: 1, testament: 'NT', category: 'Pauline Epistles' },
  
  // General Epistles
  { name: 'Hebrews', chapters: 13, testament: 'NT', category: 'General Epistles' },
  { name: 'James', chapters: 5, testament: 'NT', category: 'General Epistles' },
  { name: '1 Peter', chapters: 5, testament: 'NT', category: 'General Epistles' },
  { name: '2 Peter', chapters: 3, testament: 'NT', category: 'General Epistles' },
  { name: '1 John', chapters: 5, testament: 'NT', category: 'General Epistles' },
  { name: '2 John', chapters: 1, testament: 'NT', category: 'General Epistles' },
  { name: '3 John', chapters: 1, testament: 'NT', category: 'General Epistles' },
  { name: 'Jude', chapters: 1, testament: 'NT', category: 'General Epistles' },
  
  // Apocalyptic
  { name: 'Revelation', chapters: 22, testament: 'NT', category: 'Apocalyptic' },
]

// Combined Bible books (Protestant canon)
export const BIBLE_BOOKS: BibleBook[] = [...OLD_TESTAMENT_BOOKS, ...NEW_TESTAMENT_BOOKS]

// ============================================
// APOCRYPHA / DEUTEROCANONICAL BOOKS
// ============================================

export const APOCRYPHA_BOOKS: BibleBook[] = [
  { name: 'Tobit', chapters: 14, testament: 'Apocrypha', category: 'Historical' },
  { name: 'Judith', chapters: 16, testament: 'Apocrypha', category: 'Historical' },
  { name: 'Additions to Esther', chapters: 6, testament: 'Apocrypha', category: 'Additions' },
  { name: 'Wisdom of Solomon', chapters: 19, testament: 'Apocrypha', category: 'Wisdom' },
  { name: 'Sirach', chapters: 51, testament: 'Apocrypha', category: 'Wisdom' },
  { name: 'Baruch', chapters: 6, testament: 'Apocrypha', category: 'Prophetic' },
  { name: 'Letter of Jeremiah', chapters: 1, testament: 'Apocrypha', category: 'Prophetic' },
  { name: 'Prayer of Azariah', chapters: 1, testament: 'Apocrypha', category: 'Additions' },
  { name: 'Susanna', chapters: 1, testament: 'Apocrypha', category: 'Additions' },
  { name: 'Bel and the Dragon', chapters: 1, testament: 'Apocrypha', category: 'Additions' },
  { name: '1 Maccabees', chapters: 16, testament: 'Apocrypha', category: 'Historical' },
  { name: '2 Maccabees', chapters: 15, testament: 'Apocrypha', category: 'Historical' },
  { name: '1 Esdras', chapters: 9, testament: 'Apocrypha', category: 'Historical' },
  { name: 'Prayer of Manasseh', chapters: 1, testament: 'Apocrypha', category: 'Prayer' },
  { name: 'Psalm 151', chapters: 1, testament: 'Apocrypha', category: 'Poetry' },
  { name: '3 Maccabees', chapters: 7, testament: 'Apocrypha', category: 'Historical' },
  { name: '2 Esdras', chapters: 16, testament: 'Apocrypha', category: 'Apocalyptic' },
  { name: '4 Maccabees', chapters: 18, testament: 'Apocrypha', category: 'Philosophical' },
]

// ============================================
// TOTALS & CONSTANTS
// ============================================

export const BIBLE_TOTAL_CHAPTERS = BIBLE_BOOKS.reduce((sum, book) => sum + book.chapters, 0) // 1,189
export const OLD_TESTAMENT_TOTAL_CHAPTERS = OLD_TESTAMENT_BOOKS.reduce((sum, book) => sum + book.chapters, 0) // 929
export const NEW_TESTAMENT_TOTAL_CHAPTERS = NEW_TESTAMENT_BOOKS.reduce((sum, book) => sum + book.chapters, 0) // 260
export const APOCRYPHA_TOTAL_CHAPTERS = APOCRYPHA_BOOKS.reduce((sum, book) => sum + book.chapters, 0) // 199

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get books grouped by testament
 */
export function getBooksByTestament(books: BibleBook[]): Record<string, BibleBook[]> {
  return books.reduce((acc, book) => {
    const key = book.testament
    if (!acc[key]) acc[key] = []
    acc[key].push(book)
    return acc
  }, {} as Record<string, BibleBook[]>)
}

/**
 * Get books grouped by category within a testament
 */
export function getBooksByCategory(books: BibleBook[]): Record<string, BibleBook[]> {
  return books.reduce((acc, book) => {
    const key = book.category
    if (!acc[key]) acc[key] = []
    acc[key].push(book)
    return acc
  }, {} as Record<string, BibleBook[]>)
}

/**
 * Calculate total chapters in a list of books
 */
export function getTotalChapters(books: BibleBook[]): number {
  return books.reduce((sum, book) => sum + book.chapters, 0)
}

/**
 * Find a book by name (case-insensitive)
 */
export function findBook(name: string, books: BibleBook[] = BIBLE_BOOKS): BibleBook | undefined {
  return books.find(book => book.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all chapter numbers for a book (1-based array)
 */
export function getChapterNumbers(book: BibleBook): number[] {
  return Array.from({ length: book.chapters }, (_, i) => i + 1)
}

/**
 * Check if a book name is valid
 */
export function isValidBook(name: string, books: BibleBook[] = BIBLE_BOOKS): boolean {
  return books.some(book => book.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get testament label for display
 */
export function getTestamentLabel(testament: 'OT' | 'NT' | 'Apocrypha'): string {
  switch (testament) {
    case 'OT':
      return 'Old Testament'
    case 'NT':
      return 'New Testament'
    case 'Apocrypha':
      return 'Apocrypha'
  }
}

/**
 * Get the book list for a plan type
 */
export function getBooksForPlanType(planType: 'bible' | 'apocrypha'): BibleBook[] {
  return planType === 'bible' ? BIBLE_BOOKS : APOCRYPHA_BOOKS
}

/**
 * Get the total chapters for a plan type
 */
export function getTotalChaptersForPlanType(planType: 'bible' | 'apocrypha'): number {
  return planType === 'bible' ? BIBLE_TOTAL_CHAPTERS : APOCRYPHA_TOTAL_CHAPTERS
}


