import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RotateCcw } from 'lucide-react';
import { qFunc } from './utils';

export const DiversityCombiningSimulation = () => {
  const [branches, setBranches] = useState(2);
  const [modulation, setModulation] = useState('BPSK'); // BPSK or QPSK

  const calculateBER = () => {
    const dataPoints = [];
    
    for (let snrDb = -5; snrDb <= 25; snrDb += 1) {
      const snrLinear = Math.pow(10, snrDb / 10);
      
      let scBer, egcBer, mrcBer, singleBer;
      
      if (modulation === 'BPSK') {
        // Single branch BER
        singleBer = qFunc(Math.sqrt(2 * snrLinear));
        
        // Selection Combining: BER ≈ (2n-1)/n! * (Q(sqrt(2*SNR)))^n
        scBer = Math.pow(singleBer, branches);
        
        // Equal Gain Combining: BER ≈ Q(sqrt(2*L*SNR))
        egcBer = qFunc(Math.sqrt(2 * branches * snrLinear));
        
        // Maximum Ratio Combining: BER ≈ Q(sqrt(2*L*SNR)) - optimal
        mrcBer = qFunc(Math.sqrt(2 * branches * snrLinear));
      } else {
        // QPSK: similar to BPSK (same BER vs SNR per bit)
        const singleBer = qFunc(Math.sqrt(2 * snrLinear));
        scBer = Math.pow(singleBer, branches);
        egcBer = qFunc(Math.sqrt(2 * branches * snrLinear));
        mrcBer = qFunc(Math.sqrt(2 * branches * snrLinear));
      }
      
      dataPoints.push({
        snr: snrDb,
        singleBranch: Math.max(singleBer, 1e-10),
        sc: Math.max(scBer, 1e-10),
        egc: Math.max(egcBer, 1e-10),
        mrc: Math.max(mrcBer, 1e-10),
      });
    }
    
    return dataPoints;
  };

  const berData = useMemo(() => calculateBER(), [branches, modulation]);

  const handleReset = () => {
    setBranches(2);
    setModulation('BPSK');
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive Diversity Combining</h3>
        <p className="text-gray-400">Compare Selection, Equal Gain, and Maximum Ratio Combining techniques</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">Number of Branches: {branches}</label>
          <Slider
            value={[branches]}
            onValueChange={(val) => setBranches(val[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Modulation Scheme</label>
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

      {/* BER Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">BER vs SNR Under Rayleigh Fading</h4>
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
              domain={[1e-10, 1]}
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
              dataKey="singleBranch"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="No Diversity"
            />
            <Line
              type="monotone"
              dataKey="sc"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name={`SC (L=${branches})`}
            />
            <Line
              type="monotone"
              dataKey="egc"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name={`EGC (L=${branches})`}
            />
            <Line
              type="monotone"
              dataKey="mrc"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name={`MRC (L=${branches})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Information Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Selection Combining (SC)</p>
          <p className="text-xs text-gray-500 mt-2">Selects branch with highest SNR. Simple implementation, suboptimal performance.</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Equal Gain Combining (EGC)</p>
          <p className="text-xs text-gray-500 mt-2">Co-phases and sums all branches equally. Better than SC, moderate complexity.</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Maximum Ratio Combining (MRC)</p>
          <p className="text-xs text-gray-500 mt-2">Weights by channel gain. Optimal performance, maximizes SNR with diversity order L.</p>
        </Card>
      </div>

      {/* Diversity Order Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-cyan-400">Diversity Order (L):</span> {branches} |{' '}
          <span className="font-medium text-cyan-400">Modulation:</span> {modulation} |{' '}
          <span className="font-medium text-cyan-400">BER Slope:</span> -{branches} (dB scale)
        </p>
      </Card>
    </div>
  );
};
