function handleDownload(data) {
  return new Uint8Array(decompress(data));
}

function displayParsingError() {
  alert("There was a problem parsing the file. This is likely because the file is either already decompressed or is not a valid SAV/BIQ/BIX/BIC file. You can try again with a different file.");
}
