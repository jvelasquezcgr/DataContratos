// js/data/soql.js - Consultas SOQL-like
export function buildQuery(options = {}) {
  const { select, from, where, orderBy, limit } = options;
  
  let query = `SELECT ${select || '*'} FROM ${from}`;
  
  if (where) {
    query += ` WHERE ${where}`;
  }
  
  if (orderBy) {
    query += ` ORDER BY ${orderBy}`;
  }
  
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  
  return query;
}

export function parseQuery(query) {
  // Parser simple de SOQL-like
  const match = query.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?/i);
  
  if (!match) {
    throw new Error('Consulta SOQL inválida');
  }
  
  return {
    select: match[1],
    from: match[2],
    where: match[3] || null,
    orderBy: match[4] || null,
    limit: match[5] ? parseInt(match[5], 10) : null,
  };
}
