import CesiumViewer from '../CesiumViewer.jsx'

export default function GlobeView(props) {
  return <CesiumViewer {...props} className="absolute inset-0 h-full w-full" />
}
