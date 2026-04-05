import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { RotateCcw } from 'lucide-react';

export const RicianFadingSimulation = () => {
  const [kFactor, setKFactor] = useState(0); // 0 = Rayleigh
  const [doppler, setDoppler] = useState(50); // max Doppler frequency in Hz
  const [samples, setSamples] = useState(1000);

  // Generate Rician fading samples
  const fadingData = useMemo(() => {
    const data = [];
    
    for (let n = 0; n < samples; n++) {
      // Generate Rician sample
      const kLinear = Math.pow(10, kFactor / 10);
      
      // Gaussian components
      const inPhase = Math.sqrt(kLinear / (2 * (1 + kLinear))) + 
                     Math.sqrt(1 / (2 * (1 + kLinear))) * randn();
      const quadrature = Math.sqrt(1 / (2 * (1 + kLinear))) * randn();
      
      const magnitude = Math.sqrt(inPhase * inPhase + quadrature * quadrature);
      const power = magnitude * magnitude;
      const phasedB = 20 * Math.log10(Math.max(magnitude, 1e-6));
      
      data.push({
        n,
        magnitude: parseFloat(magnitude.toFixed(3)),
        power: parseFloat(power.toFixed(3)),
        phasedB: parseFloat(phasedB.toFixed(1)),
      });
    }
    
    return data;
  }, [kFactor, samples]);

  // Histogram of magnitudes
  const histogram = useMemo(() => {
    const bins = Array(30).fill(0);
    const maxMag = Math.max(...fadingData.map(d => d.magnitude));
    
    fadingData.forEach(d => {
      const binIndex = Math.floor((d.magnitude / maxMag) * (bins.length - 1));
      bins[binIndex]++;
    });
    
    return bins.map((count, i) => ({
      range: (((i / bins.length) * maxMag).toFixed(2)),
      count,
    }));
  }, [fadingData]);

  // Statistics
  const stats = useMemo(() => {
    const magnitudes = fadingData.map(d => d.magnitude);
    const meanMag = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
    const meanPower = fadingData.map(d => d.power).reduce((a, b) => a + b, 0) / fadingData.length;
    
    return {
      meanMag: meanMag.toFixed(3),
      meanPower: (10 * Math.log10(Math.max(meanPower, 1e-6))).toFixed(2),
    };
  }, [fadingData]);

  const handleReset = () => {
    setKFactor(0);
    setDoppler(50);
    setSamples(1000);
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Rician Fading Channel</h3>
        <p className="text-gray-400">Simulate and analyze Rician/Rayleigh fading with adjustable K-factor</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">K-Factor (dB): {kFactor.toFixed(1)}</label>
          <Slider
            value={[kFactor]}
            onValueChange={(val) => setKFactor(val[0])}
            min={-20}
            max={20}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-2">{kFactor === -20 ? 'Pure Rayleigh' : kFactor > 0 ? 'Rician (LOS dominant)' : 'Rayleigh (No LOS)'}</p>
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Doppler Freq (Hz): {doppler}</label>
          <Slider
            value={[doppler]}
            onValueChange={(val) => setDoppler(val[0])}
            min={0}
            max={200}
            step={5}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Samples: {samples}</label>
          <Slider
            value={[samples]}
            onValueChange={(val) => setSamples(val[0])}
            min={100}
            max={2000}
            step={100}
            className="w-full"
          />
        </Card>
      </div>

      {/* Time Series */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Fading Envelope (Time Domain)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={fadingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="n" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line
              type="monotone"
              dataKey="magnitude"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={1}
              name="Magnitude"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Amplitude Distribution */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Amplitude Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={fadingData.slice(0, 200)}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="n"
              name="Sample"
              stroke="#999"
            />
            <YAxis
              dataKey="magnitude"
              name="Magnitude"
              stroke="#999"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Scatter name="Fading Envelope" data={fadingData.slice(0, 200)} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700 p-4">
          <p className="text-xs text-gray-500 font-medium">K-Factor</p>
          <p className="text-2xl font-bold text-cyan-400">{kFactor.toFixed(1)} dB</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Mean Magnitude</p>
          <p className="text-2xl font-bold text-green-400">{stats.meanMag}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Mean Power</p>
          <p className="text-2xl font-bold text-blue-400">{stats.meanPower} dB</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Doppler Max</p>
          <p className="text-2xl font-bold text-purple-400">{doppler} Hz</p>
        </Card>
      </div>

      {/* Channel Type Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-cyan-400">Channel Type:</span>{' '}
          {kFactor < -15 ? 'Pure Rayleigh (No LOS)' : kFactor < 0 ? 'Rayleigh Dominant' : kFactor < 10 ? 'Rician' : 'Strong LOS Component'}
        </p>
      </Card>
    </div>
  );
};

// Box-Muller transform for Gaussian samples
function randn() {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}
