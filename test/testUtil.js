function assignIds(array) {

  if (typeof array.map !== 'function') {
    throw new Error(`TypeError: argument is ${typeof array}. Expected array`);
  }

  return array.map((entry, index) => ({ ...entry, id: index + 1 }));
}

function snakeToCamel(string) {
  return string.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", "")
  );
}

function camelCaseKeys(obj) {
  const newObj = {};
  for (let [key, value] of Object.entries(obj)) {
    newObj[snakeToCamel(key)] = value;
  }
  return newObj;
}

function convertDate(obj, key="date") {
  return { ...obj, [key]: new Date(obj[key]).toISOString().split("T")[0] };
}

function convertDatesArray(array, key){

  if (typeof array.map !== 'function') {
    throw new Error(`TypeError: argument is ${typeof array}. Expected array`);
  }

  return array.map(entry=>convertDate(entry,key));
}

module.exports = { assignIds, snakeToCamel, camelCaseKeys, convertDate, convertDatesArray };
