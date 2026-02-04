import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { success: false, error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Файл слишком большой. Максимум 2MB' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Неподдерживаемый формат. Используйте JPEG, PNG или WebP' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Check if avatars bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets()
    const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars')

    if (!avatarsBucketExists) {
      console.log('[API] Creating avatars bucket...')
      const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      })

      if (createBucketError) {
        console.error('[API] Error creating bucket:', createBucketError)
        // Continue anyway - bucket might exist but listBuckets failed
      }
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `avatars/${userId}-${fileName}`

    console.log('[API] Uploading avatar:', { filePath, size: file.size, type: file.type })

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[API] Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    console.log('[API] Avatar uploaded successfully:', data.publicUrl)

    return NextResponse.json({
      success: true,
      avatarUrl: data.publicUrl
    })
  } catch (error: any) {
    console.error('[API] Error in upload-avatar:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Ошибка загрузки файла' },
      { status: 500 }
    )
  }
}
