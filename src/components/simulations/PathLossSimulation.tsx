import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, RotateCcw } from 'lucide-react';

export const PathLossSimulation = () => {
  const [frequency, setFrequency] = useState(900); // MHz
  const [pathLossExp, setPathLossExp] = useState(2);
  const [shadowingSigma, setShadowingSigma] = useState(8);
  const [maxDistance, setMaxDistance] = useState(10000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [distanceProgress, setDistanceProgress] = useState(0);

  const c = 3e8; // speed of light
  const referenceDistance = 1; // 1 meter

  const chartData = useMemo(() => {
    const data = [];
    // Generate data points from 10m to maxDistance
    for (let d = 10; d <= maxDistance; d += Math.max(1, Math.floor(maxDistance / 100))) {
      const freeSpace = 20 * Math.log10((4 * Math.PI * d * frequency / (c / 1e6)) / 1);
      const logDistance = 20 * Math.log10(4 * Math.PI * referenceDistance * frequency / (c / 1e6)) + 
                         10 * pathLossExp * Math.log10(d / referenceDistance);
      const shadowing = logDistance + (Math.random() - 0.5) * 2 * shadowingSigma;
      
      data.push({
        distance: Math.round(d),
        freeSpace: Math.round(freeSpace * 10) / 10,
        logDistance: Math.round(logDistance * 10) / 10,
        withShadowing: Math.round(shadowing * 10) / 10,
      });
    }
    return data;
  }, [frequency, pathLossExp, shadowingSigma, maxDistance]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setFrequency(900);
    setPathLossExp(2);
    setShadowingSigma(8);
    setMaxDistance(10000);
    setDistanceProgress(0);
    setIsPlaying(false);
  };

  // Animate distance progress
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setDistanceProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentDistance = Math.round((distanceProgress / 100) * maxDistance);

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Path Loss and Shadowing Animation</h3>
        <p className="text-gray-400">Explore how signal strength decreases with distance and the impact of shadowing effects</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <Button
          onClick={handlePlay}
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2"
        >
          <Play className="w-4 h-4" />
          {isPlaying ? 'Playing' : 'Play'}
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-gray-600 hover:bg-gray-800 gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Frequency (MHz):</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Path Loss Exp (n):</label>
          <input
            type="number"
            value={pathLossExp}
            onChange={(e) => setPathLossExp(Number(e.target.value))}
            step="0.1"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Shadowing σ (dB):</label>
          <input
            type="number"
            value={shadowingSigma}
            onChange={(e) => setShadowingSigma(Number(e.target.value))}
            step="0.5"
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Max Distance (m):</label>
          <input
            type="number"
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          />
        </Card>
      </div>

      {/* Progress Slider */}
      <Card className="bg-gray-900 border-gray-700 p-4">
        <div className="space-y-3">
          <Slider
            value={[distanceProgress]}
            onValueChange={(val) => setDistanceProgress(val[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>Distance: {currentDistance}m / {maxDistance}m ({distanceProgress.toFixed(1)}%)</span>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Path Loss vs Distance</h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="distance"
              label={{ value: 'Distance (m)', position: 'insideBottomRight', offset: -5 }}
              stroke="#999"
            />
            <YAxis
              label={{ value: 'Path Loss (dB)', angle: -90, position: 'insideLeft' }}
              stroke="#999"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#999' }} />
            <Line
              type="monotone"
              dataKey="freeSpace"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Free Space"
            />
            <Line
              type="monotone"
              dataKey="logDistance"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Log-Distance"
            />
            <Line
              type="monotone"
              dataKey="withShadowing"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="With Shadowing"
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Free Space Model</p>
          <p className="text-xs text-gray-500 mt-1">PL(d) = 20log₁₀(4πd·f/c)</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Log-Distance Model</p>
          <p className="text-xs text-gray-500 mt-1">PL(d) = PL(d₀) + 10n·log₁₀(d/d₀)</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-700 p-4">
          <p className="text-sm text-gray-300 font-medium">With Shadowing</p>
          <p className="text-xs text-gray-500 mt-1">PL(d) + X_σ (log-normal)</p>
        </Card>
      </div>
    </div>
  );
};
