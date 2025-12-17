/**
 * Swiss Ephemeris REST API Server
 * Custom API for Google Apps Script integration
 * Version 1.0.1
 */

const express = require('express');
const cors = require('cors');
const swisseph = require('sweph');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set ephemeris path to the package's built-in data
swisseph.swe_set_ephe_path(__dirname + '/node_modules/sweph/ephe');

// ===== CONSTANTS =====
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANETS = {
  sun: swisseph.SE_SUN,
  moon: swisseph.SE_MOON,
  mercury: swisseph.SE_MERCURY,
  venus: swisseph.SE_VENUS,
  mars: swisseph.SE_MARS,
  jupiter: swisseph.SE_JUPITER,
  saturn: swisseph.SE_SATURN,
  uranus: swisseph.SE_URANUS,
  neptune: swisseph.SE_NEPTUNE,
  pluto: swisseph.SE_PLUTO,
  true_node: swisseph.SE_TRUE_NODE,
  chiron: swisseph.SE_CHIRON,
  ceres: swisseph.SE_CERES,
  pallas: swisseph.SE_PALLAS,
  juno: swisseph.SE_JUNO,
  vesta: swisseph.SE_VESTA
};

// House system codes
const HOUSE_SYSTEMS = {
  placidus: 'P',
  whole_sign: 'W',
  koch: 'K',
  equal: 'E',
  campanus: 'C'
};

// ===== HELPER FUNCTIONS =====

function lonToSignDegree(lon) {
  const lon360 = ((lon % 360) + 360) % 360;
  const signIndex = Math.floor(lon360 / 30);
  const degree = lon360 - (signIndex * 30);
  return {
    sign: SIGNS[signIndex],
    degree: degree,
    full_degree: lon360
  };
}

function calculateJulianDay(year, month, day, hour, minute) {
  const decimalHour = hour + minute / 60.0;
  return swisseph.swe_julday(year, month, day, decimalHour, swisseph.SE_GREG_CAL);
}

// ===== API ENDPOINTS =====

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Swiss Ephemeris API',
    version: '1.0.0',
    endpoints: {
      planets: '/api/planets',
      houses: '/api/houses',
      aspects: '/api/aspects'
    }
  });
});

// Get planetary positions
app.post('/api/planets', (req, res) => {
  try {
    const { year, month, day, hour, min, lat, lon } = req.body;

    // Validation
    if (!year || !month || !day || hour === undefined || min === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: year, month, day, hour, min'
      });
    }

    // Calculate Julian Day
    const jd = calculateJulianDay(year, month, day, hour, min);

    // Calculate all planets
    const result = {};

    for (const [name, planetId] of Object.entries(PLANETS)) {
      const planet = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);

      if (planet.error) {
        console.error(`Error calculating ${name}:`, planet.error);
        continue;
      }

      const longitude = planet.longitude;
      const speed = planet.longitudeSpeed;
      const signDegree = lonToSignDegree(longitude);

      result[name] = {
        longitude: longitude,
        full_degree: signDegree.full_degree,
        normDegree: signDegree.full_degree,
        sign: signDegree.sign,
        degree: signDegree.degree,
        speed: speed,
        isRetro: speed < 0 ? 'true' : 'false'
      };
    }

    res.json(result);

  } catch (error) {
    console.error('Error in /api/planets:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get house cusps
app.post('/api/houses', (req, res) => {
  try {
    const { year, month, day, hour, min, lat, lon, house_type = 'placidus' } = req.body;

    // Validation
    if (!year || !month || !day || hour === undefined || min === undefined || lat === undefined || lon === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: year, month, day, hour, min, lat, lon'
      });
    }

    // Calculate Julian Day
    const jd = calculateJulianDay(year, month, day, hour, min);

    // Get house system code
    const houseSystem = HOUSE_SYSTEMS[house_type] || 'P';

    // Calculate houses
    const houses = swisseph.swe_houses(jd, lat, lon, houseSystem);

    if (houses.error) {
      return res.status(500).json({
        error: 'Failed to calculate houses',
        message: houses.error
      });
    }

    // Format response
    const result = {
      ascendant: {
        longitude: houses.ascendant,
        full_degree: ((houses.ascendant % 360) + 360) % 360,
        ...lonToSignDegree(houses.ascendant)
      },
      midheaven: {
        longitude: houses.mc,
        full_degree: ((houses.mc % 360) + 360) % 360,
        ...lonToSignDegree(houses.mc)
      }
    };

    // Add all 12 houses
    for (let i = 0; i < 12; i++) {
      const houseLon = houses.house[i];
      result[`house${i + 1}`] = {
        longitude: houseLon,
        full_degree: ((houseLon % 360) + 360) % 360,
        ...lonToSignDegree(houseLon)
      };
    }

    res.json(result);

  } catch (error) {
    console.error('Error in /api/houses:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Combined chart data (planets + houses)
app.post('/api/chart', (req, res) => {
  try {
    const { year, month, day, hour, min, lat, lon, house_type = 'placidus' } = req.body;

    // Validation
    if (!year || !month || !day || hour === undefined || min === undefined || lat === undefined || lon === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: year, month, day, hour, min, lat, lon'
      });
    }

    // Calculate Julian Day
    const jd = calculateJulianDay(year, month, day, hour, min);

    // Get planets
    const planets = {};
    for (const [name, planetId] of Object.entries(PLANETS)) {
      const planet = swisseph.swe_calc_ut(jd, planetId, swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED);

      if (!planet.error) {
        const signDegree = lonToSignDegree(planet.longitude);
        planets[name] = {
          longitude: planet.longitude,
          full_degree: signDegree.full_degree,
          sign: signDegree.sign,
          degree: signDegree.degree,
          speed: planet.longitudeSpeed,
          isRetro: planet.longitudeSpeed < 0 ? 'true' : 'false'
        };
      }
    }

    // Get houses
    const houseSystem = HOUSE_SYSTEMS[house_type] || 'P';
    const houses = swisseph.swe_houses(jd, lat, lon, houseSystem);

    const housesData = {
      ascendant: {
        longitude: houses.ascendant,
        full_degree: ((houses.ascendant % 360) + 360) % 360,
        ...lonToSignDegree(houses.ascendant)
      },
      midheaven: {
        longitude: houses.mc,
        full_degree: ((houses.mc % 360) + 360) % 360,
        ...lonToSignDegree(houses.mc)
      }
    };

    for (let i = 0; i < 12; i++) {
      const houseLon = houses.house[i];
      housesData[`house${i + 1}`] = {
        longitude: houseLon,
        full_degree: ((houseLon % 360) + 360) % 360,
        ...lonToSignDegree(houseLon)
      };
    }

    res.json({
      planets: planets,
      houses: housesData
    });

  } catch (error) {
    console.error('Error in /api/chart:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌟 Swiss Ephemeris API Server running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST /api/planets - Get planetary positions`);
  console.log(`  POST /api/houses  - Get house cusps`);
  console.log(`  POST /api/chart   - Get complete chart data`);
});

module.exports = app;
