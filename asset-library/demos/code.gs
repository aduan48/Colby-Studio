function doOptions(e) {
  // Return a clean text output for browser pre-flights without breaking the service
  return ContentService.createTextOutput("");
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    console.log("Web App triggered via POST request.");
    
    // 1. Parse the incoming form data
    console.log("Parsed data successfully received.");
    
    // 2. Open the sheet and get headers
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var targetSheet = ss.getSheetByName("Main");

    if (!targetSheet) {
      throw new Error("Could not find a sheet named 'Form Submissions'. Please check your sheet tab names.");
    }

    var headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    
    // 3. Map the data to the correct columns
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var headerName = headers[i];
      newRow.push(data[headerName] !== undefined ? data[headerName] : "");
    }
    
    // 4. Append to the spreadsheet
    targetSheet.appendRow(newRow);
    console.log("Row successfully appended to the spreadsheet.");
  
    
    // 7. FIXED: Return success response cleanly without illegal .appendHeader functions
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    console.error("Execution failed inside doPost: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}
