import { useEffect, useRef, useState } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    DoughnutController,
    ArcElement,
    Tooltip,
} from 'chart.js'
import styles from './CenterTypeBreakdownChart.module.css'

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, DoughnutController, ArcElement, Tooltip)

const PALETTE = [
    '#2a78d6',
    '#1baf7a',
    '#eda100',
    '#4a3aa7',
    '#eb6834',
    '#e84393',
    '#00b4d8',
    '#606c38',
]

const PLACEHOLDER_COLOR = '#e5e7eb'

const getColor = (breakdown, type) => {
    const idx = breakdown.findIndex(t => t.type === type)
    return idx >= 0 ? PALETTE[idx % PALETTE.length] : '#898781'
}

const CenterTypeBreakdownChart = ({ data, loading }) => {
    const barCanvasRef = useRef(null)
    const doughnutCanvasRef = useRef(null)
    const barChartRef = useRef(null)
    const doughnutChartRef = useRef(null)
    const [mode, setMode] = useState('count')

    useEffect(() => {
        if (!data || loading) return
        if (!barCanvasRef.current || !doughnutCanvasRef.current) return

        const hasData = data.breakdown?.some(t => t.count > 0)

        // ── Bar chart ──
        if (barChartRef.current) barChartRef.current.destroy()
        const ctx = barCanvasRef.current.getContext('2d')

        barChartRef.current = new ChartJS(ctx, {
            type: 'bar',
            data: hasData
                ? {
                    labels: data.breakdown.map(t => t.type),
                    datasets: [{
                        data: data.breakdown.map(t => mode === 'count' ? t.count : t.amount),
                        backgroundColor: data.breakdown.map((_, i) => PALETTE[i % PALETTE.length]),
                        borderRadius: 4,
                        maxBarThickness: 22,
                    }],
                }
                : {
                    labels: data.breakdown.map(t => t.type),   // use actual types from pricing
                    datasets: [{
                        data: data.breakdown.map(() => 0),
                        backgroundColor: PLACEHOLDER_COLOR,
                        borderRadius: 4,
                        maxBarThickness: 22,
                    }],
                },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: hasData },
                },
                scales: {
                    x: {
                        grid: { color: '#e1e0d9' },
                        ticks: {
                            color: '#898781',
                            font: { size: window.innerWidth <= 480 ? 10 : 11 },
                            stepSize: 1,
                            precision: 0,
                            maxTicksLimit: window.innerWidth <= 480 ? 4 : 8,
                            callback: v => {
                                if (!Number.isInteger(v)) return null
                                return mode === 'amount' ? '₹' + v : v
                            },
                        },
                        beginAtZero: true,
                        suggestedMax: hasData
                            ? mode === 'count'
                                ? Math.max(...data.breakdown.map(t => t.count), 1) + 1
                                : undefined
                            : 5,
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#898781', font: { size: window.innerWidth <= 480 ? 10 : 11 } },
                    },
                },
            },
        })

        // ── Doughnut chart ──
        if (doughnutChartRef.current) doughnutChartRef.current.destroy()
        const ctx2 = doughnutCanvasRef.current.getContext('2d')

        doughnutChartRef.current = new ChartJS(ctx2, {
            type: 'doughnut',
            data: hasData
                ? {
                    labels: data.breakdown.map(t => t.type),
                    datasets: [{
                        data: data.breakdown.map(t => t.count),
                        backgroundColor: data.breakdown.map((_, i) => PALETTE[i % PALETTE.length]),
                        borderColor: '#fcfcfb',
                        borderWidth: 2,
                    }],
                }
                : {
                    labels: ['No data yet'],
                    datasets: [{
                        data: [1],
                        backgroundColor: [PLACEHOLDER_COLOR],
                        borderColor: '#fcfcfb',
                        borderWidth: 2,
                    }],
                },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: hasData },
                },
            },
        })

        return () => {
            barChartRef.current?.destroy()
            doughnutChartRef.current?.destroy()
        }
    }, [data, loading, mode])

    useEffect(() => {
        const handleResize = () => {
            barChartRef.current?.resize()
            doughnutChartRef.current?.resize()
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading) {
        return (
            <div className={styles.row}>
                <div className={styles.card}><div className={styles.skeleton} /></div>
                <div className={styles.card}><div className={styles.skeleton} /></div>
            </div>
        )
    }

    if (!data) return null

    const hasData = data.breakdown?.some(t => t.count > 0)
    const topType = hasData ? data.breakdown[0] : null

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
                        >Count</button>
                        <button
                            className={mode === 'amount' ? styles.tabActive : styles.tab}
                            onClick={() => setMode('amount')}
                        >Amount</button>
                    </div>
                </div>
                <div className={styles.chartWrap}>
                    <canvas ref={barCanvasRef} role="img" aria-label={`Bar chart showing tiffin type breakdown by ${mode}`} />
                </div>
                {!hasData && (
                    <div className={styles.emptyLabel}>No tiffins recorded this month</div>
                )}
            </div>

            {/* Doughnut chart */}
            <div className={styles.card}>
                <div className={styles.cardHead}>Most Ordered Type</div>
                <div className={styles.doughnutWrap}>
                    <div className={styles.chartWrapSmall}>
                        <canvas ref={doughnutCanvasRef} role="img" aria-label="Doughnut chart showing most ordered tiffin type" />
                    </div>
                    {topType && (
                        <div className={styles.doughnutCenter}>
                            <span
                                className={styles.doughnutCenterDot}
                                style={{ background: getColor(data.breakdown, topType.type) }}
                            />
                            <span className={styles.doughnutCenterLabel}>{topType.type}</span>
                            <span className={styles.doughnutCenterPct}>{topType.percentage}%</span>
                        </div>
                    )}
                </div>
                {hasData ? (
                    <div className={styles.typeLegend}>
                        {data.breakdown.map(t => (
                            <div key={t.type} className={styles.typeLegendItem}>
                                <span
                                    className={styles.typeDot}
                                    style={{ background: getColor(data.breakdown, t.type) }}
                                />
                                <span className={styles.typeLabel}>{t.type}</span>
                                <span className={styles.typeCount}>{t.count} tiffins</span>
                                <span className={styles.typePct}>{t.percentage}%</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyLabel}>No tiffins recorded this month</div>
                )}
            </div>

        </div>
    )
}

export default CenterTypeBreakdownChart