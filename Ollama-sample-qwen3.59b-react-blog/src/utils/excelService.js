import XLSX from 'xlsx'
import { app } from '../firebase/config'

const EXCEL_FILE_NAME = 'blog_posts.xlsx'

// Sample data structure for the Excel file:
// Column Headers: id, title, content, author, timestamp, status
// Example row: 1, "My First Blog Post", "This is my first blog post...", "John Doe", "2024-01-01T00:00:00Z", "published"

/**
 * Initialize Excel file with schema if it doesn't exist
 */
export const initExcelFile = (filename) => {
  const workbook = XLSX.utils.book_new()
  const worksheetData = [
    ['id', 'title', 'content', 'author', 'timestamp', 'status'],
    [] // empty header row
  ]
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'BlogPosts')
  
  XLSX.writeFile(workbook, filename)
}

/**
 * Read all blog posts from Excel file
 */
export const readBlogPosts = (filename = EXCEL_FILE_NAME) => {
  try {
    const data = XLSX.readFile(filename)
    const worksheet = data.Sheets['BlogPosts'] || null
    
    if (!worksheet) {
      // File doesn't exist or has no BlogPosts sheet
      console.warn('Excel file not found or missing BlogPosts sheet')
      return []
    }
    
    // Convert to array, skipping header row (row 0)
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
    
    if (!jsonData || jsonData.length === 0) {
      console.warn('No blog posts found')
      return []
    }
    
    // Remove empty rows and convert to objects
    const validData = jsonData.filter(row => row[0])
    const posts = validData.map((row, index) => ({
      id: parseInt(row[0]) || (index + 1),
      title: row[1] || '',
      content: row[2] || '',
      author: row[3] || 'Unknown',
      timestamp: row[4] || new Date().toISOString(),
      status: row[5] || 'draft'
    }))
    
    return posts
  } catch (error) {
    console.error('Error reading Excel file:', error)
    return []
  }
}

/**
 * Write blog posts to Excel file
 */
export const writeBlogPosts = (posts, filename = EXCEL_FILE_NAME) => {
  try {
    const worksheetData = [['id', 'title', 'content', 'author', 'timestamp', 'status']]
    
    // Sort by ID for consistent ordering
    posts.sort((a, b) => a.id - b.id).forEach(post => {
      worksheetData.push([
        post.id,
        post.title || '',
        post.content || '',
        post.author || '',
        post.timestamp || '',
        post.status || 'draft'
      ])
    })
    
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BlogPosts')
    
    // In a real app, you'd save to file system
    // XLSX.writeFile(workbook, filename)
    return workbook
  } catch (error) {
    console.error('Error writing Excel file:', error)
    throw error
  }
}

/**
 * Find a blog post by ID
 */
export const findPostById = (posts, id) => {
  return posts.find(post => post.id === parseInt(id))
}

/**
 * Check if Excel file exists
 */
export const fileExists = async (filename = EXCEL_FILE_NAME) => {
  try {
    const response = await fetch(filename)
    return !response.status >= 404
  } catch {
    return false
  }
}
