// ============================================================================
// CODE.GS - BACKEND GOOGLE APPS SCRIPT
// ID Sheet Spreadsheet: 1lz5CSiOdqrJW0YkouWZ8-YvRC4m0J7cauENr-4tzPyQ
// Simulasi Olimpiade Bahasa Rusia di Moskow
// ============================================================================

const SHEET_ID = '1lz5CSiOdqrJW0YkouWZ8-YvRC4m0J7cauENr-4tzPyQ';

function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Simulasi Olimpiade Bahasa Rusia di Moskow')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return ContentService.createTextOutput("Backend Google Apps Script Simulasi Olimpiade Bahasa Rusia di Moskow Aktif.")
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doPost(e) {
  var response = { status: 'success' };
  try {
    var params = JSON.parse(e.postData.contents);
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName('Scoreboard') || spreadsheet.getSheets()[0];

    if (params.action === 'addScore') {
      sheet.appendRow([
        params.data.peringkat || "-",
        params.data.namaLengkap || "-",
        params.data.gradeRusia || "-",
        params.data.username || "-",
        params.data.benar || 0,
        params.data.totalSoal || 0,
        params.data.waktu || 0,
        params.data.status || "Selesai",
        params.data.tanggalSelesai || new Date().toLocaleString('id-ID')
      ]);
    } else if (params.action === 'deleteRow') {
      sheet.deleteRow(params.rowIndex);
    } else if (params.action === 'resetBoard') {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
    }
  } catch (err) {
    response.status = 'error';
    response.message = err.toString();
  }
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
