import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RotateCcw } from 'lucide-react';

export const HataOkumuraSimulation = () => {
  const [frequency, setFrequency] = useState(900); // MHz
  const [txHeight, setTxHeight] = useState(30); // meters
  const [rxHeight, setRxHeight] = useState(1.5); // meters
  const [environment, setEnvironment] = useState('urban'); // urban, suburban, open

  const chartData = useMemo(() => {
    const data = [];
    const c = 3e8;

    for (let d = 10; d <= 50000; d += Math.max(1, Math.floor(50000 / 100))) {
      // Hata-Okumura model for urban
      const logF = Math.log10(frequency);
      const a_hm = (1.1 * logF - 0.7) * rxHeight - (1.56 * logF - 0.8);

      let pathLoss;

      if (environment === 'urban') {
        // Urban model
        pathLoss = 69.55 + 26.16 * logF - 13.82 * Math.log10(txHeight) -
          a_hm + (44.9 - 6.55 * Math.log10(txHeight)) * Math.log10(d / 1000);
      } else if (environment === 'suburban') {
        // Suburban model
        const Ls = -5.45 - 6.62 * Math.log10(frequency);
        const urbanPL = 69.55 + 26.16 * logF - 13.82 * Math.log10(txHeight) -
          a_hm + (44.9 - 6.55 * Math.log10(txHeight)) * Math.log10(d / 1000);
        pathLoss = urbanPL + Ls;
      } else {
        // Open area (rural)
        const Ls = -40 * Math.log10(d / 1000);
        const urbanPL = 69.55 + 26.16 * logF - 13.82 * Math.log10(txHeight) -
          a_hm + (44.9 - 6.55 * Math.log10(txHeight)) * Math.log10(d / 1000);
        pathLoss = urbanPL + Ls;
      }

      // Free space for comparison
      const freeSpace = 20 * Math.log10((4 * Math.PI * d * frequency / (c / 1e6)) / 1);

      // Two-ray model
      const wavelength = c / (frequency * 1e6);
      const r_direct = Math.sqrt(d * d + Math.pow(txHeight - rxHeight, 2));
      const r_reflect = Math.sqrt(d * d + Math.pow(txHeight + rxHeight, 2));
      const phaseShift = (2 * Math.PI / wavelength) * (r_reflect - r_direct);
      const reflection_coeff = -1; // Perfect conductor
      const magnitude = Math.abs(2 * Math.sin(phaseShift / 2) * Math.abs(reflection_coeff));
      const twoRay = 20 * Math.log10(magnitude);

      data.push({
        distance: Math.round(d / 100) * 100,
        hata: Math.round(pathLoss * 10) / 10,
        freeSpace: Math.round(freeSpace * 10) / 10,
        twoRay: Math.max(twoRay, -100),
      });
    }

    // Remove duplicates
    const uniqueData = [];
    const seen = new Set();
    data.forEach(d => {
      if (!seen.has(d.distance)) {
        uniqueData.push(d);
        seen.add(d.distance);
      }
    });

    return uniqueData;
  }, [frequency, txHeight, rxHeight, environment]);

  const handleReset = () => {
    setFrequency(900);
    setTxHeight(30);
    setRxHeight(1.5);
    setEnvironment('urban');
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Hata-Okumura & Two-Ray Models</h3>
        <p className="text-gray-400">Compare empirical and theoretical propagation models for different environments</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">Frequency (MHz): {frequency}</label>
          <Slider
            value={[frequency]}
            onValueChange={(val) => setFrequency(val[0])}
            min={800}
            max={5000}
            step={100}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">TX Height (m): {txHeight}</label>
          <Slider
            value={[txHeight]}
            onValueChange={(val) => setTxHeight(val[0])}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">RX Height (m): {rxHeight}</label>
          <Slider
            value={[rxHeight]}
            onValueChange={(val) => setRxHeight(val[0])}
            min={1}
            max={10}
            step={0.5}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Environment</label>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="urban">Urban</option>
            <option value="suburban">Suburban</option>
            <option value="open">Open/Rural</option>
          </select>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Path Loss Models Comparison</h4>
        <ResponsiveContainer width="100%" height={350}>
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
              dataKey="hata"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Hata-Okumura"
            />
            <Line
              type="monotone"
              dataKey="twoRay"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="Two-Ray"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Model Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Free Space</p>
          <p className="text-xs text-gray-500 mt-2">Ideal propagation. Used as baseline. Valid for line-of-sight only.</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Hata-Okumura</p>
          <p className="text-xs text-gray-500 mt-2">Empirical model based on measurements. Covers 150-1500 MHz.</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Two-Ray Ground</p>
          <p className="text-xs text-gray-500 mt-2">Theoretical model considering direct + reflected path.</p>
        </Card>
      </div>

      {/* Environment Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-cyan-400">Current Environment:</span> {environment.charAt(0).toUpperCase() + environment.slice(1)} |{' '}
          <span className="font-medium text-cyan-400">TX Height:</span> {txHeight}m |{' '}
          <span className="font-medium text-cyan-400">RX Height:</span> {rxHeight}m
        </p>
      </Card>
    </div>
  );
};
