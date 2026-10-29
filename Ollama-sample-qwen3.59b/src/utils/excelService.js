import * as XLSX from 'xlsx'

const EXCEL_FILE_PATH = './blog_posts.xlsx'

/**
 * Initialize the Excel file with proper structure if it doesn't exist
 */
export function initializeBlogPosts() {
  const workbook = XLSX.utils.book_new()
  const sheetData = [
    ['Post ID', 'Title', 'Content', 'Author', 'Created At', 'Status'],
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Blog Posts')
  XLSX.writeFile(workbook, EXCEL_FILE_PATH)
}

/**
 * Read all blog posts from Excel file
 */
export async function readBlogPosts() {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: true })
    
    // Convert dates back to JavaScript Date objects if needed
    return data.filter(row => row['Post ID'] !== 'Post ID')
  } catch (error) {
    console.error('Error reading Excel file:', error)
    return []
  }
}

/**
 * Write blog posts to Excel file
 */
export async function writeBlogPosts(posts) {
  try {
    let workbook = XLSX.utils.book_new()
    
    // Check if file exists and has data
    try {
      workbook = XLSX.readFile(EXCEL_FILE_PATH)
      
      // Update existing worksheet with new header row
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = []
      
      // Add header
      rows.push(['Post ID', 'Title', 'Content', 'Author', 'Created At', 'Status'])
      
      // Add existing data that's not in the new posts
      const existingPosts = {}
      posts.forEach(post => {
        existingPosts[post['Post ID']] = post
      })
      
      workbook.Sheets[workbook.SheetNames[0]]['!autofilter'] = { ref: 'A1:F1' }
      
    } catch (fileError) {
      // File doesn't exist, create new
      const sheetData = posts.map(post => [
        post['Post ID'],
        post['Title'],
        post['Content'],
        post['Author'],
        post['Created At'],
        post['Status']
      ])
      
      const worksheet = XLSX.utils.aoa_sheet(sheetData)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Blog Posts')
    }
    
    // Clear and repopulate with new data + posts
    const cleanPosts = posts.filter(post => post['Post ID'] !== undefined)
    const sheetData = [['Post ID', 'Title', 'Content', 'Author', 'Created At', 'Status']]
    
    cleanPosts.forEach(post => {
      sheetData.push([
        post['Post ID'],
        post['Title'],
        post['Content'],
        post['Author'],
        post['Created At'],
        post['Status'] || 'draft'
      ])
    })
    
    const newWorksheet = XLSX.utils.aoa_sheet(sheetData)
    workbook.Sheets['Blog Posts'] = newWorksheet
    XLSX.writeFile(workbook, EXCEL_FILE_PATH)
    
    return true
  } catch (error) {
    console.error('Error writing Excel file:', error)
    throw error
  }
}

/**
 * Add a single blog post
 */
export async function addBlogPost(post) {
  const posts = await readBlogPosts()
  const newPost = { ...post, status: 'draft' }
  
  // Generate unique ID if not provided
  if (!newPost['Post ID']) {
    const existingIds = posts.map(p => parseInt(p['Post ID']))
    const nextId = Math.max(...existingIds) + 1 || 1
    newPost['Post ID'] = String(nextId)
  }
  
  const updatedPosts = [...posts, newPost]
  return writeBlogPosts(updatedPosts)
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(postID, updates) {
  const posts = await readBlogPosts()
  const index = posts.findIndex(p => p['Post ID'] === postID)
  
  if (index !== -1) {
    const updatedPost = { ...posts[index], ...updates }
    const updatedPosts = [...posts.slice(0, index), updatedPost, ...posts.slice(index + 1)]
    return writeBlogPosts(updatedPosts)
  }
  
  throw new Error(`Post with ID ${postID} not found`)
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(postID) {
  const posts = await readBlogPosts()
  const filteredPosts = posts.filter(p => p['Post ID'] !== postID)
  
  if (filteredPosts.length === posts.length) {
    throw new Error(`Post with ID ${postID} not found`)
  }
  
  return writeBlogPosts(filteredPosts)
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(postID) {
  const posts = await readBlogPosts()
  return posts.find(p => p['Post ID'] === postID) || null
}

// Initialize the Excel file on import
initializeBlogPosts()
