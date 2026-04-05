import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { qFunc } from './utils';

export const ModulationSimulation = () => {
  const [modulation, setModulation] = useState('QPSK');
  const [snrDb, setSnrDb] = useState(10);
  const [antenna, setAntenna] = useState('SISO'); // SISO, SIMO, MISO, MIMO

  // Generate constellation
  const constellation = useMemo(() => {
    let symbols = [];
    let spectralEfficiency = 0;

    if (modulation === 'BPSK') {
      symbols = [{ i: 1, q: 0 }, { i: -1, q: 0 }];
      spectralEfficiency = 1;
    } else if (modulation === 'QPSK') {
      symbols = [
        { i: 1, q: 1 },
        { i: 1, q: -1 },
        { i: -1, q: 1 },
        { i: -1, q: -1 },
      ];
      spectralEfficiency = 2;
    } else if (modulation === '16-QAM') {
      for (let i = -3; i <= 3; i += 2) {
        for (let q = -3; q <= 3; q += 2) {
          symbols.push({ i, q });
        }
      }
      spectralEfficiency = 4;
    } else if (modulation === '64-QAM') {
      for (let i = -7; i <= 7; i += 2) {
        for (let q = -7; q <= 7; q += 2) {
          symbols.push({ i, q });
        }
      }
      spectralEfficiency = 6;
    }

    // Normalize power
    const avgPower = symbols.reduce((sum, s) => sum + (s.i * s.i + s.q * s.q), 0) / symbols.length;
    const normalizeFactor = Math.sqrt(1 / avgPower);

    const normalized = symbols.map(s => ({
      i: (s.i * normalizeFactor * 0.7).toFixed(2),
      q: (s.q * normalizeFactor * 0.7).toFixed(2),
      label: `${s.i},${s.q}`,
    }));

    return { symbols: normalized, count: symbols.length, spectralEfficiency };
  }, [modulation]);

  // Calculate BER
  const berData = useMemo(() => {
    const dataPoints = [];

    for (let snr = -5; snr <= 25; snr += 1) {
      const snrLinear = Math.pow(10, snr / 10);

      let ber = 0;

      if (modulation === 'BPSK') {
        ber = qFunc(Math.sqrt(2 * snrLinear));
      } else if (modulation === 'QPSK') {
        ber = qFunc(Math.sqrt(2 * snrLinear));
      } else if (modulation === '16-QAM') {
        const ser = 3 * qFunc(Math.sqrt((6 * snrLinear) / 10));
        ber = ser / 4;
      } else if (modulation === '64-QAM') {
        const ser = (8 / 3) * qFunc(Math.sqrt((42 * snrLinear) / 62));
        ber = ser / 6;
      }

      // Apply antenna gain
      let antennaGain = 1;
      if (antenna === 'SIMO' || antenna === 'MISO') antennaGain = 2;
      if (antenna === 'MIMO') antennaGain = 4;

      const effectiveSNR = snrLinear * antennaGain;
      let effectiveBer = ber;

      if (antenna !== 'SISO') {
        if (modulation === 'BPSK' || modulation === 'QPSK') {
          effectiveBer = qFunc(Math.sqrt(2 * effectiveSNR));
        }
      }

      dataPoints.push({
        snr,
        bpsk: qFunc(Math.sqrt(2 * snrLinear)),
        qpsk: qFunc(Math.sqrt(2 * snrLinear)),
        qam16: Math.max((3 * qFunc(Math.sqrt((6 * snrLinear) / 10)) / 4), 1e-8),
        qam64: Math.max(((8 / 3) * qFunc(Math.sqrt((42 * snrLinear) / 62)) / 6), 1e-8),
      });
    }

    return dataPoints;
  }, [modulation, antenna]);

  const capacity = useMemo(() => {
    const snrLinear = Math.pow(10, snrDb / 10);
    
    let antennaGain = 1;
    if (antenna === 'SIMO' || antenna === 'MISO') antennaGain = 2;
    if (antenna === 'MIMO') antennaGain = 4;

    const effectiveSNR = snrLinear * antennaGain;
    const shannonCapacity = Math.log2(1 + effectiveSNR);

    return {
      shannon: shannonCapacity.toFixed(2),
      modulation: constellation.spectralEfficiency,
    };
  }, [snrDb, antenna, constellation]);

  const handleReset = () => {
    setModulation('QPSK');
    setSnrDb(10);
    setAntenna('SISO');
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Modulation & Antenna Analysis</h3>
        <p className="text-gray-400">Explore different modulation schemes and antenna configurations</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">Modulation</label>
          <select
            value={modulation}
            onChange={(e) => setModulation(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option>BPSK</option>
            <option>QPSK</option>
            <option>16-QAM</option>
            <option>64-QAM</option>
          </select>
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">SNR (dB): {snrDb}</label>
          <Slider
            value={[snrDb]}
            onValueChange={(val) => setSnrDb(val[0])}
            min={-5}
            max={25}
            step={1}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Antenna Configuration</label>
          <select
            value={antenna}
            onChange={(e) => setAntenna(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option>SISO</option>
            <option>SIMO</option>
            <option>MISO</option>
            <option>MIMO</option>
          </select>
        </Card>
      </div>

      {/* Constellation Diagram */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Constellation Diagram ({modulation})</h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            data={constellation.symbols}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="i"
              name="In-Phase"
              stroke="#999"
              type="number"
              domain={[-1.5, 1.5]}
            />
            <YAxis
              dataKey="q"
              name="Quadrature"
              stroke="#999"
              type="number"
              domain={[-1.5, 1.5]}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Scatter name="Symbols" data={constellation.symbols} fill="#10b981" />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* BER Comparison */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">BER vs SNR - All Modulations</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={berData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="snr"
              label={{ value: 'SNR (dB)', position: 'insideBottomRight', offset: -5 }}
              stroke="#999"
            />
            <YAxis
              scale="log"
              domain={[1e-8, 1]}
              label={{ value: 'Bit Error Rate', angle: -90, position: 'insideLeft' }}
              stroke="#999"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: any) => [(value as number).toExponential(2), '']}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#999' }} />
            <Line
              type="monotone"
              dataKey="bpsk"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="BPSK (1 bit/symbol)"
            />
            <Line
              type="monotone"
              dataKey="qpsk"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="QPSK (2 bits/symbol)"
            />
            <Line
              type="monotone"
              dataKey="qam16"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="16-QAM (4 bits/symbol)"
            />
            <Line
              type="monotone"
              dataKey="qam64"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="64-QAM (6 bits/symbol)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Modulation</p>
          <p className="text-2xl font-bold text-cyan-400">{modulation}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Spectral Eff.</p>
          <p className="text-2xl font-bold text-green-400">{constellation.spectralEfficiency} bits/s/Hz</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Current SNR</p>
          <p className="text-2xl font-bold text-blue-400">{snrDb} dB</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Shannon Cap.</p>
          <p className="text-2xl font-bold text-purple-400">{capacity.shannon} bits/s/Hz</p>
        </Card>
      </div>
    </div>
  );
};
