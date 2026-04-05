import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { qFunc } from './utils';

export const AlamoutiSimulation = () => {
  const [snrDb, setSnrDb] = useState(10);
  const [modulation, setModulation] = useState('BPSK');

  const calculateBER = () => {
    const dataPoints = [];

    for (let snr = -5; snr <= 25; snr += 1) {
      const snrLinear = Math.pow(10, snr / 10);

      let ber_siso, ber_miso_no_diversity, ber_alamouti;

      if (modulation === 'BPSK') {
        // SISO with Rayleigh fading: BER = 0.5 * (1 - sqrt(SNR/(1+SNR)))
        ber_siso = 0.5 * (1 - Math.sqrt(snrLinear / (1 + snrLinear)));

        // MISO 2x1 without diversity coding (just sum, no ML): similar to SISO
        ber_miso_no_diversity = qFunc(Math.sqrt(2 * 2 * snrLinear));

        // Alamouti 2x1 STBC with diversity order 2: BER ≈ Q(sqrt(2*2*SNR))
        // Full diversity = BER ≈ (1/4) * (1 + 2/SNR)^2 for Rayleigh
        const alamouti_theoretical = 0.25 * Math.pow(1 + 2 / Math.max(snrLinear, 0.01), 2);
        ber_alamouti = qFunc(Math.sqrt(2 * 2 * snrLinear)) * 0.25;
      } else {
        // QPSK similar to BPSK
        ber_siso = 0.5 * (1 - Math.sqrt(snrLinear / (1 + snrLinear)));
        ber_miso_no_diversity = qFunc(Math.sqrt(2 * 2 * snrLinear));
        ber_alamouti = qFunc(Math.sqrt(2 * 2 * snrLinear)) * 0.25;
      }

      dataPoints.push({
        snr,
        siso: Math.max(ber_siso, 1e-8),
        misoNoDiversity: Math.max(ber_miso_no_diversity, 1e-8),
        alamouti: Math.max(ber_alamouti, 1e-8),
      });
    }

    return dataPoints;
  };

  const berData = useMemo(() => calculateBER(), [modulation]);

  const currentBER = useMemo(() => {
    const snrLinear = Math.pow(10, snrDb / 10);

    let sisoValue, misoValue, alamoutiValue;

    if (modulation === 'BPSK') {
      sisoValue = 0.5 * (1 - Math.sqrt(snrLinear / (1 + snrLinear)));
      misoValue = qFunc(Math.sqrt(2 * 2 * snrLinear));
      alamoutiValue = qFunc(Math.sqrt(2 * 2 * snrLinear)) * 0.25;
    } else {
      sisoValue = 0.5 * (1 - Math.sqrt(snrLinear / (1 + snrLinear)));
      misoValue = qFunc(Math.sqrt(2 * 2 * snrLinear));
      alamoutiValue = qFunc(Math.sqrt(2 * 2 * snrLinear)) * 0.25;
    }

    const gain = sisoValue / Math.max(alamoutiValue, 1e-10);

    return {
      siso: sisoValue.toExponential(2),
      miso: misoValue.toExponential(2),
      alamouti: alamoutiValue.toExponential(2),
      gain: gain.toFixed(1),
    };
  }, [snrDb, modulation]);

  const handleReset = () => {
    setSnrDb(10);
    setModulation('BPSK');
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Alamouti Space-Time Block Coding</h3>
        <p className="text-gray-400">Compare Alamouti STBC with standard MISO transmission to understand transmit diversity benefits</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">Modulation</label>
          <select
            value={modulation}
            onChange={(e) => setModulation(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option>BPSK</option>
            <option>QPSK</option>
          </select>
        </Card>
      </div>

      {/* Alamouti Code Structure */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300 font-medium mb-2">Alamouti 2×1 STBC Code Structure:</p>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono text-gray-400 bg-gray-900 p-3 rounded">
          <div>
            <p className="font-semibold text-cyan-400">Time Slot 1:</p>
            <p>TX1: s₁</p>
            <p>TX2: s₂</p>
          </div>
          <div>
            <p className="font-semibold text-cyan-400">Time Slot 2:</p>
            <p>TX1: -s₂*</p>
            <p>TX2: s₁*</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Receiver decodes orthogonally: ỹ = H_eff * s + ñ where H_eff^H * H_eff = (|h₁|² + |h₂|²)·I
        </p>
      </Card>

      {/* BER Comparison */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">BER vs SNR - Rayleigh Fading</h4>
        <ResponsiveContainer width="100%" height={350}>
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
              dataKey="siso"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="SISO (No Diversity)"
            />
            <Line
              type="monotone"
              dataKey="misoNoDiversity"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="MISO (No Coding)"
            />
            <Line
              type="monotone"
              dataKey="alamouti"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name="Alamouti STBC"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Current BER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-700 p-4">
          <p className="text-xs text-gray-500 font-medium">SISO BER</p>
          <p className="text-2xl font-bold text-red-400">{currentBER.siso}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700 p-4">
          <p className="text-xs text-gray-500 font-medium">MISO BER</p>
          <p className="text-2xl font-bold text-yellow-400">{currentBER.miso}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Alamouti BER</p>
          <p className="text-2xl font-bold text-green-400">{currentBER.alamouti}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-xs text-gray-500 font-medium">Gain Factor</p>
          <p className="text-2xl font-bold text-purple-400">{currentBER.gain}×</p>
        </Card>
      </div>

      {/* Key Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Full Diversity</p>
          <p className="text-xs text-gray-500 mt-2">Achieves transmit diversity order 2, same as MRC receiver with 2 antennas.</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Low Complexity</p>
          <p className="text-xs text-gray-500 mt-2">Simple linear decoding without matrix inversion like ML detection.</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Orthogonal Design</p>
          <p className="text-xs text-gray-500 mt-2">Orthogonal STBC properties ensure zero inter-stream interference.</p>
        </Card>
      </div>

      {/* Information */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-cyan-400">Diversity Order:</span> 2 |{' '}
          <span className="font-medium text-cyan-400">Code Rate:</span> 1 (symbols/channel use) |{' '}
          <span className="font-medium text-cyan-400">Antennas:</span> 2 TX
        </p>
      </Card>
    </div>
  );
};
