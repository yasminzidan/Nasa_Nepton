import { useEffect, useRef } from 'react'
import {
  BillboardCollection,
  Cartesian3,
  Color,
  defined,
  IonImageryProvider,
  JulianDate,
  Material,
  Math as CesiumMath,
  NearFarScalar,
  PolylineCollection,
  Rectangle,
  SceneMode,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  UrlTemplateImageryProvider,
  VerticalOrigin,
  Viewer,
  WebMercatorTilingScheme,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './CesiumViewer.css'

/* ------------------------------------------------------------------ *
 * Design tokens (same as the UI panels)
 * ------------------------------------------------------------------ */
const BONE = '#e8e4da'
const MUTE = '#868c96'
const VOID = '#07080a'

// Set to true to show a live day/night terminator on the globe.
const SHOW_TERMINATOR = false

// Flat square markers. Colour + size follow FRP; only the top tier pulses.
const FRP_TIERS = [
  { max: 10, color: '#C2571A', size: 26, pulse: false },
  { max: 50, color: '#FF5A1F', size: 32, pulse: false },
  { max: 100, color: '#FF4528', size: 38, pulse: false },
  { max: Infinity, color: '#FF3B30', size: 46, pulse: true },
]

const tierFor = (frp) => FRP_TIERS.find((tier) => (Number(frp) || 0) < tier.max)

const svgImage = (markup) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`

const escapeXml = (value) =>
  String(value).replace(/[<>&"']/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c],
  )

/* ------------------------------------------------------------------ *
 * Billboard icons
 * ------------------------------------------------------------------ */
const iconCache = new Map()

// Target-style marker: solid core square, thin outer square, 4 edge ticks.
const hotspotIcon = (color, ring) => {
  const key = `${color}-${ring}`
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      svgImage(
        `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
          ${ring ? `<rect x="9" y="9" width="30" height="30" fill="none" stroke="${color}" stroke-opacity="0.28"/>` : ''}
          <rect x="15" y="15" width="18" height="18" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-opacity="0.7"/>
          <path d="M24 5v7M24 36v7M5 24h7M36 24h7" stroke="${color}" stroke-opacity="0.55" stroke-width="1"/>
          <rect x="20" y="20" width="8" height="8" fill="${color}"/>
        </svg>`,
      ),
    )
  }
  return iconCache.get(key)
}

// Selected hotspot: bone-coloured corner brackets.
const reticleIcon = svgImage(
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><path d="M6 20V6h14M44 6h14v14M58 44v14H44M20 58H6V44" fill="none" stroke="${BONE}" stroke-width="1.5"/></svg>`,
)

// Callout label: square box, fire marker, monospace data.
const hotspotLabelIcon = (fire) => {
  const coordinates = `${Number(fire.latitude).toFixed(3)}, ${Number(fire.longitude).toFixed(3)}`
  const font = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"
  return svgImage(
    `<svg xmlns="http://www.w3.org/2000/svg" width="190" height="46" viewBox="0 0 190 46">
      <rect x="0.5" y="0.5" width="189" height="45" fill="${VOID}" fill-opacity="0.92" stroke="${BONE}" stroke-opacity="0.7"/>
      <rect x="10" y="12" width="6" height="6" fill="#FF5A1F"/>
      <text x="24" y="19" fill="${BONE}" font-family="${font}" font-size="12" letter-spacing="1">${escapeXml(fire.id)}</text>
      <text x="10" y="35" fill="${MUTE}" font-family="${font}" font-size="10" letter-spacing="0.6">${escapeXml(coordinates)}</text>
    </svg>`,
  )
}

const confidenceToAlpha = (confidence) => {
  if (typeof confidence === 'string') {
    const value = confidence.trim().toLowerCase()
    if (value === 'h' || value === 'high') return 1
    if (value === 'n' || value === 'nominal') return 0.85
    if (value === 'l' || value === 'low') return 0.6
    confidence = Number.parseFloat(value)
  }
  if (Number.isFinite(confidence)) {
    return 0.5 + (0.5 * Math.min(Math.max(confidence, 0), 100)) / 100
  }
  return 0.9
}

const createSatelliteImagery = () =>
  new UrlTemplateImageryProvider({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    tilingScheme: new WebMercatorTilingScheme(),
    maximumLevel: 19,
    credit: 'Tiles © Esri',
  })

// Desaturated, darker, slightly punchier imagery so hotspots stand out.
const tuneLayer = (layer) => {
  layer.saturation = 0.5
  layer.brightness = 0.9
  layer.contrast = 1.1
  layer.gamma = 1.04
}

const formatCoord = (value, pos, neg, digits = 4) =>
  `${Math.abs(value).toFixed(digits)}°${value >= 0 ? pos : neg}`

// Deterministic star field (same every render) drawn with CSS.
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647
const rnd = seeded(42)
const STARS = Array.from({ length: 110 }, () => {
  const x = (rnd() * 100).toFixed(1)
  const y = (rnd() * 100).toFixed(1)
  const r = rnd() > 0.9 ? 1.6 : 1
  const a = (0.22 + rnd() * 0.5).toFixed(2)
  return `radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(232,228,218,${a}), transparent 100%)`
}).join(',')

export default function CesiumViewer({
  fireData = [],
  onSelectFire,
  onReady,
  ionToken,
  onImageryError,
  focus,
  selectedFire,
  className = '',
}) {
  const containerRef = useRef(null)
  const viewerRef = useRef(null)
  const firesRef = useRef(null)
  const highlightRef = useRef(null)
  const leaderRef = useRef(null)
  const pulseRef = useRef([])
  const startPulseRef = useRef(null)
  const latRef = useRef(null)
  const lonRef = useRef(null)
  const altRef = useRef(null)
  const onSelectRef = useRef(onSelectFire)
  const onReadyRef = useRef(onReady)
  const onImageryErrorRef = useRef(onImageryError)

  useEffect(() => {
    onSelectRef.current = onSelectFire
  }, [onSelectFire])

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onImageryErrorRef.current = onImageryError
  }, [onImageryError])

  /* ---------------------------- viewer setup --------------------------- */
  useEffect(() => {
    const viewer = new Viewer(containerRef.current, {
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      sceneMode: SceneMode.SCENE3D,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      // Needed for scene.backgroundColor = TRANSPARENT to really be transparent,
      // so the grid / stars behind the canvas show through.
      contextOptions: { webgl: { alpha: true } },
    })
    viewerRef.current = viewer
    viewer.cesiumWidget.creditDisplay.showCesiumCredit = false
    viewer.resolutionScale = window.devicePixelRatio

    const { scene } = viewer

    // Clean, empty space: we draw our own background behind the canvas.
    scene.backgroundColor = Color.TRANSPARENT
    scene.skyBox.show = false
    scene.sun.show = false
    scene.moon.show = false
    scene.highDynamicRange = false

    const baseLayer = scene.imageryLayers.addImageryProvider(createSatelliteImagery())
    tuneLayer(baseLayer)
    baseLayer.errorEvent.addEventListener((error) => {
      onImageryErrorRef.current?.(error)
    })

    // Globe + a thin, cold atmosphere rim instead of a bright halo.
    scene.globe.show = true
    scene.globe.baseColor = Color.fromCssColorString('#0f1114')
    scene.globe.maximumScreenSpaceError = 0.6
    scene.globe.tileCacheSize = 1000
    scene.globe.showGroundAtmosphere = true
    scene.globe.atmosphereLightIntensity = 9
    scene.globe.atmosphereHueShift = -0.02
    scene.globe.atmosphereSaturationShift = -0.15
    scene.globe.atmosphereBrightnessShift = -0.05
    scene.skyAtmosphere.hueShift = -0.02
    scene.skyAtmosphere.saturationShift = -0.2
    scene.skyAtmosphere.brightnessShift = -0.1

    // Optional live day/night terminator.
    scene.globe.enableLighting = SHOW_TERMINATOR
    if (SHOW_TERMINATOR) {
      viewer.clock.currentTime = JulianDate.now()
      viewer.clock.shouldAnimate = false
    }

    if (ionToken) {
      IonImageryProvider.fromAssetId(2, { accessToken: ionToken })
        .then((provider) => {
          if (viewer.isDestroyed()) return
          const ionLayer = scene.imageryLayers.addImageryProvider(provider, 1)
          ionLayer.alpha = 1
          tuneLayer(ionLayer)
          scene.requestRender()
        })
        .catch((error) => {
          if (!viewer.isDestroyed()) onImageryErrorRef.current?.(error)
        })
    }

    viewer.camera.setView({
      destination: Rectangle.fromDegrees(-74, -34, -34, 5.3),
    })

    let readySignaled = false
    let removeFirstRender
    removeFirstRender = scene.postRender.addEventListener(() => {
      if (readySignaled) return
      readySignaled = true
      onReadyRef.current?.()
      removeFirstRender?.()
    })

    firesRef.current = scene.primitives.add(new BillboardCollection({ scene }))
    highlightRef.current = scene.primitives.add(new BillboardCollection({ scene }))
    leaderRef.current = scene.primitives.add(new PolylineCollection())

    scene.requestRender()
    viewer.render()

    /* ------------------------------ HUD ------------------------------ */
    // Updates the DOM text directly, no React re-render per camera frame.
    const updateHud = () => {
      if (viewer.isDestroyed()) return
      const c = viewer.camera.positionCartographic
      if (!c) return
      if (latRef.current)
        latRef.current.textContent = formatCoord(CesiumMath.toDegrees(c.latitude), 'N', 'S')
      if (lonRef.current)
        lonRef.current.textContent = formatCoord(CesiumMath.toDegrees(c.longitude), 'E', 'W')
      if (altRef.current)
        altRef.current.textContent = `${Math.round(c.height / 1000).toLocaleString('en-US')} KM`
    }
    viewer.camera.percentageChanged = 0.02
    const removeChanged = viewer.camera.changed.addEventListener(updateHud)
    const removeMoveEnd = viewer.camera.moveEnd.addEventListener(updateHud)
    updateHud()

    /* ----------------------------- picking ---------------------------- */
    const handler = new ScreenSpaceEventHandler(scene.canvas)
    const pickFire = (position) => {
      const picked = scene.pick(position)
      return defined(picked) ? picked.primitive?.id?.fire ?? null : null
    }

    handler.setInputAction((click) => {
      onSelectRef.current?.(pickFire(click.position))
    }, ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction((move) => {
      scene.canvas.style.cursor = pickFire(move.endPosition) ? 'pointer' : 'default'
    }, ScreenSpaceEventType.MOUSE_MOVE)

    /* ------------------------ pulse (top tier only) ------------------------ */
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    let animationFrameId = null
    let lastFrame = 0
    const startTime = performance.now()

    const animatePulse = (now) => {
      animationFrameId = null
      if (viewer.isDestroyed() || reducedMotion) return

      const pulsing = pulseRef.current
      if (pulsing.length === 0) return

      if (now - lastFrame >= 33) {
        lastFrame = now
        const elapsed = (now - startTime) / 1000
        for (let i = 0; i < pulsing.length; i++) {
          const { billboard, base } = pulsing[i]
          billboard.scale = base * (1 + 0.12 * Math.sin(elapsed * 2.4 + i * 0.7))
        }
        scene.requestRender()
      }

      animationFrameId = requestAnimationFrame(animatePulse)
    }
    const startPulseAnimation = () => {
      if (
        !reducedMotion &&
        animationFrameId === null &&
        pulseRef.current.length > 0
      ) {
        animationFrameId = requestAnimationFrame(animatePulse)
      }
    }
    startPulseRef.current = startPulseAnimation

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
      startPulseRef.current = null
      removeChanged?.()
      removeMoveEnd?.()
      removeFirstRender?.()
      handler.destroy()
      if (!viewer.isDestroyed()) viewer.destroy()
      viewerRef.current = null
      firesRef.current = null
      highlightRef.current = null
      leaderRef.current = null
      pulseRef.current = []
    }
  }, [ionToken])

  /* ----------------------------- focus bounds ---------------------------- */
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !focus) return

    viewer.camera.flyTo({
      destination: Rectangle.fromDegrees(...focus),
      duration: 1.4,
    })
  }, [focus])

  /* --------------------------- selected hotspot --------------------------- */
  useEffect(() => {
    const viewer = viewerRef.current
    const highlights = highlightRef.current
    const leader = leaderRef.current
    if (!viewer || !highlights || !leader) return

    highlights.removeAll()
    leader.removeAll()
    if (selectedFire) {
      const longitude = Number(selectedFire.longitude)
      const latitude = Number(selectedFire.latitude)
      const position = Cartesian3.fromDegrees(longitude, latitude, 1000)
      const labelPosition = Cartesian3.fromDegrees(longitude + 1.2, latitude + 0.5, 1000)

      highlights.add({
        position,
        image: reticleIcon,
        width: 64,
        height: 64,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      })
      highlights.add({
        position: labelPosition,
        image: hotspotLabelIcon(selectedFire),
        width: 190,
        height: 46,
        verticalOrigin: VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      })
      leader.add({
        positions: [position, labelPosition],
        width: 1.5,
        material: Material.fromType('Color', {
          color: Color.fromCssColorString(BONE).withAlpha(0.75),
        }),
      })
      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, 1.8e6),
        orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 },
        duration: 1.2,
      })
    }
    viewer.scene.requestRender()
  }, [selectedFire])

  /* ------------------------------ hotspots ------------------------------ */
  useEffect(() => {
    const viewer = viewerRef.current
    const collection = firesRef.current
    if (!viewer || !collection) return

    collection.removeAll()
    pulseRef.current = []

    const scaleByDistance = new NearFarScalar(1.5e6, 1, 1.8e7, 0.7)

    fireData.forEach((fire, index) => {
      const latitude = Number(fire.latitude)
      const longitude = Number(fire.longitude)
      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return
      }

      const tier = tierFor(fire.frp)
      const alpha = confidenceToAlpha(fire.confidence)
      const position = Cartesian3.fromDegrees(longitude, latitude, 1000)
      const id = { fire: { ...fire, id: fire.id ?? index } }

      const billboard = collection.add({
        position,
        image: hotspotIcon(tier.color, tier.pulse),
        width: tier.size,
        height: tier.size,
        color: Color.WHITE.withAlpha(alpha),
        scaleByDistance,
        id,
      })
      if (tier.pulse) pulseRef.current.push({ billboard, base: 1 })
    })

    viewer.scene.requestRender()
    startPulseRef.current?.()
  }, [fireData])

  /* -------------------------------- render ------------------------------- */
  const hudLabel =
    'font-mono text-[10px] uppercase tracking-[0.14em] text-[#6a707a] tabular-nums'

  return (
    <div className={`relative h-full w-full overflow-hidden bg-[#050506] ${className}`}>
      {/* Deep-space backdrop: gradient + soft nebula glows + stars */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `${STARS},
            radial-gradient(ellipse 55% 60% at 50% 50%, rgba(58,62,70,0.38) 0%, rgba(58,62,70,0) 70%),
            radial-gradient(ellipse 40% 45% at 12% 88%, rgba(255,90,31,0.07) 0%, rgba(255,90,31,0) 70%),
            radial-gradient(ellipse 45% 50% at 90% 10%, rgba(90,94,102,0.14) 0%, rgba(90,94,102,0) 70%),
            radial-gradient(ellipse 40% 40% at 88% 92%, rgba(232,228,218,0.035) 0%, rgba(232,228,218,0) 70%),
            linear-gradient(180deg, #050506 0%, #0a0b0e 55%, #0d0e12 100%)`,
        }}
      />

      {/* Milky-way band */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="h-[34vh] w-[160vw] -rotate-[28deg] blur-[70px]"
          style={{
            backgroundImage:
              'linear-gradient(90deg, transparent 0%, rgba(200,200,205,0.06) 30%, rgba(232,228,218,0.10) 50%, rgba(200,200,205,0.06) 70%, transparent 100%)',
          }}
        />
      </div>

      {/* Faint grid, fading out toward the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 72%)',
          maskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 72%)',
        }}
      />

      {/* Orbit rings behind the globe */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-[min(92vh,980px)] w-[min(92vh,980px)] rounded-full border border-[#e8e4da]/[0.07]" />
        <div className="absolute h-[min(120vh,1260px)] w-[min(120vh,1260px)] rounded-full border border-dashed border-[#e8e4da]/[0.05]" />
        <div className="absolute h-[min(40vh,420px)] w-[min(150vh,1500px)] -rotate-[18deg] rounded-[50%] border border-[#e8e4da]/[0.09]" />
        <span className="absolute h-1.5 w-1.5 bg-[#FF5A1F]" style={{ transform: 'translate(min(52vh,560px), -22vh)' }} />
      </div>

      {/* Degree ring + crosshair + cardinal marks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="absolute h-[min(96vh,1020px)] w-[min(96vh,1020px)] rounded-full"
          style={{
            backgroundImage:
              'repeating-conic-gradient(from -0.2deg, rgba(232,228,218,0.4) 0deg 0.4deg, transparent 0.4deg 3deg)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 97.5%, #000 98%, #000 100%, transparent 100.5%)',
            maskImage: 'radial-gradient(circle, transparent 97.5%, #000 98%, #000 100%, transparent 100.5%)',
          }}
        />
        <div
          className="absolute h-[min(96vh,1020px)] w-[min(96vh,1020px)] rounded-full"
          style={{
            backgroundImage:
              'repeating-conic-gradient(from -0.3deg, rgba(232,228,218,0.7) 0deg 0.6deg, transparent 0.6deg 30deg)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 94.5%, #000 95%, #000 100%, transparent 100.5%)',
            maskImage: 'radial-gradient(circle, transparent 94.5%, #000 95%, #000 100%, transparent 100.5%)',
          }}
        />
        <div className="absolute h-px w-[min(112vh,1180px)] bg-gradient-to-r from-transparent via-[#e8e4da]/[0.12] to-transparent" />
        <div className="absolute h-[min(112vh,1180px)] w-px bg-gradient-to-b from-transparent via-[#e8e4da]/[0.12] to-transparent" />
        <span className={`${hudLabel} absolute`} style={{ transform: 'translateY(calc(min(96vh,1020px) / -2 - 14px))' }}>000</span>
        <span className={`${hudLabel} absolute`} style={{ transform: 'translateY(calc(min(96vh,1020px) / 2 + 14px))' }}>180</span>
      </div>

      {/* Satellite markers (Terra carries MODIS, Suomi NPP carries VIIRS) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
        <div className="absolute flex items-center gap-2" style={{ transform: 'translate(calc(min(52vh,560px) + 68px), -22vh)' }}>
          <span className={hudLabel}>TERRA · MODIS</span>
        </div>
        <div className="absolute flex items-center gap-2" style={{ transform: 'translate(calc(min(-46vh,-470px) - 84px), 30vh)' }}>
          <span className={hudLabel}>SUOMI NPP · VIIRS</span>
        </div>
        <span className="absolute h-1.5 w-1.5 border border-[#e8e4da] bg-[#050506]" style={{ transform: 'translate(min(-46vh,-470px), 30vh)' }} />
      </div>

      {/* Scan lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* Light vignette so the edges stay calm */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(5,5,6,0) 55%, rgba(5,5,6,0.75) 100%)',
        }}
      />

      {/* Globe */}
      <div ref={containerRef} className="cesium-map__container absolute inset-0 z-10 h-full w-full" />

      {/* HUD readouts (hidden on small screens, sits between the side panels) */}
      <div className="pointer-events-none absolute left-[372px] right-[372px] top-[84px] z-20 hidden justify-between lg:flex">
        <div className={`${hudLabel} flex gap-4`}>
          <span>
            LAT <span ref={latRef} className="text-[#e8e4da]">--</span>
          </span>
          <span>
            LON <span ref={lonRef} className="text-[#e8e4da]">--</span>
          </span>
        </div>
        <div className={`${hudLabel} flex gap-4`}>
          <span>
            ALT <span ref={altRef} className="text-[#e8e4da]">--</span>
          </span>
          <span>3D · WGS84</span>
        </div>
      </div>
    </div>
  )
}