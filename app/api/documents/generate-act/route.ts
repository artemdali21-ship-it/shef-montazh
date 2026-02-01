import { NextRequest, NextResponse } from 'next/server'
import { generateActPDF } from '@/lib/documents/generateAct'

export async function POST(request: NextRequest) {
  try {
    const actData = await request.json()
    const doc = generateActPDF(actData)
    const pdfBuffer = doc.output('arraybuffer')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="act-${actData.shiftId}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
