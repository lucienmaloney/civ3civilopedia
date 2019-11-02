function handleDownload(data) {
  let res = new Uint8Array(decompress(data));

  const tilearr = [0x54, 0x49, 0x4c, 0x45]; // Hex codes spell out "TILE"
  let index = res.indexOf(tilearr[0]);

  // Find first instance of "TILE"
  // This would be a lot easier and more readable with node buffers
  while (!(res[index + 1] === tilearr[1] && res[index + 2] === tilearr[2] && res[index + 3] === tilearr[3])) {
    index = res.indexOf(tilearr[0], index + 1);
  }

  // For each "TILE"
  while (res[index] === tilearr[0]) {
    res[index + 84] = res[index + 84] | 2; // Set fog of war of player 1 to 1
    res[index + 88] = res[index + 88] | 2; // Set line of sight of player to 1
    index += 212;
  }

  res[index - 212 + 84] = 0xff; // Set the final tile's (bottomright-most's) fog of war to 1 for all players to counteract cheating

  return res;
}

function displayParsingError() {
  alert("There was a problem parsing the file. This is likely because the file is either already decompressed or is not a valid SAV file. You can try again with a different file.");
}
