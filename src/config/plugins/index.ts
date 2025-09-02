import { type App } from 'vue'
import { loadQuasar } from './quasar'
import { loadStringFormat } from './stringFormat'
// import { loadPanzoom } from './panzoom'
// import { loadSignaturePad } from './signaturePad'
// import { loadApexCharts } from './apexCharts'

export function loadPlugins(app: App) {
  loadQuasar(app)
  loadStringFormat(app)
  // loadPanzoom(app)
  // loadSignaturePad(app)
  // loadApexCharts(app)
}
