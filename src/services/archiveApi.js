const ARCHIVE_API_BASE_URL = '/api/fires'

async function fetchJson(url, signal, fetchImpl) {
  const response = await fetchImpl(url, { signal })
  if (!response.ok) {
    throw new Error(`Wildfire archive request failed (HTTP ${response.status}).`)
  }
  return response.json()
}

export async function fetchArchiveMonths({
  signal,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('This environment does not support fetching wildfire archive data.')
  }

  const payload = await fetchJson(`${ARCHIVE_API_BASE_URL}/months`, signal, fetchImpl)
  const months = Array.isArray(payload) ? payload : payload?.months
  if (!Array.isArray(months)) {
    throw new Error('Wildfire archive returned an invalid months response.')
  }

  const validMonths = months
    .filter(
      (item) =>
        typeof item?.month === 'string' &&
        /^\d{4}-(0[1-9]|1[0-2])$/.test(item.month) &&
        Number.isFinite(Number(item.count)) &&
        Number(item.count) >= 0,
    )
    .map((item) => ({ month: item.month, count: Number(item.count) }))
    .sort((first, second) => first.month.localeCompare(second.month))
  if (months.length > 0 && validMonths.length === 0) {
    throw new Error('Wildfire archive returned invalid month entries.')
  }
  return validMonths
}

export async function fetchArchiveFires(
  month,
  { signal, fetchImpl = globalThis.fetch } = {},
) {
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('A valid archive month is required (YYYY-MM).')
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('This environment does not support fetching wildfire archive data.')
  }

  const payload = await fetchJson(
    `${ARCHIVE_API_BASE_URL}?month=${encodeURIComponent(month)}`,
    signal,
    fetchImpl,
  )
  if (!Array.isArray(payload?.points)) {
    throw new Error(`Wildfire archive returned invalid fire points for ${month}.`)
  }

  return payload.points.flatMap((point, index) => {
    const latitude = Number(point.latitude ?? point.lat)
    const longitude = Number(point.longitude ?? point.lng)
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return []
    }

    return [{
      id: String(point.id ?? `${month}-${index}`),
      latitude,
      longitude,
      frp: Number.isFinite(Number(point.frp)) ? Number(point.frp) : 0,
      confidence: point.confidence ?? null,
      acq_date: String(point.acqDate ?? point.acq_date ?? ''),
      acq_time: String(point.acqTime ?? point.acq_time ?? ''),
      daynight: String(point.daynight ?? '').toUpperCase(),
      satellite: point.satellite ?? point.sensor ?? '—',
      sensor: point.sensor ?? point.satellite ?? '—',
      region: point.region ?? '',
    }]
  })
}
