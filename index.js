const json2csv = require("json2csv");
const fs = require("fs");

// Read data from JSON file
const jsonData = fs.readFileSync("input.json", "utf8");
const data = JSON.parse(jsonData);

// Helper function to flatten nested objects
const flattenObject = (obj, parentKey = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
};

// Flatten the entire data structure
const flattenedData = data.map((item) => {
  // Flatten the "Header" object
  const flattenedHeader = flattenObject(item.Header);

  // Flatten the "Cover", "Cover Insert", "Cover Adjustment Ring", "Frame", "Chimney", "Cone", "Wall", "Bench", "Channel", and "Recommendations" objects
  const flattenedCover = flattenObject(item.Cover);
  const flattenedCoverInsert = flattenObject(item["Cover Insert"]);
  const flattenedCoverAdjustmentRing = flattenObject(item["Cover Adjustment Ring"]);
  const flattenedFrame = flattenObject(item.Frame);
  const flattenedChimney = flattenObject(item.Chimney);
  const flattenedCone = flattenObject(item.Cone);
  const flattenedWall = flattenObject(item.Wall);
  const flattenedBench = flattenObject(item.Bench);
  const flattenedChannel = flattenObject(item.Channel);
  const flattenedRecommendations = flattenObject(item.Recommendations);

  // Flatten the "Pipe Connections" array and create new keys
  const flattenedConnections = item["Pipe Connections"].map((connection, index) => {
    return flattenObject(connection, `${index + 1}`);
  });

  // Combine all flattened data
  const flattenedItem = {
    ...flattenedHeader,
    ...flattenedCover,
    ...flattenedCoverInsert,
    ...flattenedCoverAdjustmentRing,
    ...flattenedFrame,
    ...flattenedChimney,
    ...flattenedCone,
    ...flattenedWall,
    ...flattenedBench,
    ...flattenedChannel,
    ...flattenedRecommendations,
    ...Object.assign({}, ...flattenedConnections),
  };

  return flattenedItem;
});

// Convert the flattened data to CSV
const csv = json2csv.parse(flattenedData);

// Write the CSV to a file
fs.writeFileSync("output.csv", csv, { encoding: "utf8" });

console.log("CSV file has been created!");
