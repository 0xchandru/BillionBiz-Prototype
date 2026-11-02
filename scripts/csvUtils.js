const fs = require('fs');

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i+1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
      currentRow = [];
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }
  return rows;
}

function stringifyCSV(rows) {
  return rows.map(r => r.map(cell => {
    if (cell === null || cell === undefined) cell = '';
    cell = String(cell);
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
      return '"' + cell.replace(/"/g, '""') + '"';
    }
    return cell;
  }).join(',')).join('\n');
}

module.exports = { parseCSV, stringifyCSV };

if (require.main === module) {
  const content = fs.readFileSync('management/requirements.csv', 'utf8');
  const rows = parseCSV(content);
  console.log('Header:', rows[0]);
  const genericRows = rows.slice(1).filter(r => r[1] && r[1].toLowerCase().includes('detailed requirement'));
  console.log('Generic rows count:', genericRows.length);
  console.log('Generic rows sample:', JSON.stringify(genericRows.slice(0, 3), null, 2));
}
