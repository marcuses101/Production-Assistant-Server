function assignIds(array) {
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

function convertDatesArray(array){
  return array.map(entry=>convertDate(entry));
}

module.exports = { assignIds, snakeToCamel, camelCaseKeys, convertDate, convertDatesArray };
