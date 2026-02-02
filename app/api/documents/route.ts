import { NextRequest, NextResponse } from 'next/server'
import { getUserDocuments, getDocument } from '@/lib/documents'

/**
 * GET /api/documents
 * Get user's documents
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const documentId = searchParams.get('documentId')

    if (documentId) {
      const document = await getDocument(documentId)
      return NextResponse.json(document)
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    const documents = await getUserDocuments(userId)
    return NextResponse.json(documents)
  } catch (error: any) {
    console.error('[Documents] GET error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
