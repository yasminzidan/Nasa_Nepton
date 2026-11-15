const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'
const FIRMS_SOURCES = [
  { id: 'VIIRS_SNPP_NRT', label: 'VIIRS' },
  { id: 'MODIS_NRT', label: 'MODIS' },
]

const parseCsvRows = (csv) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        field += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(field)
      field = ''
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && csv[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  row.push(field)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

const numericValue = (value) => {
  if (!String(value).trim()) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function parseFirmsCsv(csv, sourceLabel = 'FIRMS') {
  if (typeof csv !== 'string' || !csv.trim()) {
    throw new Error(`NASA FIRMS returned an empty ${sourceLabel} response.`)
  }

  const rows = parseCsvRows(csv.replace(/^\uFEFF/, ''))
  const header = rows.shift()?.map((value) => value.trim().toLowerCase())
  if (!header?.includes('latitude') || !header.includes('longitude')) {
    throw new Error(`NASA FIRMS returned an invalid ${sourceLabel} CSV response.`)
  }

  const column = (record, name) => record[header.indexOf(name)]?.trim() ?? ''
  return rows.flatMap((record) => {
    const latitude = numericValue(column(record, 'latitude'))
    const longitude = numericValue(column(record, 'longitude'))
    if (
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return []
    }

    const acqDate = column(record, 'acq_date')
    const acqTime = column(record, 'acq_time')
    const rawSatellite = column(record, 'satellite')
    const satellite = rawSatellite || sourceLabel
    const frp = numericValue(column(record, 'frp'))
    const confidenceValue = column(record, 'confidence')
    const confidence =
      numericValue(confidenceValue) ?? (confidenceValue || null)
    const id = [
      satellite,
      acqDate,
      acqTime,
      column(record, 'latitude'),
      column(record, 'longitude'),
    ].join('-')

    return [{
      id,
      latitude,
      longitude,
      frp: frp ?? 0,
      confidence,
      acq_date: acqDate,
      acq_time: acqTime.padStart(4, '0').replace(/^(\d{2})(\d{2})$/, '$1:$2'),
      satellite,
      sensor: sourceLabel,
      daynight: column(record, 'daynight').toUpperCase(),
    }]
  })
}

async function fetchSource({ source, bounds, mapKey, signal, fetchImpl }) {
  const area = bounds.join(',')
  const url = `${FIRMS_BASE_URL}/${encodeURIComponent(mapKey)}/${source.id}/${area}/2`
  const response = await fetchImpl(url, { signal })
  if (!response.ok) {
    throw new Error(`NASA FIRMS ${source.label} request failed (HTTP ${response.status}).`)
  }

  const csv = await response.text()
  if (/^\s*(#\s*)?(error|invalid|request limit)/i.test(csv)) {
    throw new Error(`NASA FIRMS ${source.label} returned an API error.`)
  }
  return parseFirmsCsv(csv, source.label)
}

export async function fetchFirmsActiveFires(
  bounds,
  {
    mapKey = import.meta.env.VITE_FIRMS_MAP_KEY,
    signal,
    fetchImpl = globalThis.fetch,
  } = {},
) {
  if (!mapKey) {
    throw new Error('NASA FIRMS Map Key is not configured. Set VITE_FIRMS_MAP_KEY in .env.local.')
  }
  if (
    !Array.isArray(bounds) ||
    bounds.length !== 4 ||
    bounds.some((coordinate) => !Number.isFinite(Number(coordinate)))
  ) {
    throw new Error('NASA FIRMS requires valid [west, south, east, north] bounds.')
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('This environment does not support fetching NASA FIRMS data.')
  }

  const results = await Promise.all(
    FIRMS_SOURCES.map((source) =>
      fetchSource({ source, bounds, mapKey, signal, fetchImpl }),
    ),
  )
  return results.flat()
}
