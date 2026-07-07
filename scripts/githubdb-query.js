/**
 * GitHubDB SQL Executor
 * Executes SQL queries against a JSON database file
 */

const fs = require('fs');
const path = require('path');

function executeSql(dbData, sql) {
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  let lastResult = { ok: true };

  for (const stmt of statements) {
    lastResult = executeStatement(dbData, stmt);
    if (!lastResult.ok) return lastResult;
  }

  return lastResult;
}

function executeStatement(dbData, sql) {
  const upperSql = sql.toUpperCase().trim();

  if (upperSql.startsWith('INSERT INTO')) {
    return executeInsert(dbData, sql);
  }
  if (upperSql.startsWith('UPDATE')) {
    return executeUpdate(dbData, sql);
  }
  if (upperSql.startsWith('DELETE FROM')) {
    return executeDelete(dbData, sql);
  }
  if (upperSql.startsWith('SELECT')) {
    return executeSelect(dbData, sql);
  }

  return { ok: false, error: `Unsupported SQL: ${sql}` };
}

function executeInsert(dbData, sql) {
  const match = sql.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
  if (!match) return { ok: false, error: `Invalid INSERT: ${sql}` };

  const tableName = match[1];
  const columns = match[2].split(',').map(c => c.trim());
  const valuesRaw = match[3].split(',').map(v => v.trim());

  if (!dbData.tables[tableName]) {
    dbData.tables[tableName] = { columns: columns.map(c => ({ name: c, type: 'TEXT' })), rows: [] };
  }

  const values = valuesRaw.map(v => parseSqlValue(v));
  dbData.tables[tableName].rows.push(values);

  return { ok: true, result: { changes: 1 } };
}

function executeUpdate(dbData, sql) {
  const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
  if (!match) return { ok: false, error: `Invalid UPDATE: ${sql}` };

  const tableName = match[1];
  const setClause = match[2];
  const whereClause = match[3];

  if (!dbData.tables[tableName]) {
    return { ok: false, error: `Table '${tableName}' not found` };
  }

  const setParts = parseSetClause(setClause);
  const table = dbData.tables[tableName];
  let changes = 0;

  for (let i = 0; i < table.rows.length; i++) {
    if (whereClause && !matchWhere(table.columns, table.rows[i], whereClause)) continue;

    for (const [col, val] of Object.entries(setParts)) {
      const colIdx = table.columns.findIndex(c => c.name === col);
      if (colIdx >= 0) {
        table.rows[i][colIdx] = val;
      }
    }
    changes++;
  }

  return { ok: true, result: { changes } };
}

function executeDelete(dbData, sql) {
  const match = sql.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (!match) return { ok: false, error: `Invalid DELETE: ${sql}` };

  const tableName = match[1];
  const whereClause = match[2];

  if (!dbData.tables[tableName]) {
    return { ok: false, error: `Table '${tableName}' not found` };
  }

  const table = dbData.tables[tableName];
  const before = table.rows.length;

  if (whereClause) {
    table.rows = table.rows.filter(row => !matchWhere(table.columns, row, whereClause));
  } else {
    table.rows = [];
  }

  return { ok: true, result: { changes: before - table.rows.length } };
}

function executeSelect(dbData, sql) {
  const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if (!match) return { ok: false, error: `Invalid SELECT: ${sql}` };

  const columns = match[1] === '*' ? null : match[1].split(',').map(c => c.trim());
  const tableName = match[2];
  const whereClause = match[3];

  if (!dbData.tables[tableName]) {
    return { ok: false, error: `Table '${tableName}' not found` };
  }

  const table = dbData.tables[tableName];
  let rows = table.rows;

  if (whereClause) {
    rows = rows.filter(row => matchWhere(table.columns, row, whereClause));
  }

  const objects = rows.map(row => {
    const obj = {};
    table.columns.forEach((col, i) => {
      if (!columns || columns.includes(col.name)) {
        obj[col.name] = row[i];
      }
    });
    return obj;
  });

  return { ok: true, result: { objects } };
}

function parseSetClause(clause) {
  const parts = {};
  const assignments = clause.split(',').map(s => s.trim());

  for (const assign of assignments) {
    const [col, ...valParts] = assign.split('=');
    const val = valParts.join('=').trim();
    parts[col.trim()] = parseSqlValue(val);
  }

  return parts;
}

function matchWhere(columns, row, whereClause) {
  const conditions = whereClause.split(/AND/i).map(c => c.trim());

  for (const cond of conditions) {
    const [col, op, valRaw] = cond.split(/\s*(=|!=|<>|>=|<=|>|<)\s*/);
    const colIdx = columns.findIndex(c => c.name === col.trim());
    if (colIdx < 0) return false;

    const rowVal = row[colIdx];
    const val = parseSqlValue(valRaw);

    switch (op) {
      case '=': if (rowVal != val) return false; break;
      case '!=': case '<>': if (rowVal == val) return false; break;
      case '>=': if (rowVal < val) return false; break;
      case '<=': if (rowVal > val) return false; break;
      case '>': if (rowVal <= val) return false; break;
      case '<': if (rowVal >= val) return false; break;
    }
  }

  return true;
}

function parseSqlValue(val) {
  if (val === 'NULL') return null;
  if (val === 'TRUE') return true;
  if (val === 'FALSE') return false;
  if (val.startsWith("'") && val.endsWith("'")) {
    return val.slice(1, -1).replace(/''/g, "'");
  }
  const num = Number(val);
  return isNaN(num) ? val : num;
}

// Main execution
const id = process.env.QUERY_ID;
const db = process.env.DB_NAME;
const sql = process.env.SQL;

const dbPath = path.join('data', `${db}.json`);
const resultPath = path.join('results', `${id}.json`);
fs.mkdirSync('results', { recursive: true });

let dbData;
try {
  dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (e) {
  const result = { ok: false, error: `Database '${db}' not found: ${e.message}` };
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  process.exit(1);
}

try {
  const result = executeSql(dbData, sql);
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2));
  console.log('Query executed successfully');
} catch (e) {
  console.error(`SQL error: ${e.message}`);
  fs.writeFileSync(resultPath, JSON.stringify({ ok: false, error: e.message }, null, 2));
  process.exit(1);
}
