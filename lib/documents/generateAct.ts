import jsPDF from 'jspdf'

export interface ActData {
  shiftId: string
  shiftTitle: string
  date: string
  clientName: string
  workerName: string
  amount: number
  platformFee: number
  workDescription: string
}

export function generateActPDF(data: ActData): jsPDF {
  const doc = new jsPDF()

  // Заголовок
  doc.setFontSize(16)
  doc.text('АКТ ВЫПОЛНЕННЫХ РАБОТ', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`№ ${data.shiftId}`, 105, 30, { align: 'center' })
  doc.text(`от ${data.date}`, 105, 36, { align: 'center' })

  // Стороны
  doc.setFontSize(12)
  doc.text('Заказчик:', 20, 50)
  doc.setFontSize(10)
  doc.text(data.clientName, 20, 56)

  doc.setFontSize(12)
  doc.text('Исполнитель:', 20, 70)
  doc.setFontSize(10)
  doc.text(data.workerName, 20, 76)

  // Описание работ
  doc.setFontSize(12)
  doc.text('Описание работ:', 20, 90)
  doc.setFontSize(10)
  const lines = doc.splitTextToSize(data.workDescription, 170)
  doc.text(lines, 20, 96)

  // Сумма
  doc.setFontSize(12)
  doc.text('Сумма к оплате:', 20, 120)
  doc.setFontSize(14)
  doc.text(`${data.amount.toLocaleString('ru-RU')} ₽`, 20, 128)

  doc.setFontSize(10)
  doc.text(`Комиссия платформы: ${data.platformFee.toLocaleString('ru-RU')} ₽`, 20, 136)

  // Подписи
  doc.setFontSize(10)
  doc.text('Заказчик: _________________', 20, 200)
  doc.text('Исполнитель: _________________', 20, 210)

  // Footer
  doc.setFontSize(8)
  doc.text('Создано на платформе Шеф-Монтаж', 105, 280, { align: 'center' })

  return doc
}
