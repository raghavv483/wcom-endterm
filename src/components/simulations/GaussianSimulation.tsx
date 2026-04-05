import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RotateCcw } from 'lucide-react';

export const GaussianSimulation = () => {
  const [mean, setMean] = useState(0);
  const [stdDev, setStdDev] = useState(1);
  const [samples, setSamples] = useState(5000);

  const generateGaussianData = () => {
    // Box-Muller transform to generate Gaussian samples
    const data = [];
    for (let i = 0; i < samples; i++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data.push(mean + z * stdDev);
    }
    return data;
  };

  const gaussianData = useMemo(() => generateGaussianData(), [mean, stdDev, samples]);

  // Histogram bins
  const histogramData = useMemo(() => {
    const min = Math.min(...gaussianData) - 1;
    const max = Math.max(...gaussianData) + 1;
    const binCount = 40;
    const binWidth = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    gaussianData.forEach(value => {
      const binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= 0 && binIndex < binCount) bins[binIndex]++;
    });

    const result = [];
    for (let i = 0; i < binCount; i++) {
      const binCenter = min + (i + 0.5) * binWidth;
      result.push({
        range: (binCenter).toFixed(1),
        count: bins[i],
        theoretical: (samples * binWidth / Math.sqrt(2 * Math.PI * stdDev * stdDev)) *
          Math.exp(-Math.pow(binCenter - mean, 2) / (2 * stdDev * stdDev))
      });
    }
    return result;
  }, [gaussianData, mean, stdDev, samples]);

  // Statistics
  const stats = useMemo(() => {
    const actualMean = gaussianData.reduce((a, b) => a + b, 0) / gaussianData.length;
    const variance = gaussianData.reduce((a, b) => a + Math.pow(b - actualMean, 2), 0) / gaussianData.length;
    const actualStdDev = Math.sqrt(variance);
    
    return {
      mean: actualMean.toFixed(3),
      stdDev: actualStdDev.toFixed(3),
      min: Math.min(...gaussianData).toFixed(3),
      max: Math.max(...gaussianData).toFixed(3),
    };
  }, [gaussianData]);

  const handleReset = () => {
    setMean(0);
    setStdDev(1);
    setSamples(5000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Gaussian Distribution</h3>
        <p className="text-gray-400">Generate and analyze random Gaussian distributions with real-time visualization</p>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-gray-600 hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Mean (μ):</label>
          <input
            type="number"
            value={mean}
            onChange={(e) => setMean(Number(e.target.value))}
            step="0.5"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Std Dev (σ):</label>
          <input
            type="number"
            value={stdDev}
            onChange={(e) => setStdDev(Math.max(0.1, Number(e.target.value)))}
            step="0.1"
            min="0.1"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Samples:</label>
          <input
            type="number"
            value={samples}
            onChange={(e) => setSamples(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>
      </div>

      {/* Histogram */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Probability Distribution</h4>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={histogramData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="range" stroke="#999" angle={-45} height={80} />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#3b82f6" name="Empirical" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Mean</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.mean}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Std Dev</p>
          <p className="text-2xl font-bold text-green-400">{stats.stdDev}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Min Value</p>
          <p className="text-2xl font-bold text-blue-400">{stats.min}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Max Value</p>
          <p className="text-2xl font-bold text-purple-400">{stats.max}</p>
        </Card>
      </div>
    </div>
  );
};
