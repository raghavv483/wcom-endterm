import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { RotateCcw } from 'lucide-react';

export const WaterFillingSimulation = () => {
  const [totalPower, setTotalPower] = useState(10);
  const [channels, setChannels] = useState(4);

  // Generate random channel gains
  const channelGains = useMemo(() => {
    const gains = [];
    for (let i = 0; i < channels; i++) {
      gains.push(Math.random() * 0.8 + 0.2); // between 0.2 and 1.0
    }
    return gains;
  }, [channels]);

  // Water-filling algorithm
  const waterfillResults = useMemo(() => {
    // Sort channels by gain
    const sorted = channelGains
      .map((gain, idx) => ({ gain, index: idx }))
      .sort((a, b) => b.gain - a.gain);

    // Find water level
    let waterLevel = 0;
    let allocatedPower = 0;
    
    for (let k = 1; k <= channels; k++) {
      const avgGain = sorted.slice(0, k).reduce((sum, c) => sum + c.gain, 0) / k;
      const mu = (totalPower + k / avgGain) / k;
      
      let isValid = true;
      for (let i = 0; i < k; i++) {
        const power = Math.max(0, mu - 1 / sorted[i].gain);
        if (power < 0) {
          isValid = false;
          break;
        }
      }
      
      if (isValid) {
        waterLevel = mu;
        allocatedPower = totalPower;
        break;
      }
    }

    // Allocate power
    const powerPerChannel = new Array(channels).fill(0);
    channelGains.forEach((gain, idx) => {
      powerPerChannel[idx] = Math.max(0, waterLevel - 1 / gain);
    });

    // Normalize to total power
    const sum = powerPerChannel.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      powerPerChannel.forEach((_, i) => {
        powerPerChannel[i] = (powerPerChannel[i] / sum) * totalPower;
      });
    }

    // Calculate capacity
    const totalCapacity = powerPerChannel.reduce((sum, p, i) => {
      return sum + Math.log2(1 + (p * channelGains[i]) / 1.0);
    }, 0);

    const equalPowerPerChannel = new Array(channels).fill(totalPower / channels);
    const equalCapacity = equalPowerPerChannel.reduce((sum, p, i) => {
      return sum + Math.log2(1 + (p * channelGains[i]) / 1.0);
    }, 0);

    const results = channelGains.map((gain, i) => ({
      channel: `Ch ${i + 1}`,
      index: i,
      gain: parseFloat(gain.toFixed(2)),
      waterfilledPower: parseFloat(powerPerChannel[i].toFixed(2)),
      equalPower: parseFloat((totalPower / channels).toFixed(2)),
    }));

    return {
      data: results,
      waterfilledCapacity: totalCapacity.toFixed(3),
      equalCapacity: equalCapacity.toFixed(3),
      waterLevel: waterLevel.toFixed(3),
    };
  }, [channelGains, totalPower, channels]);

  const handleReset = () => {
    setTotalPower(10);
    setChannels(4);
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Water-Filling Algorithm</h3>
        <p className="text-gray-400">Visualize optimal power allocation across parallel channels</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Total Power: {totalPower.toFixed(1)} W</label>
          <Slider
            value={[totalPower]}
            onValueChange={(val) => setTotalPower(val[0])}
            min={1}
            max={30}
            step={0.5}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Number of Channels: {channels}</label>
          <Slider
            value={[channels]}
            onValueChange={(val) => setChannels(val[0])}
            min={2}
            max={8}
            step={1}
            className="w-full"
          />
        </Card>
      </div>

      {/* Power Allocation Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Power Allocation by Channel</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={waterfillResults.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="channel" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#999' }} />
            <Bar dataKey="waterfilledPower" fill="#10b981" name="Water-Filled Power" />
            <Bar dataKey="equalPower" fill="#3b82f6" opacity={0.6} name="Equal Power" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Channel Gains Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Channel Gains vs Power Allocation</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={waterfillResults.data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="channel" stroke="#999" />
            <YAxis yAxisId="left" stroke="#999" />
            <YAxis yAxisId="right" orientation="right" stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#999' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="gain"
              stroke="#f59e0b"
              dot={{ r: 4 }}
              strokeWidth={2}
              name="Channel Gain"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="waterfilledPower"
              stroke="#10b981"
              dot={{ r: 4 }}
              strokeWidth={2}
              name="Allocated Power"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Capacity Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Water-Filled Capacity</p>
          <p className="text-3xl font-bold text-cyan-400">{waterfillResults.waterfilledCapacity}</p>
          <p className="text-xs text-gray-500 mt-1">bits/s/Hz</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Equal Power Capacity</p>
          <p className="text-3xl font-bold text-green-400">{waterfillResults.equalCapacity}</p>
          <p className="text-xs text-gray-500 mt-1">bits/s/Hz</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Gain</p>
          <p className="text-3xl font-bold text-purple-400">
            {(((parseFloat(waterfillResults.waterfilledCapacity) / parseFloat(waterfillResults.equalCapacity)) - 1) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Improvement</p>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300 font-medium mb-2">Water-Filling Rule:</p>
        <p className="text-xs text-gray-400">P_i = (μ - 1/|H_i|²)₊ where μ is the water level determined by total power constraint. More power is allocated to better channels.</p>
      </Card>
    </div>
  );
};
