import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      console.error('[Upload API] Missing file or userId')
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    console.log('[Upload API] Uploading file for user:', userId)

    // Verify file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 413 }
      )
    }

    // Verify file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be JPEG, PNG or WebP' },
        { status: 415 }
      )
    }

    // Upload to Vercel Blob with user ID prefix
    const filename = `avatars/${userId}/${Date.now()}-${file.name}`
    console.log('[Upload API] Uploading to Vercel Blob:', filename)

    const blob = await put(filename, file, {
      access: 'public',
      cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year
    })

    console.log('[Upload API] ✅ Upload successful:', blob.url)

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
