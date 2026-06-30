import { useEffect, useRef, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
} from 'chart.js'
import { TYPE_LABELS } from '../utils/constants'
import styles from './CenterTypeBreakdownChart.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip)

const TYPE_COLORS = {
    full: '#2a78d6',
    half: '#1baf7a',
    chapati: '#eda100',
    bhakari: '#4a3aa7',
    dalrice: '#eb6834',
}

const CenterTypeBreakdownChart = ({ data, loading }) => {
    const barCanvasRef = useRef(null)
    const doughnutCanvasRef = useRef(null)
    const barChartRef = useRef(null)
    const doughnutChartRef = useRef(null)
    const [mode, setMode] = useState('count')   // 'count' | 'amount'

    useEffect(() => {
        if (!data || loading || !data.breakdown?.length) return

        const labels = data.breakdown.map(t => TYPE_LABELS[t.type] || t.type)
        const colors = data.breakdown.map(t => TYPE_COLORS[t.type] || '#898781')

        // ── Bar chart — toggleable count/amount ──
        if (barChartRef.current) barChartRef.current.destroy()
        const ctx = barCanvasRef.current.getContext('2d')
        barChartRef.current = new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: data.breakdown.map(t => mode === 'count' ? t.count : t.amount),
                    backgroundColor: colors,
                    borderRadius: 4,
                    maxBarThickness: 22,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { color: '#e1e0d9' },
                        ticks: {
                            color: '#898781',
                            font: { size: window.innerWidth <= 480 ? 10 : 11 },
                            stepSize: 1,
                            precision: 0,
                            maxTicksLimit: window.innerWidth <= 480 ? 4 : 8,   // ← fewer ticks on small screens
                            callback: v => {
                                if (!Number.isInteger(v)) return null
                                return mode === 'amount' ? '₹' + v : v
                            },
                        },
                        beginAtZero: true,
                        suggestedMax: mode === 'count'
                            ? Math.max(...data.breakdown.map(t => t.count), 1) + 1
                            : undefined,
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#898781', font: { size: window.innerWidth <= 480 ? 10 : 11 } },
                    },
                },
            },
        })

        // ── Doughnut chart — favourite type by count, always ──
        if (doughnutChartRef.current) doughnutChartRef.current.destroy()
        const ctx2 = doughnutCanvasRef.current.getContext('2d')
        doughnutChartRef.current = new ChartJS(ctx2, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: data.breakdown.map(t => t.count),
                    backgroundColor: colors,
                    borderColor: '#fcfcfb',
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { display: false } },
            },
        })

        return () => {
            barChartRef.current?.destroy()
            doughnutChartRef.current?.destroy()
        }
    }, [data, loading, mode])

    if (loading) {
        return (
            <div className={styles.row}>
                <div className={styles.card}><div className={styles.skeleton} /></div>
                <div className={styles.card}><div className={styles.skeleton} /></div>
            </div>
        )
    }

    if (!data || !data.breakdown?.length) return null

    return (
        <div className={styles.row}>

            {/* Toggleable bar chart */}
            <div className={styles.card}>
                <div className={styles.cardHeadRow}>
                    <div className={styles.cardHead}>Tiffin Type Breakdown</div>
                    <div className={styles.tabs}>
                        <button
                            className={mode === 'count' ? styles.tabActive : styles.tab}
                            onClick={() => setMode('count')}
                        >
                            Count
                        </button>
                        <button
                            className={mode === 'amount' ? styles.tabActive : styles.tab}
                            onClick={() => setMode('amount')}
                        >
                            Amount
                        </button>
                    </div>
                </div>
                <div className={styles.chartWrap}>
                    <canvas
                        ref={barCanvasRef}
                        role="img"
                        aria-label={`Horizontal bar chart showing tiffin type breakdown by ${mode}`}
                    />
                </div>
            </div>

            {/* Favourite type doughnut */}
            <div className={styles.card}>
                <div className={styles.cardHead}>Most Ordered Type</div>
                <div className={styles.chartWrapSmall}>
                    <canvas
                        ref={doughnutCanvasRef}
                        role="img"
                        aria-label="Doughnut chart showing most ordered tiffin type this month"
                    />
                </div>
                <div className={styles.typeLegend}>
                    {data.breakdown.slice(0, 4).map(t => (
                        <div key={t.type} className={styles.typeLegendItem}>
                            <span className={styles.typeDot} style={{ background: TYPE_COLORS[t.type] || '#898781' }} />
                            <span className={styles.typeLabel}>{TYPE_LABELS[t.type] || t.type}</span>
                            <span className={styles.typePct}>{t.percentage}%</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default CenterTypeBreakdownChart