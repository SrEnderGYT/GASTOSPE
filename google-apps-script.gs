/**
 * Deploy como Web App (POST) y pegar la URL en la app Angular.
 * Este script agrega filas en una hoja "Movimientos".
 */
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Movimientos') || spreadsheet.insertSheet('Movimientos');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['id', 'fecha', 'tipo', 'monto', 'categoria', 'nota', 'fuente', 'synced']);
  }

  payload.records.forEach((record) => {
    sheet.appendRow([
      record.id,
      record.createdAt,
      record.movementType,
      record.amount,
      record.category,
      record.note,
      record.source,
      true
    ]);
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
