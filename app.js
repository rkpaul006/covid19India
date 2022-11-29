const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "covid19India.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertObj = (dbObject2) => {
  return {
    stateId: dbObject2.state_id,
    stateName: dbObject2.state_name,
    population: dbObject2.population,
  };
};

const convertObj4 = (dbObject2) => {
  return {
    districtId: dbObject2.district_id,
    districtName: dbObject2.district_name,
    stateId: dbObject2.state_id,
    cases: dbObject2.cases,
    cured: dbObject2.cured,
    active: dbObject2.active,
    deaths: dbObject2.deaths,
  };
};

const convertObj7 = (dbObject2) => {
  return {
    totalCases: dbObject2.total_cases,
    totalCured: dbObject2.total_cured,
    totalActive: dbObject2.total_active,
    totalDeaths: dbObject2.total_deaths,
  };
};

const convertObj8 = (dbObject2) => {
  return {
    stateName: dbObject2.state_name,
  };
};
//1//
app.get("/states/", async (request, response) => {
  const getStates = `SELECT * FROM state;`;
  const states = await db.all(getStates);
  response.send(states.map((each) => convertObj(each)));
});
//2//
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const getStates = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const states = await db.get(getStates);
  response.send(convertObj(states));
});
//4//
app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const getDistricts = `SELECT * FROM district 
  WHERE district_id = ${districtId};`;
  const district = await db.get(getDistricts);
  response.send(convertObj4(district));
});
//7//
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const getStates = `SELECT * FROM district WHERE
   state_id = ${stateId};`;
  const states = await db.all(getStates);
  response.send(convertObj7(states));
});

//8//
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStates = `SELECT * FROM state INNER JOIN 
  district ON state_id = district.state_id
  WHERE district.district_id = ${districtId};`;
  const states = await db.get(getStates);
  response.send(convertObj8(states));
});
//5//
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteState = `DELETE FROM district
   WHERE district_id = ${districtId};`;
  const result = await db.get(deleteState);
  response.send("District Removed");
});
//3//
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const insertDistrictDetails = `
    INSERT INTO
     district (district_name, state_id, cases, cured, active, deaths)
    VALUES
    (
     "${districtName}",
     "${stateId}",
     "${cases}",
     "${cured}",
     "${active}",
     "${deaths}"
     );`;
  const districtAddition = await db.run(insertDistrictDetails);
  response.send("District Successfully Added");
});
//6//
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const {
    district_name,
    state_id,
    cases,
    cured,
    active,
    deaths,
  } = request.body;
  const updateDistrictDetails = `
    UPDATE district SET
    district_name = "${district_name}",
    state_id = "${state_id}",
    cases = "${cases}",
    cured = "${cured}",
    active = "${active}",
    deaths = "${deaths}"
    WHERE
     district_id = ${districtId};`;
  const updateDistrict = await db.run(updateDistrictDetails);
  response.send("District Details Updated");
});

module.exports = app;
