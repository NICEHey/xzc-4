import { useState, useEffect } from 'react'
import { statsApi } from '../api/client'
import { Stats as StatsData } from '../types'
import { Loading } from '../components/Loading'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export const Stats = () => {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await statsApi.get()
        setStats(res.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!stats) {
    return <div className="text-center py-12">获取统计数据失败</div>
  }

  const barChartData = {
    labels: stats.monthlyReading.map((m) => m.month.split('-')[1] + '月'),
    datasets: [
      {
        label: '读完书籍数',
        data: stats.monthlyReading.map((m) => m.count),
        backgroundColor: 'rgba(139, 116, 92, 0.7)',
        borderColor: 'rgba(139, 116, 92, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const pieChartData = {
    labels: stats.categoryDistribution.map((c) => c.tag),
    datasets: [
      {
        data: stats.categoryDistribution.map((c) => c.count),
        backgroundColor: [
          'rgba(139, 116, 92, 0.8)',
          'rgba(168, 149, 125, 0.8)',
          'rgba(196, 182, 165, 0.8)',
          'rgba(217, 209, 199, 0.8)',
          'rgba(222, 208, 191, 0.8)',
        ],
        borderColor: '#FAF8F5',
        borderWidth: 2,
      },
    ],
  }

  const ratingChartData = {
    labels: ['1星', '2星', '3星', '4星', '5星'],
    datasets: [
      {
        label: '书籍数',
        data: [1, 2, 3, 4, 5].map((r) => {
          const found = stats.ratingDistribution.find((rd) => rd.rating === r)
          return found?.count || 0
        }),
        backgroundColor: 'rgba(251, 191, 36, 0.7)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#544639',
          padding: 20,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8B745C' },
        grid: { color: 'rgba(139, 116, 92, 0.1)' },
      },
      y: {
        ticks: { color: '#8B745C', stepSize: 1 },
        grid: { color: 'rgba(139, 116, 92, 0.1)' },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#544639',
          padding: 20,
        },
      },
    },
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}小时${mins}分钟`
    }
    return `${mins}分钟`
  }

  const favoriteCategory = stats.categoryDistribution.length > 0
    ? stats.categoryDistribution.reduce((prev, curr) => curr.count > prev.count ? curr : prev).tag
    : '-'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brown-700">阅读统计</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats.thisYearFinished}</div>
          <div className="text-sm text-brown-400">今年已读完</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats.readingNow}</div>
          <div className="text-sm text-brown-400">在读中</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats.totalNotes}</div>
          <div className="text-sm text-brown-400">累计笔记</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="text-3xl font-bold text-brown-600 mb-1">{stats.consecutiveDays}</div>
          <div className="text-sm text-brown-400">连续阅读天数</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-brown-700 mb-6">月度阅读量</h2>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-brown-700 mb-6">分类占比</h2>
          <div className="h-64 flex items-center justify-center">
            {stats.categoryDistribution.length > 0 ? (
              <Pie data={pieChartData} options={pieOptions} />
            ) : (
              <div className="text-brown-400">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-brown-700 mb-6">评分分布</h2>
          <div className="h-64">
            <Bar data={ratingChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-brown-700 mb-6">年度总结</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-brown-100">
              <span className="text-brown-500">今年读完书籍</span>
              <span className="text-xl font-bold text-brown-700">{stats.thisYearFinished} 本</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-brown-100">
              <span className="text-brown-500">累计写笔记</span>
              <span className="text-xl font-bold text-brown-700">{stats.totalNotes} 条</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-brown-100">
              <span className="text-brown-500">最爱分类</span>
              <span className="text-xl font-bold text-brown-700">{favoriteCategory}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-brown-500">累计阅读时长</span>
              <span className="text-xl font-bold text-brown-700">{formatDuration(stats.totalReadingMinutes)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}