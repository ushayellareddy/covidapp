const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let database = null;
const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API1
const ConvertStateDbObjectAPI1 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};
app.get("/states/", async (request, response) => {
  const getStatesListQuery = `SELECT * FROM state;`;
  const statesList = await database.all(getStatesListQuery);
  response.send(
    statesList.map((eachState) => ConvertStateDbObjectAPI1(eachState))
  );
});

//API2
add.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStatesListByQuery = `
    SELECT * FROM state WHERE state_id = ${stateId};`;
  const statesListById = await database.get(getStatesListByQuery);
  response.send(ConvertStateDbObjectAPI1(statesListById));
});

//API3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createDistrictQuery = `
    INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES('${districtName}',${stateId},${cases},${cured}.${active},${deaths});`;
  const createDistrict = await database.run(createDistrictQuery);
  response.send("District Successfully Added");
});

//API4
const ConvertDbObjectAPI4 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    SELECT * FROM district WHERE district_id = ${districtId};`;
  const districtId = await database.get(getDistrictIdQuery);
  response.send(ConvertDbObjectAPI4(districtId));
});

//ApI5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM district WHERE district_id = ${districtId};`;
  const deleteDistrict = await database.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateDistrictQuery = `
    UPDATE district SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths} WHERE district_id = ${districtId};`;
  const updateDistrict = await database.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateByIdStatsQuery = `
    SELECT sum(cases) AS totalCases, sum(cured) AS totalCured, sum(active) AS 
    totalActive, sum(deaths) AS totalDeaths FROM district WHERE state_id = ${stateId};`;
  const getStateById = await database.get(getStateByIdStatsQuery);
  response.send(getStateById);
});

//API8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
    SELECT state_id FROM district WHERE district_id = ${districtId};`;
  const getDistrictId = await database.get(getDistrictIdQuery);
  const getStateNameQuery = `
    SELECT state_name AS stateName FROM state WHERE state_id = ${getDistrictId.state_id}`;
  const getStateName = await database.get(getStateNameQuery);
  response.send(getStateName);
});
module.exports = app;
