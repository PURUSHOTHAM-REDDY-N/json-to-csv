var unirest = require('unirest');
// var fs = require('fs');
const json2csv = require("json2csv");
const fs = require("fs");
// var fsExtra = require('fs-extra');
var rimraf = require('rimraf');
var http = require('http');
var request = require('requestretry');
var process = require('process');

// var moment = require('moment');
// var async = require('async');
// var config = require('./config/config-smoke');

var stagingCookie = 'XXX';
var productionCookie = 'PipeTech:session=s%3APD21d5HLsb-g_xJAOHy3P5Fk8ihsl_DgrsBs9_XhbCt_QD6PVGFzOHzaYbvUHMcs.5T8%2FjLG7egN4mKFnnxj0stoU4V3n5ZgWifh4ti7poos';
var projectEndpoint = "http://pipetechcloud.com/api/projects/";
var reportEndpoint = "https://pipetechcloud.com/api/reports/";
var modelEndpoint = "http://pipetechcloud.com/api/models/";

var dbConnection;

var MH_Inspections = [];
var MH_InspectionsColumns;


// var insertConnections = require('./insert-connections');
// var insertObservations = require('./insert-observations');
// var insertDefects = require('./insert-defects');

// config
var reportOnly = false;
var noReports = true;

//set this to 0, or to the largest number in the table
var smokeI = 0;
var imgI = {};

var getInspections = function (projectId, singleInspectionId, outputLocation) {



    unirest.get(projectEndpoint + projectId+ "/inspections")
        .headers({
            'Accept': 'application/json',
            'Cookie': productionCookie
        })
        .end(function (response) {
            var inspections = response.body.page;

            inspections = inspections.map(function(obj) {
                var newData = {};
                newData['Inspection ID'] = obj.id; // Set 'Inspection ID' as the first key
            
                for (var key in obj.data) {
                    if (obj.data.hasOwnProperty(key)) {
                        newData[key] = obj.data[key]; // Add the remaining data properties
                    }
                }
                return newData;
            });

            // console.log(inspections);

            const parsedInspection = inspections;


            // Flatten the entire data structure
const flattenedData = parsedInspection.map((item) => {
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

  console.log(flattenedData)

  // Convert the flattened data to CSV
const csv = json2csv.parse(flattenedData,{ fields:['Surveyed By','Certificate Number','Owner','Customer','Drainage Area','Date','Time','Street','City','Location Details','Manhole Number','Top of Frame to Invert','Top of Frame to Grade','MH Use','Purpose','Pre-Cleaning','Date Cleaned','Weather','Location Code'] });

// Write the CSV to a file
fs.writeFileSync(`${projectId}.csv`, csv, { encoding: "utf8" });




        // console.log(JSON.stringify(inspections));

    });
};



if (process.argv[3] != "all") {
    try {
        var singleInspectionsArray = process.argv[3].split(',');
    }
    catch (e) {
    }
    var singleInspection = (singleInspectionsArray) ? singleInspectionsArray : null;
}
else {
    var singleInspection = null;
}

getInspections(parseInt(process.argv[2]), singleInspection, process.argv[4]);

// rename ./template/template.accdb to /exports/projectname/projectname.ptl


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

const flattenObject = (obj, parentKey = "") => {
    if (!obj || typeof obj !== "object") {
      return {};
    }
  
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
