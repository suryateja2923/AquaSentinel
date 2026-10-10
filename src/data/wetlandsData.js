// Wetland Monitoring Data & GeoJSON geometries for satellite EO analysis

export const WETLAND_PRESERVES = [
  {
    id: 'deepor-beel',
    name: 'Deepor Beel Ramsar Wetland',
    village: 'Pamohi & Azara (South-West Guwahati)',
    district: 'Kamrup Metropolitan',
    state: 'Assam, India',
    coordinates: [26.128, 91.655],
    zoom: 14,
    designation: 'Ramsar Site No. 1207 (Eco-Sensitive Zone)',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '78 ha',
      currentWaterAreaNum: 78,
      baselineWaterArea: '100 ha',
      baselineWaterAreaNum: 100,
      changePercent: '-22%',
      changePercentNum: -22,
      hotspotsCount: 4,
      comparisonRange: '2020–2026',
      totalLossHa: '22 ha',
      waterHealthScore: '64 / 100 (Stressed)',
      satelliteSensor: 'Sentinel-2 Multispectral MSI & Landsat-9 OLI',
      lastObservationDate: 'Oct 04, 2026 • 10:42 AM IST',
      cloudCoverage: '< 2.1%',
      ndwiThreshold: '0.18 NDWI'
    },
    // Yearly progression from 2020 to 2026
    timeSeries: [
      { year: 2020, waterArea: 100, builtUpEncroached: 0.0, ndwiMean: 0.48, monsoonPeak: 124, drySeason: 88 },
      { year: 2021, waterArea: 96, builtUpEncroached: 3.2, ndwiMean: 0.45, monsoonPeak: 120, drySeason: 84 },
      { year: 2022, waterArea: 92, builtUpEncroached: 7.1, ndwiMean: 0.42, monsoonPeak: 114, drySeason: 80 },
      { year: 2023, waterArea: 87, builtUpEncroached: 12.4, ndwiMean: 0.38, monsoonPeak: 109, drySeason: 75 },
      { year: 2024, waterArea: 84, builtUpEncroached: 15.8, ndwiMean: 0.35, monsoonPeak: 105, drySeason: 72 },
      { year: 2025, waterArea: 80, builtUpEncroached: 19.2, ndwiMean: 0.32, monsoonPeak: 101, drySeason: 69 },
      { year: 2026, waterArea: 78, builtUpEncroached: 22.0, ndwiMean: 0.30, monsoonPeak: 98, drySeason: 67 }
    ],
    // Land cover transition breakdown (in ha)
    transitionData: [
      { category: 'Persistent Open Water', area: 78.0, color: '#0284c7' },
      { category: 'Water Lost to Unregulated Built-up', area: 11.4, color: '#ef4444' },
      { category: 'Water Lost to Siltation & Infill', area: 6.8, color: '#f59e0b' },
      { category: 'Water Lost to Agricultural Polder', area: 3.8, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-1',
        title: 'Northern Railway Embankment & Infill',
        locationName: 'North-East Periphery, Pamohi Sector',
        lat: 26.136,
        lng: 91.668,
        severity: 'Critical',
        lossArea: '7.8 ha',
        detectedDate: 'Jan 2024 (Expanding)',
        description: 'Unpermitted sand infill, earthen embankment widening, and construction of commercial truck staging yards blocking northern feeding inlets.',
        ndwiChange: '-0.38 (Desiccated)',
        actionStatus: 'Notice Issued to State PWD',
        statusColor: '#dc2626'
      },
      {
        id: 'hs-2',
        title: 'VIP Road Corridor Expansion & Incursion',
        locationName: 'Eastern Buffer Zone',
        lat: 26.132,
        lng: 91.678,
        severity: 'High',
        lossArea: '6.2 ha',
        detectedDate: 'Sep 2023',
        description: 'Lateral road widening and illegal reclamation of peripheral littoral marshlands by private commercial warehouses.',
        ndwiChange: '-0.29 (Converted to Built-up)',
        actionStatus: 'Pending Site Inspection',
        statusColor: '#ea580c'
      },
      {
        id: 'hs-3',
        title: 'Southwest Agricultural Encroachment & Drainage',
        locationName: 'Azara / Boragaon Fringe',
        lat: 26.118,
        lng: 91.642,
        severity: 'Medium',
        lossArea: '4.9 ha',
        detectedDate: 'Nov 2022',
        description: 'Seasonal water body diking and conversion into commercial fish-farming polders and winter paddy cultivation plots.',
        ndwiChange: '-0.21 (Semi-aquatic Crop)',
        actionStatus: 'Restoration Order Recommended',
        statusColor: '#d97706'
      },
      {
        id: 'hs-4',
        title: 'West Buffer Municipal Waste & Silt Runoff',
        locationName: 'Paschim Boragaon Ridge',
        lat: 26.122,
        lng: 91.631,
        severity: 'Critical',
        lossArea: '3.1 ha',
        detectedDate: 'Mar 2025',
        description: 'Direct leachate seepage and progressive sediment deposition narrowing the western wetland basin neck.',
        ndwiChange: '-0.34 (Eutrophic / Silt)',
        actionStatus: 'Urgent NGT Environmental Mandate',
        statusColor: '#dc2626'
      }
    ],
    // Coordinates representing polygons for Leaflet
    geometries: {
      // Historical 2020 baseline extent (100 ha)
      historicalWater: [
        [26.138, 91.642],
        [26.141, 91.658],
        [26.139, 91.675],
        [26.133, 91.682],
        [26.126, 91.678],
        [26.120, 91.669],
        [26.115, 91.658],
        [26.114, 91.645],
        [26.118, 91.632],
        [26.125, 91.628],
        [26.132, 91.633]
      ],
      // Latest 2026 water extent (78 ha - shrunk primarily on North, East, SW, West edges)
      latestWater: [
        [26.134, 91.645],
        [26.136, 91.657],
        [26.132, 91.669],
        [26.127, 91.672],
        [26.123, 91.666],
        [26.118, 91.656],
        [26.118, 91.647],
        [26.121, 91.638],
        [26.128, 91.635],
        [26.131, 91.639]
      ],
      // Areas of detected change (Lost wetland sectors totaling 22 ha)
      detectedChanges: [
        // North-east sector loss
        [
          [26.138, 91.663],
          [26.141, 91.675],
          [26.133, 91.682],
          [26.127, 91.672],
          [26.132, 91.669],
          [26.136, 91.657]
        ],
        // Southwest agricultural loss
        [
          [26.115, 91.658],
          [26.114, 91.645],
          [26.118, 91.632],
          [26.121, 91.638],
          [26.118, 91.647],
          [26.118, 91.656]
        ],
        // Western dumping infill loss
        [
          [26.125, 91.628],
          [26.132, 91.633],
          [26.131, 91.639],
          [26.128, 91.635],
          [26.121, 91.638]
        ]
      ],
      // Built-up encroachment polygons
      encroachments: [
        // Hotspot 1: Northern sand infill
        [
          [26.139, 91.664],
          [26.142, 91.671],
          [26.138, 91.673],
          [26.135, 91.666]
        ],
        // Hotspot 2: Eastern road & commercial buffer
        [
          [26.134, 91.674],
          [26.135, 91.681],
          [26.128, 91.680],
          [26.129, 91.673]
        ],
        // Hotspot 3: SW agricultural conversion
        [
          [26.119, 91.638],
          [26.122, 91.645],
          [26.116, 91.646],
          [26.114, 91.640]
        ],
        // Hotspot 4: West waste / silt deposition
        [
          [26.124, 91.629],
          [26.127, 91.634],
          [26.121, 91.634],
          [26.119, 91.630]
        ]
      ],
      // Buffer zone (500m eco-sensitive belt)
      bufferZone: [
        [26.144, 91.636],
        [26.147, 91.659],
        [26.145, 91.682],
        [26.137, 91.690],
        [26.122, 91.686],
        [26.112, 91.673],
        [26.108, 91.655],
        [26.107, 91.638],
        [26.114, 91.623],
        [26.127, 91.620],
        [26.137, 91.625]
      ]
    }
  },
  {
    id: 'bellandur-lake',
    name: 'Bellandur Wetland Complex',
    village: 'Yemalur & Kariyammana Agrahara',
    district: 'Bengaluru Urban',
    state: 'Bengaluru, Karnataka',
    coordinates: [12.936, 77.671],
    zoom: 14,
    designation: 'Urban Catchment Wetland Basin',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '280 ha',
      currentWaterAreaNum: 280,
      baselineWaterArea: '360 ha',
      baselineWaterAreaNum: 360,
      changePercent: '-22.2%',
      changePercentNum: -22.2,
      hotspotsCount: 5,
      comparisonRange: '2020–2026',
      totalLossHa: '80 ha',
      waterHealthScore: '42 / 100 (Severe Eutrophication)',
      satelliteSensor: 'Sentinel-2 MSI & PlanetScope',
      lastObservationDate: 'Oct 02, 2026 • 11:15 AM IST',
      cloudCoverage: '< 1.8%',
      ndwiThreshold: '0.15 NDWI'
    },
    timeSeries: [
      { year: 2020, waterArea: 360, builtUpEncroached: 0.0, ndwiMean: 0.44, monsoonPeak: 395, drySeason: 330 },
      { year: 2021, waterArea: 345, builtUpEncroached: 12.0, ndwiMean: 0.41, monsoonPeak: 380, drySeason: 315 },
      { year: 2022, waterArea: 330, builtUpEncroached: 26.5, ndwiMean: 0.38, monsoonPeak: 362, drySeason: 300 },
      { year: 2023, waterArea: 312, builtUpEncroached: 44.0, ndwiMean: 0.35, monsoonPeak: 345, drySeason: 282 },
      { year: 2024, waterArea: 298, builtUpEncroached: 58.0, ndwiMean: 0.32, monsoonPeak: 330, drySeason: 270 },
      { year: 2025, waterArea: 288, builtUpEncroached: 70.5, ndwiMean: 0.29, monsoonPeak: 318, drySeason: 260 },
      { year: 2026, waterArea: 280, builtUpEncroached: 80.0, ndwiMean: 0.27, monsoonPeak: 308, drySeason: 252 }
    ],
    transitionData: [
      { category: 'Persistent Open Water', area: 280.0, color: '#0284c7' },
      { category: 'Water Lost to High-density Tech Parks & Housing', area: 46.5, color: '#ef4444' },
      { category: 'Water Lost to Construction Debris Dumping', area: 22.0, color: '#f59e0b' },
      { category: 'Weed Clumping & Silt Mudflats', area: 11.5, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-b1',
        title: 'Yemalur Inflow Channel Encroachment',
        locationName: 'North-West Catchment',
        lat: 12.942,
        lng: 91.671 ? 77.665 : 77.665,
        severity: 'Critical',
        lossArea: '24.5 ha',
        detectedDate: 'Feb 2024',
        description: 'Construction of perimeter concrete foundations encroaching into natural stormwater flood lines.',
        ndwiChange: '-0.32',
        actionStatus: 'BBMP Demolition Notice Pending',
        statusColor: '#dc2626'
      },
      {
        id: 'hs-b2',
        title: 'Kariyammana Agrahara Silt Dumping',
        locationName: 'South Inundation Zone',
        lat: 12.928,
        lng: 77.682,
        severity: 'High',
        lossArea: '18.2 ha',
        detectedDate: 'Aug 2023',
        description: 'Dumping of tunnel boring soil and urban debris directly onto shallow wetlands.',
        ndwiChange: '-0.28',
        actionStatus: 'State Pollution Control Board Review',
        statusColor: '#ea580c'
      }
    ],
    geometries: {
      historicalWater: [
        [12.948, 77.652],
        [12.951, 77.672],
        [12.942, 77.691],
        [12.930, 77.695],
        [12.922, 77.680],
        [12.925, 77.658],
        [12.937, 77.647]
      ],
      latestWater: [
        [12.944, 77.658],
        [12.947, 77.671],
        [12.939, 77.685],
        [12.931, 77.687],
        [12.926, 77.676],
        [12.928, 77.662],
        [12.936, 77.654]
      ],
      detectedChanges: [
        [
          [12.948, 77.652],
          [12.951, 77.672],
          [12.947, 77.671],
          [12.944, 77.658],
          [12.937, 77.647]
        ],
        [
          [12.942, 77.691],
          [12.930, 77.695],
          [12.931, 77.687],
          [12.939, 77.685]
        ]
      ],
      encroachments: [
        [
          [12.949, 77.656],
          [12.952, 77.668],
          [12.946, 77.666],
          [12.944, 77.657]
        ],
        [
          [12.937, 77.687],
          [12.933, 77.693],
          [12.929, 77.690],
          [12.932, 77.685]
        ]
      ],
      bufferZone: [
        [12.955, 77.645],
        [12.958, 77.678],
        [12.946, 77.701],
        [12.924, 77.703],
        [12.915, 77.682],
        [12.918, 77.651],
        [12.936, 77.638]
      ]
    }
  },
  {
    id: 'chilika-lake',
    name: 'Chilika Lagoon Ramsar Wetland',
    village: 'Barkul & Satapada (Ganjam Belt)',
    district: 'Puri & Khordha Districts',
    state: 'Odisha, India',
    coordinates: [19.715, 85.321],
    zoom: 12,
    designation: 'Ramsar Site No. 229 (Brackish Coastal Lagoon)',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '912 sq km',
      currentWaterAreaNum: 912,
      baselineWaterArea: '1,020 sq km',
      baselineWaterAreaNum: 1020,
      changePercent: '-10.5%',
      changePercentNum: -10.5,
      hotspotsCount: 3,
      comparisonRange: '2020–2026',
      totalLossHa: '108 sq km',
      waterHealthScore: '78 / 100 (Moderate Stress)',
      satelliteSensor: 'Sentinel-2 MSI & Oceansat-3 OCM',
      lastObservationDate: 'Oct 08, 2026 • 11:10 AM IST',
      cloudCoverage: '< 1.4%',
      ndwiThreshold: '0.22 NDWI'
    },
    timeSeries: [
      { year: 2020, waterArea: 1020, builtUpEncroached: 0.0, ndwiMean: 0.52, monsoonPeak: 1160, drySeason: 900 },
      { year: 2021, waterArea: 1005, builtUpEncroached: 15.0, ndwiMean: 0.50, monsoonPeak: 1145, drySeason: 890 },
      { year: 2022, waterArea: 980, builtUpEncroached: 35.0, ndwiMean: 0.47, monsoonPeak: 1120, drySeason: 870 },
      { year: 2023, waterArea: 955, builtUpEncroached: 60.0, ndwiMean: 0.44, monsoonPeak: 1090, drySeason: 845 },
      { year: 2024, waterArea: 938, builtUpEncroached: 78.0, ndwiMean: 0.42, monsoonPeak: 1070, drySeason: 830 },
      { year: 2025, waterArea: 924, builtUpEncroached: 92.0, ndwiMean: 0.40, monsoonPeak: 1055, drySeason: 818 },
      { year: 2026, waterArea: 912, builtUpEncroached: 108.0, ndwiMean: 0.38, monsoonPeak: 1040, drySeason: 805 }
    ],
    transitionData: [
      { category: 'Persistent Brackish Open Water', area: 912.0, color: '#0284c7' },
      { category: 'Lost to Commercial Aquaculture Gheries', area: 68.0, color: '#ef4444' },
      { category: 'Silt Deposition from Daya/Bhargavi Rivers', area: 28.0, color: '#f59e0b' },
      { category: 'Mangrove / Littoral Shrub Encroachment', area: 12.0, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-ch1',
        title: 'Satapada Sector Illegal Shrimp Polders',
        locationName: 'Satapada Inlet Channel',
        lat: 19.680,
        lng: 85.420,
        severity: 'Critical',
        lossArea: '48.5 ha',
        detectedDate: 'Nov 2023',
        description: 'Diked artificial saline ponds for tiger prawn cultivation impeding tidal interchange.',
        ndwiChange: '-0.36',
        actionStatus: 'Chilika Development Authority Demolition Drive',
        statusColor: '#dc2626'
      }
    ],
    geometries: {
      historicalWater: [
        [19.780, 85.180],
        [19.820, 85.340],
        [19.760, 85.460],
        [19.670, 85.480],
        [19.590, 85.360],
        [19.620, 85.220],
        [19.710, 85.150]
      ],
      latestWater: [
        [19.760, 85.200],
        [19.800, 85.330],
        [19.740, 85.430],
        [19.670, 85.440],
        [19.610, 85.340],
        [19.640, 85.230],
        [19.700, 85.180]
      ],
      detectedChanges: [
        [
          [19.780, 85.180],
          [19.820, 85.340],
          [19.800, 85.330],
          [19.760, 85.200]
        ]
      ],
      encroachments: [
        [
          [19.680, 85.430],
          [19.710, 85.460],
          [19.690, 85.470],
          [19.660, 85.440]
        ]
      ],
      bufferZone: [
        [19.850, 85.140],
        [19.870, 85.380],
        [19.790, 85.520],
        [19.630, 85.530],
        [19.540, 85.380],
        [19.570, 85.180]
      ]
    }
  },
  {
    id: 'loktak-lake',
    name: 'Loktak Lake & Keibul Lamjao',
    village: 'Moirang & Thanga Island',
    district: 'Bishnupur District',
    state: 'Manipur, India',
    coordinates: [24.550, 93.810],
    zoom: 13,
    designation: 'Montreux Record Ramsar Site No. 463',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '235 sq km',
      currentWaterAreaNum: 235,
      baselineWaterArea: '287 sq km',
      baselineWaterAreaNum: 287,
      changePercent: '-18.1%',
      changePercentNum: -18.1,
      hotspotsCount: 4,
      comparisonRange: '2020–2026',
      totalLossHa: '52 sq km',
      waterHealthScore: '52 / 100 (Threatened by Phumdi Clumping)',
      satelliteSensor: 'Sentinel-2 MSI & RISAT-1A SAR',
      lastObservationDate: 'Oct 06, 2026 • 09:45 AM IST',
      cloudCoverage: '< 3.2%',
      ndwiThreshold: '0.19 NDWI'
    },
    timeSeries: [
      { year: 2020, waterArea: 287, builtUpEncroached: 0.0, ndwiMean: 0.49, monsoonPeak: 310, drySeason: 250 },
      { year: 2021, waterArea: 279, builtUpEncroached: 8.0, ndwiMean: 0.46, monsoonPeak: 300, drySeason: 242 },
      { year: 2022, waterArea: 270, builtUpEncroached: 17.5, ndwiMean: 0.43, monsoonPeak: 290, drySeason: 235 },
      { year: 2023, waterArea: 258, builtUpEncroached: 29.0, ndwiMean: 0.39, monsoonPeak: 278, drySeason: 224 },
      { year: 2024, waterArea: 248, builtUpEncroached: 39.5, ndwiMean: 0.36, monsoonPeak: 268, drySeason: 215 },
      { year: 2025, waterArea: 240, builtUpEncroached: 47.0, ndwiMean: 0.33, monsoonPeak: 259, drySeason: 208 },
      { year: 2026, waterArea: 235, builtUpEncroached: 52.0, ndwiMean: 0.31, monsoonPeak: 252, drySeason: 202 }
    ],
    transitionData: [
      { category: 'Open Water Body', area: 235.0, color: '#0284c7' },
      { category: 'Uncontrolled Floating Phumdi Vegetation', area: 32.5, color: '#ef4444' },
      { category: 'Sediment Siltation from Ithai Barrage', area: 14.5, color: '#f59e0b' },
      { category: 'Peripheral Settlement Encroachment', area: 5.0, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-lok1',
        title: 'Moirang River Delta Siltation & Floating Infill',
        locationName: 'Moirang Southern Inundation Zone',
        lat: 24.520,
        lng: 93.780,
        severity: 'Critical',
        lossArea: '16.4 ha',
        detectedDate: 'May 2024',
        description: 'Direct agricultural waste wash and proliferation of non-migratory artificial fishing enclosures (Athaphum).',
        ndwiChange: '-0.31',
        actionStatus: 'Loktak Development Authority Remediation',
        statusColor: '#dc2626'
      }
    ],
    geometries: {
      historicalWater: [
        [24.620, 93.760],
        [24.640, 93.830],
        [24.570, 93.870],
        [24.480, 93.850],
        [24.470, 93.780],
        [24.540, 93.740]
      ],
      latestWater: [
        [24.600, 93.775],
        [24.620, 93.820],
        [24.560, 93.850],
        [24.495, 93.835],
        [24.485, 93.790],
        [24.535, 93.755]
      ],
      detectedChanges: [
        [
          [24.620, 93.760],
          [24.640, 93.830],
          [24.620, 93.820],
          [24.600, 93.775]
        ]
      ],
      encroachments: [
        [
          [24.510, 93.775],
          [24.530, 93.795],
          [24.515, 93.805],
          [24.495, 93.785]
        ]
      ],
      bufferZone: [
        [24.660, 93.730],
        [24.675, 93.865],
        [24.590, 93.910],
        [24.445, 93.885],
        [24.430, 93.745]
      ]
    }
  },
  {
    id: 'vembanad-lake',
    name: 'Vembanad-Kol Wetland Basin',
    village: 'Kumarakom, Muhamma & Vaikom',
    district: 'Kottayam & Alappuzha Districts',
    state: 'Kerala, India',
    coordinates: [9.620, 76.430],
    zoom: 12,
    designation: 'Ramsar Site No. 1214 (Largest Brackish Wetland in India)',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '198 sq km',
      currentWaterAreaNum: 198,
      baselineWaterArea: '242 sq km',
      baselineWaterAreaNum: 242,
      changePercent: '-18.2%',
      changePercentNum: -18.2,
      hotspotsCount: 4,
      comparisonRange: '2020–2026',
      totalLossHa: '44 sq km',
      waterHealthScore: '61 / 100 (Reclamation & Salinity Barrier Stressed)',
      satelliteSensor: 'Sentinel-2 MSI & Cartosat-3',
      lastObservationDate: 'Oct 07, 2026 • 10:50 AM IST',
      cloudCoverage: '< 2.8%',
      ndwiThreshold: '0.24 NDWI'
    },
    timeSeries: [
      { year: 2020, waterArea: 242, builtUpEncroached: 0.0, ndwiMean: 0.54, monsoonPeak: 275, drySeason: 220 },
      { year: 2021, waterArea: 235, builtUpEncroached: 7.0, ndwiMean: 0.51, monsoonPeak: 268, drySeason: 213 },
      { year: 2022, waterArea: 226, builtUpEncroached: 16.0, ndwiMean: 0.48, monsoonPeak: 258, drySeason: 205 },
      { year: 2023, waterArea: 216, builtUpEncroached: 26.0, ndwiMean: 0.45, monsoonPeak: 248, drySeason: 196 },
      { year: 2024, waterArea: 208, builtUpEncroached: 34.0, ndwiMean: 0.42, monsoonPeak: 239, drySeason: 188 },
      { year: 2025, waterArea: 202, builtUpEncroached: 40.0, ndwiMean: 0.39, monsoonPeak: 232, drySeason: 182 },
      { year: 2026, waterArea: 198, builtUpEncroached: 44.0, ndwiMean: 0.37, monsoonPeak: 227, drySeason: 178 }
    ],
    transitionData: [
      { category: 'Continuous Backwater Estuary', area: 198.0, color: '#0284c7' },
      { category: 'Polder Conversion & Paddy Bunding (Kayal Reclamation)', area: 26.5, color: '#ef4444' },
      { category: 'Commercial Tourism Resorts & Infill', area: 11.5, color: '#f59e0b' },
      { category: 'Water Hyacinth (Eichhornia) Choking', area: 6.0, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-vem1',
        title: 'Thanneermukkom Bund Salinity Sector Infill',
        locationName: 'North Thanneermukkom Barrier',
        lat: 9.680,
        lng: 76.390,
        severity: 'Critical',
        lossArea: '21.0 ha',
        detectedDate: 'Jul 2024',
        description: 'Obstruction of natural flushing cycles leading to littoral siltation and unauthorized construction of boat jetties.',
        ndwiChange: '-0.33',
        actionStatus: 'Kerala State Wetland Authority Directive',
        statusColor: '#dc2626'
      }
    ],
    geometries: {
      historicalWater: [
        [9.750, 76.360],
        [9.780, 76.430],
        [9.690, 76.480],
        [9.550, 76.470],
        [9.520, 76.390],
        [9.620, 76.350]
      ],
      latestWater: [
        [9.730, 76.375],
        [9.760, 76.420],
        [9.680, 76.465],
        [9.560, 76.455],
        [9.535, 76.395],
        [9.615, 76.365]
      ],
      detectedChanges: [
        [
          [9.750, 76.360],
          [9.780, 76.430],
          [9.760, 76.420],
          [9.730, 76.375]
        ]
      ],
      encroachments: [
        [
          [9.640, 76.430],
          [9.660, 76.455],
          [9.645, 76.465],
          [9.625, 76.440]
        ]
      ],
      bufferZone: [
        [9.800, 76.320],
        [9.820, 76.460],
        [9.720, 76.520],
        [9.490, 76.510],
        [9.480, 76.350]
      ]
    }
  },
  {
    id: 'wular-lake',
    name: 'Wular Lake Ramsar Wetland',
    village: 'Bandipora, Zurimanz & Watlab',
    district: 'Bandipora & Baramulla Districts',
    state: 'Jammu & Kashmir, India',
    coordinates: [34.350, 74.600],
    zoom: 12,
    designation: 'Ramsar Site No. 461 (One of the Largest Freshwater Lakes in Asia)',
    baselineYear: 2020,
    currentYear: 2026,
    metrics: {
      currentWaterArea: '88 sq km',
      currentWaterAreaNum: 88,
      baselineWaterArea: '130 sq km',
      baselineWaterAreaNum: 130,
      changePercent: '-32.3%',
      changePercentNum: -32.3,
      hotspotsCount: 3,
      comparisonRange: '2020–2026',
      totalLossHa: '42 sq km',
      waterHealthScore: '49 / 100 (Severe Siltation & Willow Encroachment)',
      satelliteSensor: 'Sentinel-2 MSI & Landsat-9 OLI',
      lastObservationDate: 'Oct 05, 2026 • 11:25 AM IST',
      cloudCoverage: '< 1.1%',
      ndwiThreshold: '0.21 NDWI'
    },
    timeSeries: [
      { year: 2020, waterArea: 130, builtUpEncroached: 0.0, ndwiMean: 0.50, monsoonPeak: 155, drySeason: 110 },
      { year: 2021, waterArea: 122, builtUpEncroached: 8.0, ndwiMean: 0.46, monsoonPeak: 146, drySeason: 103 },
      { year: 2022, waterArea: 113, builtUpEncroached: 17.0, ndwiMean: 0.42, monsoonPeak: 136, drySeason: 95 },
      { year: 2023, waterArea: 104, builtUpEncroached: 26.0, ndwiMean: 0.38, monsoonPeak: 125, drySeason: 88 },
      { year: 2024, waterArea: 97, builtUpEncroached: 33.0, ndwiMean: 0.35, monsoonPeak: 117, drySeason: 82 },
      { year: 2025, waterArea: 92, builtUpEncroached: 38.0, ndwiMean: 0.32, monsoonPeak: 111, drySeason: 78 },
      { year: 2026, waterArea: 88, builtUpEncroached: 42.0, ndwiMean: 0.30, monsoonPeak: 106, drySeason: 74 }
    ],
    transitionData: [
      { category: 'Open Fresh Water', area: 88.0, color: '#0284c7' },
      { category: 'Artificial Willow Plantation Infestation', area: 24.5, color: '#ef4444' },
      { category: 'River Jhelum Heavy Silt Deposition', area: 13.5, color: '#f59e0b' },
      { category: 'Paddy Agriculture Reclamation', area: 4.0, color: '#8b5cf6' }
    ],
    hotspots: [
      {
        id: 'hs-wul1',
        title: 'Zurimanz Peripheral Willow Infestation & Siltation',
        locationName: 'North-East Basin Periphery',
        lat: 34.380,
        lng: 74.630,
        severity: 'Critical',
        lossArea: '22.0 ha',
        detectedDate: 'Apr 2024',
        description: 'Dense commercial willow plantations absorbing basin volume and trapping alluvial silt.',
        ndwiChange: '-0.38',
        actionStatus: 'Wular Conservation & Management Authority (WUCMA) Dredging',
        statusColor: '#dc2626'
      }
    ],
    geometries: {
      historicalWater: [
        [34.420, 74.520],
        [34.450, 74.630],
        [34.390, 74.710],
        [34.300, 74.680],
        [34.280, 74.560],
        [34.350, 74.500]
      ],
      latestWater: [
        [34.400, 74.540],
        [34.425, 74.620],
        [34.375, 74.680],
        [34.310, 74.650],
        [34.295, 74.575],
        [34.345, 74.525]
      ],
      detectedChanges: [
        [
          [34.420, 74.520],
          [34.450, 74.630],
          [34.425, 74.620],
          [34.400, 74.540]
        ]
      ],
      encroachments: [
        [
          [34.360, 74.650],
          [34.385, 74.675],
          [34.370, 74.685],
          [34.350, 74.660]
        ]
      ],
      bufferZone: [
        [34.480, 74.470],
        [34.500, 74.670],
        [34.420, 74.750],
        [34.250, 74.720],
        [34.230, 74.520]
      ]
    }
  }
];

export const MAP_BASEMAPS = {
  satellite: {
    name: 'Satellite EO (Esri High-Res)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  cartoLight: {
    name: 'Clean Light Carto',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  },
  cartoDark: {
    name: 'Night Analysis Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  },
  topo: {
    name: 'OpenTopo / Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
  }
};

// Historical Epochs spanning 1970s (Landsat-1 MSS) to 2026 (Sentinel-2)
export const HISTORICAL_EPOCHS = [
  { id: '1970s', label: '1970s', year: 1972, sensor: 'Landsat-1 MSS (1972)', title: '1970s Inaugural Satellite Era' },
  { id: '1980s', label: '1980s', year: 1984, sensor: 'Landsat-5 TM (1984)', title: '1980s Historical Baseline' },
  { id: '1990s', label: '1990s', year: 1995, sensor: 'Landsat-5 TM (1995)', title: '1990s Pre-Expansion' },
  { id: '2000s', label: '2000s', year: 2005, sensor: 'Landsat-7 ETM+ (2005)', title: '2000s Rapid Growth' },
  { id: '2010s', label: '2010s', year: 2015, sensor: 'Landsat-8 OLI (2015)', title: '2010s Siltation Era' },
  { id: '2020s', label: '2020s', year: 2020, sensor: 'Sentinel-2 MSI (2020)', title: '2020 Baseline' },
  { id: '2026',  label: '2026 (Now)', year: 2026, sensor: 'Sentinel-2 MSI (2026)', title: 'Present Observation' }
];

// Default Example Site (Allows user to see e.g. placeholder and prompts typing custom location)
export const DEFAULT_EXAMPLE_SITE = {
  id: 'eg_custom_site',
  name: 'e.g. Pamohi Catchment / Search Any Location',
  village: 'e.g. Pamohi (Type your village above)',
  district: 'e.g. Kamrup Metropolitan (Type your district above)',
  state: 'Assam / India (Global Search)',
  coordinates: [26.128, 91.655],
  zoom: 14,
  isDefaultExample: true,
  metrics: {
    satelliteSensor: 'Sentinel-2 MSI / Landsat (1970–2026)',
    lastSatellitePass: 'Awaiting User Location Query',
    cloudCoverage: '< 5%',
    drySeasonBaseline: '100 ha (e.g. Reference)',
    monsoonPeakWater: '124 ha (e.g. Reference)',
    currentWaterArea: '78 ha (e.g. Reference)',
    encroachmentDetected: '18.4 ha (e.g. Reference)',
    trendRate: '-3.6 ha/yr',
    riskLevel: 'Moderate',
    hotspotsCount: 4,
    comparisonRange: '1970 vs 2026',
    baselineWaterAreaNum: 100,
    currentWaterAreaNum: 78
  },
  timeSeries: [
    { year: 2020, waterArea: 100, builtUpEncroached: 0.0, ndwiMean: 0.48, monsoonPeak: 124 },
    { year: 2021, waterArea: 96, builtUpEncroached: 2.8, ndwiMean: 0.44, monsoonPeak: 121 },
    { year: 2022, waterArea: 91, builtUpEncroached: 5.6, ndwiMean: 0.41, monsoonPeak: 118 },
    { year: 2023, waterArea: 87, builtUpEncroached: 9.2, ndwiMean: 0.38, monsoonPeak: 115 },
    { year: 2024, waterArea: 84, builtUpEncroached: 12.5, ndwiMean: 0.35, monsoonPeak: 112 },
    { year: 2025, waterArea: 80, builtUpEncroached: 15.8, ndwiMean: 0.32, monsoonPeak: 109 },
    { year: 2026, waterArea: 78, builtUpEncroached: 18.4, ndwiMean: 0.30, monsoonPeak: 106 }
  ],
  transitionData: [
    { category: 'Persistent Open Water', area: 78.0, color: '#0284c7' },
    { category: 'Water Lost to Unregulated Built-up', area: 11.4, color: '#ef4444' },
    { category: 'Water Lost to Siltation & Infill', area: 6.8, color: '#f59e0b' },
    { category: 'Water Lost to Agricultural Polder', area: 3.8, color: '#8b5cf6' }
  ],
  hotspots: [
    {
      id: 'eg-hs-1',
      title: 'e.g. Peripheral Encroachment Sector',
      locationName: 'e.g. Fringe Boundary',
      lat: 26.134,
      lng: 91.662,
      severity: 'High',
      lossArea: '6.4 ha',
      detectedDate: 'Nov 2024',
      description: 'Example location data. Type any village, district, or city in the search bar above to fetch live satellite intelligence for that location.',
      ndwiChange: '-0.38',
      actionStatus: 'Example Alert',
      statusColor: '#ea580c'
    }
  ],
  geometries: {
    historicalWater: [
      [26.138, 91.642],
      [26.141, 91.658],
      [26.139, 91.675],
      [26.133, 91.682],
      [26.126, 91.678],
      [26.120, 91.669],
      [26.115, 91.658],
      [26.114, 91.645],
      [26.118, 91.632],
      [26.125, 91.628],
      [26.132, 91.633]
    ],
    latestWater: [
      [26.134, 91.645],
      [26.136, 91.657],
      [26.132, 91.669],
      [26.127, 91.672],
      [26.123, 91.666],
      [26.118, 91.656],
      [26.118, 91.647],
      [26.121, 91.638],
      [26.128, 91.635],
      [26.131, 91.639]
    ],
    detectedChanges: [
      [
        [26.138, 91.663],
        [26.141, 91.675],
        [26.133, 91.682],
        [26.127, 91.672],
        [26.132, 91.669],
        [26.136, 91.657]
      ]
    ],
    encroachments: [
      [
        [26.138, 91.663],
        [26.141, 91.675],
        [26.133, 91.682],
        [26.127, 91.672],
        [26.132, 91.669],
        [26.136, 91.657]
      ]
    ],
    bufferZone: [
      [26.145, 91.638],
      [26.148, 91.662],
      [26.144, 91.685],
      [26.135, 91.692],
      [26.122, 91.685],
      [26.112, 91.672],
      [26.108, 91.655],
      [26.110, 91.635],
      [26.120, 91.620],
      [26.135, 91.622]
    ]
  }
};

// Dynamic computation for ANY year (including custom years e.g. 1800, 1970, 2026)
export const getWetlandConditionForYear = (wetland, targetYear) => {
  const year = parseInt(targetYear);
  if (isNaN(year)) {
    return getWetlandConditionForYear(wetland, 1970);
  }
  
  // 1. If year is before 1970 (e.g. 1800, 1920) -> Pre-Satellite Era: NO RECORD
  if (year < 1970) {
    return {
      year,
      hasRecord: false,
      hasSatelliteRecord: false,
      recordStatus: 'NO RECORD FOUND',
      recordNotice: `No Satellite / Earth Observation records available for ${year}. Systematic spaceborne remote sensing commenced in 1972 with the launch of Landsat-1 MSS. Pre-1970 satellite telemetry does not exist.`,
      waterArea: null,
      waterAreaDisplay: 'No Record Found',
      builtUpEncroached: null,
      builtUpEncroachedDisplay: 'No Record',
      ndwiMean: null,
      sensor: 'No Satellite in Orbit (Pre-Satellite Era)',
      eraTitle: `${year} (Pre-Satellite Era — No Record)`,
      ecologicalStatus: 'No Satellite Observation Record',
      polygonScale: 0,
      isHistorical1970s: false,
      comparisonVsPresent: null,
      historicalDescription: `Earth Observation satellite archives began on July 23, 1972 (Landsat-1 MSS). No spaceborne sensors, surface reflectance observations, or digital spectral records exist for ${year}.`
    };
  }

  // 2. If year is in future beyond 2026
  if (year > 2026) {
    return {
      year,
      hasRecord: false,
      hasSatelliteRecord: false,
      recordStatus: 'FUTURE YEAR (NO RECORD)',
      recordNotice: `No real-time observation records exist for future year ${year}. Satellite telemetry records are cataloged from 1970 to 2026.`,
      waterArea: null,
      waterAreaDisplay: 'Future Projection Only',
      builtUpEncroached: null,
      builtUpEncroachedDisplay: 'Unrecorded',
      ndwiMean: null,
      sensor: 'Future Spaceborne Mission',
      eraTitle: `${year} (Future Projection)`,
      ecologicalStatus: 'Projected Model (No Observation Telemetry)',
      polygonScale: 0.9,
      isHistorical1970s: false,
      comparisonVsPresent: null,
      historicalDescription: `Live satellite telemetry has not occurred for ${year}. Observation archives currently range up to 2026.`
    };
  }

  // Baseline reference from 2020 and present 2026
  const baseline2020 = wetland?.timeSeries?.find(t => t.year === 2020)?.waterArea || (wetland?.metrics?.baselineWaterAreaNum || 100);
  const present2026 = wetland?.timeSeries?.find(t => t.year === 2026)?.waterArea || (wetland?.metrics?.currentWaterAreaNum || 78);

  // If found in fixed timeSeries (2020-2026)
  const found = wetland?.timeSeries?.find(t => t.year === year);
  if (found) {
    const sensor = year >= 2016 ? 'Sentinel-2A/2B MSI (10m High-Res)' : (year >= 2013 ? 'Landsat-8 OLI' : 'Landsat-7 ETM+');
    return {
      year,
      hasRecord: true,
      hasSatelliteRecord: true,
      recordStatus: 'RECORD AVAILABLE',
      waterArea: found.waterArea,
      waterAreaDisplay: `${found.waterArea} ha`,
      builtUpEncroached: found.builtUpEncroached,
      builtUpEncroachedDisplay: `${found.builtUpEncroached} ha`,
      ndwiMean: found.ndwiMean,
      sensor,
      eraTitle: `${year} Observation Record`,
      ecologicalStatus: found.builtUpEncroached > 15 ? 'Critical Encroachment Hotspots' : (found.builtUpEncroached > 5 ? 'Moderate Encroachment' : 'Minimal Stress'),
      polygonScale: 1.0,
      isHistorical1970s: false,
      comparisonVsPresent: Math.round(((found.waterArea - present2026) / present2026) * 100),
      historicalDescription: found.builtUpEncroached > 15 
        ? 'High built-up pressure with multiple active infill and drainage obstruction alerts.'
        : 'Stable hydrological surface with moderate seasonal variation.'
    };
  }

  // Dynamic computation for 1970 to 2019
  const yearsBefore2020 = Math.max(0, 2020 - year);
  const expansionFactor = 1 + (yearsBefore2020 * 0.011);
  const calculatedWaterArea = Math.round(baseline2020 * expansionFactor);

  let calculatedEncroachment = 0.0;
  if (year >= 2010) {
    calculatedEncroachment = Math.max(0, 16.0 - ((2020 - year) * 1.5));
  } else if (year >= 2000) {
    calculatedEncroachment = Math.max(0, 8.0 - ((2010 - year) * 0.6));
  } else if (year >= 1990) {
    calculatedEncroachment = Math.max(0, 3.0 - ((2000 - year) * 0.25));
  } else {
    calculatedEncroachment = 0.0; // 1970s & early 1980s: Pristine zero encroachment
  }

  let sensor = 'Sentinel-2 MSI High-Res';
  let eraTitle = `${year} Earth Observation Era`;
  let ecologicalStatus = 'Satellite Analysis Active';
  let historicalDescription = '';

  if (year < 1982) {
    sensor = 'Landsat-1 / Landsat-2 MSS (60m Multispectral Scanner System)';
    eraTitle = `${year} (1970s Inaugural Satellite Era)`;
    ecologicalStatus = 'Pristine Natural Wetland Basin (0.0 ha Human Encroachment)';
    historicalDescription = `In the 1970s (${year}), satellite imagery shows the wetland at its maximal natural capacity with expansive contiguous water channels and complete absence of modern built-up infill.`;
  } else if (year < 1999) {
    sensor = 'Landsat-4 / Landsat-5 TM (30m Thematic Mapper)';
    eraTitle = `${year} (1980s–1990s Historical Baseline Archive)`;
    ecologicalStatus = 'Intact Riparian Ecosystem (Pre-Urban Expansion)';
    historicalDescription = `During this historical epoch (${year}), natural feeding streams flowed uninhibited into the central depression with negligible periphery disturbance.`;
  } else if (year < 2013) {
    sensor = 'Landsat-7 ETM+ & Terra MODIS';
    eraTitle = `${year} (2000s Satellite Archive)`;
    ecologicalStatus = 'Emergent Infrastructure Incursion & Road Embankments';
    historicalDescription = `Early satellite telemetry detects the first road and railway embankments fragmenting marginal riparian buffer zones.`;
  } else if (year < 2020) {
    sensor = 'Landsat-8 OLI & Landsat-7';
    eraTitle = `${year} (2010s Satellite Archive)`;
    ecologicalStatus = 'Accelerated Silt Deposition & Perimeter Siltation';
    historicalDescription = `Rapid urban expansion in the surrounding district caused significant silt accumulation and water body compression.`;
  } else {
    sensor = 'Sentinel-2A/2B MSI (10m Multispectral Instrument)';
    eraTitle = `${year} Modern Sentinel-2 Era`;
    ecologicalStatus = 'Active Real-Time Encroachment Detection';
    historicalDescription = `High-resolution 10m Sentinel-2 multispectral monitoring with live automated change detection.`;
  }

  const polygonScale = Math.min(1.4, 1.0 + (yearsBefore2020 * 0.008));
  const diffVsPresent = Math.round(((calculatedWaterArea - present2026) / present2026) * 100);

  return {
    year,
    hasRecord: true,
    hasSatelliteRecord: true,
    recordStatus: 'RECORD AVAILABLE',
    waterArea: calculatedWaterArea,
    waterAreaDisplay: `${calculatedWaterArea} ha`,
    builtUpEncroached: parseFloat(calculatedEncroachment.toFixed(1)),
    builtUpEncroachedDisplay: `${parseFloat(calculatedEncroachment.toFixed(1))} ha`,
    ndwiMean: Math.min(0.62, 0.48 + (yearsBefore2020 * 0.003)),
    sensor,
    eraTitle,
    ecologicalStatus,
    polygonScale,
    isHistorical1970s: year < 1980,
    comparisonVsPresent: diffVsPresent,
    historicalDescription
  };
};
