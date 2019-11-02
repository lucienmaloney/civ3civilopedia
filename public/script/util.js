function handleFile() {
  const file = document.getElementById("upload").files[0];
  document.getElementById("download").disabled = false;
}

function downloadFile() {
  const file = document.getElementById("upload").files[0];

  if (!file) {
    alert("Please select a file first before downloading.")
    return;
  }

  const reader = new FileReader();
  reader.readAsArrayBuffer(file);

  reader.onerror = function() {
    alert('There was an error while reading the file. Try refreshing the page and reuploading.');
  }

  reader.onload = function(event) {
    const result = event.target.result;
    try {
      const newfile = handleDownload(result);
      downloadBlob(newfile, file.name, 'application/octet-stream');
    } catch(e) {
      displayParsingError();
      return;
    }
  }
}
