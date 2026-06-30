import { useEffect, useRef } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    BarController,
    LineController,
    DoughnutController,
    Tooltip,
} from 'chart.js'
import { TYPE_LABELS } from '../utils/constants'
import styles from './CustomerHistoryChart.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    BarController,
    LineController,
    DoughnutController,
    Tooltip
)

const TYPE_COLORS = {
    full: '#2a78d6',
    half: '#1baf7a',
    chapati: '#eda100',
    bhakari: '#4a3aa7',
    dalrice: '#eb6834',
}

const CustomerHistoryChart = ({ data, loading }) => {
    const historyCanvasRef = useRef(null)
    const typeCanvasRef = useRef(null)
    const historyChartRef = useRef(null)
    const typeChartRef = useRef(null)

    useEffect(() => {
        if (!data || loading) return

        // ── Combo chart: bars (count) + line (amount) ──
        if (historyChartRef.current) historyChartRef.current.destroy()

        const ctx = historyCanvasRef.current.getContext('2d')
        historyChartRef.current = new ChartJS(ctx, {
            data: {
                labels: data.months.map(m => m.label),
                datasets: [
                    {
                        type: 'bar',
                        label: 'Tiffins taken',
                        data: data.months.map(m => m.count),
                        backgroundColor: '#2a78d6',
                        borderRadius: 4,
                        maxBarThickness: 28,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line',
                        label: 'Amount spent',
                        data: data.months.map(m => m.amount),
                        borderColor: '#1baf7a',
                        backgroundColor: '#1baf7a',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#1baf7a',
                        tension: 0.3,
                        yAxisID: 'y1',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#898781', font: { size: 11 } } },
                    y: { position: 'left', display: false, beginAtZero: true },
                    y1: {
                        position: 'right',
                        grid: { display: false },
                        ticks: { color: '#898781', font: { size: 11 }, callback: v => '₹' + v },
                        beginAtZero: true,
                    },
                },
            },
        })

        // ── Doughnut: type breakdown ──
        if (typeChartRef.current) typeChartRef.current.destroy()

        if (data.typeBreakdown?.length > 0) {
            const ctx2 = typeCanvasRef.current.getContext('2d')
            typeChartRef.current = new ChartJS(ctx2, {
                type: 'doughnut',
                data: {
                    labels: data.typeBreakdown.map(t => TYPE_LABELS[t.type] || t.type),
                    datasets: [{
                        data: data.typeBreakdown.map(t => t.count),
                        backgroundColor: data.typeBreakdown.map(t => TYPE_COLORS[t.type] || '#898781'),
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
        }

        return () => {
            historyChartRef.current?.destroy()
            typeChartRef.current?.destroy()
        }
    }, [data, loading])

    // Re-trigger Chart.js resize on window resize (handles dev-tools
    // responsive mode / orientation change without a full reload)
    useEffect(() => {
        const handleResize = () => {
            historyChartRef.current?.resize()
            typeChartRef.current?.resize()
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (loading) {
        return (
            <div className={styles.card}>
                <div className={styles.skeleton} />
            </div>
        )
    }

    if (!data || data.months.every(m => m.count === 0)) {
        return null   // no chart if customer has no history yet
    }

    return (
        <div className={styles.row}>

            <div className={styles.card}>
                <div className={styles.cardHead}>My Tiffin History(last 6 months)</div>
                <div className={styles.chartWrap}>
                    <canvas
                        ref={historyCanvasRef}
                        role="img"
                        aria-label="Bar and line chart showing tiffins taken and amount spent over the last 6 months"
                    />
                </div>
                <div className={styles.legend}>
                    <span className={styles.legendItem}>
                        <span className={styles.legendDotBar} /> Tiffins Taken
                    </span>
                    <span className={styles.legendItem}>
                        <span className={styles.legendDotLine} /> Amount Spent
                    </span>
                </div>
            </div>

            {data.typeBreakdown?.length > 0 && (
                <div className={styles.card}>
                    <div className={styles.cardHead}>My Favourite Tiffin Type</div>
                    <div className={styles.chartWrapSmall}>
                        <canvas
                            ref={typeCanvasRef}
                            role="img"
                            aria-label="Doughnut chart showing breakdown of tiffin types ordered"
                        />
                    </div>
                    <div className={styles.typeLegend}>
                        {data.typeBreakdown.slice(0, 4).map(t => (
                            <div key={t.type} className={styles.typeLegendItem}>
                                <span className={styles.typeDot} style={{ background: TYPE_COLORS[t.type] || '#898781' }} />
                                <span className={styles.typeLabel}>{TYPE_LABELS[t.type] || t.type}</span>
                                <span className={styles.typePct}>{t.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default CustomerHistoryChart