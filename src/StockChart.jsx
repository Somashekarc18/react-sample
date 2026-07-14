import { useEffect, useRef } from 'react'
import './StockChart.css'

const VEGA_SPEC = {
  $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
  mark: 'line',
  encoding: {
    x: {
      field: 'date',
      type: 'temporal',
      title: 'Date'
    },
    y: {
      field: 'price',
      type: 'quantitative',
      title: 'Price ($)',
      scale: { zero: false },
      axis: { format: ',.0f' }
    }
  },
  config: {
    view: { continuousWidth: 533, continuousHeight: 394 },
    axisX: { labelLimit: 100, labelFontSize: 10 },
    axisY: { labelFontSize: 10 },
    mark: { tooltip: true }
  },
  data: {
    values: [
      { date: '2026-06-15', price: 145.3 },
      { date: '2026-06-16', price: 147.82 },
      { date: '2026-06-17', price: 146.55 },
      { date: '2026-06-18', price: 148.2 },
      { date: '2026-06-19', price: 150.1 },
      { date: '2026-06-22', price: 149.45 },
      { date: '2026-06-23', price: 151.75 },
      { date: '2026-06-24', price: 153.4 },
      { date: '2026-06-25', price: 152.2 },
      { date: '2026-06-26', price: 154.85 },
      { date: '2026-06-29', price: 156.3 },
      { date: '2026-06-30', price: 155.6 },
      { date: '2026-07-01', price: 157.9 },
      { date: '2026-07-02', price: 159.2 },
      { date: '2026-07-03', price: 158.5 },
      { date: '2026-07-06', price: 160.75 },
      { date: '2026-07-07', price: 162.1 },
      { date: '2026-07-08', price: 161.4 },
      { date: '2026-07-09', price: 163.85 },
      { date: '2026-07-10', price: 165.3 }
    ]
  }
}

function StockChart() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const loadVega = async () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/vega@5'
      script.async = true

      const vlScript = document.createElement('script')
      vlScript.src = 'https://cdn.jsdelivr.net/npm/vega-lite@5'
      vlScript.async = true

      const embedScript = document.createElement('script')
      embedScript.src = 'https://cdn.jsdelivr.net/npm/vega-embed@6'
      embedScript.async = true
      embedScript.onload = () => {
        if (window.vegaEmbed) {
          window.vegaEmbed(containerRef.current, VEGA_SPEC, { actions: false })
        }
      }

      document.body.appendChild(script)
      document.body.appendChild(vlScript)
      document.body.appendChild(embedScript)
    }

    loadVega()
  }, [])

  return (
    <div className="stock-chart-container">
      <h2>Stock Price Trend (Flint → Vega-Lite)</h2>
      <div ref={containerRef} className="vega-chart" />
    </div>
  )
}

export default StockChart
