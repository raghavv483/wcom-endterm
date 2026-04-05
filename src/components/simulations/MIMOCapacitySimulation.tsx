import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RotateCcw } from 'lucide-react';

export const MIMOCapacitySimulation = () => {
  const [txAntennas, setTxAntennas] = useState(2);
  const [rxAntennas, setRxAntennas] = useState(2);
  const [snrDb, setSnrDb] = useState(10);

  const calculateCapacity = () => {
    const dataPoints = [];
    
    for (let snr = -10; snr <= 30; snr += 2) {
      const snrLinear = Math.pow(10, snr / 10);
      
      // SISO capacity
      const sisoCapacity = Math.log2(1 + snrLinear);
      
      // MIMO capacity (assuming i.i.d. Rayleigh channels)
      // For Nrx x Ntx system: C = log2(det(I + SNR/Nt * H*H^H))
      const mimoDegrees = Math.min(txAntennas, rxAntennas);
      const miso = mimoDegrees * Math.log2(1 + (snrLinear / txAntennas));
      
      // Theoretical maximum
      let miso_linear = 0;
      for (let i = 0; i < mimoDegrees; i++) {
        miso_linear += Math.log2(1 + (snrLinear * (i + 1)) / txAntennas) / mimoDegrees;
      }
      
      dataPoints.push({
        snr,
        siso: parseFloat(sisoCapacity.toFixed(3)),
        mimo: parseFloat(miso.toFixed(3)),
        theoretical: parseFloat((mimoDegrees * sisoCapacity).toFixed(3)),
      });
    }
    
    return dataPoints;
  };

  const capacityData = useMemo(() => calculateCapacity(), [txAntennas, rxAntennas]);

  const currentCapacity = useMemo(() => {
    const snrLinear = Math.pow(10, snrDb / 10);
    const sisoCapacity = Math.log2(1 + snrLinear);
    const mimoDegrees = Math.min(txAntennas, rxAntennas);
    
    return {
      siso: sisoCapacity.toFixed(2),
      mimo: (mimoDegrees * Math.log2(1 + (snrLinear / txAntennas))).toFixed(2),
    };
  }, [snrDb, txAntennas, rxAntennas]);

  const handleReset = () => {
    setTxAntennas(2);
    setRxAntennas(2);
    setSnrDb(10);
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-cyan-400">Interactive MIMO Capacity Analysis</h3>
        <p className="text-gray-400">Explore how antenna configurations affect channel capacity</p>
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
          <label className="text-sm font-medium text-gray-300 block mb-3">Tx Antennas: {txAntennas}</label>
          <Slider
            value={[txAntennas]}
            onValueChange={(val) => setTxAntennas(val[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">Rx Antennas: {rxAntennas}</label>
          <Slider
            value={[rxAntennas]}
            onValueChange={(val) => setRxAntennas(val[0])}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </Card>

        <Card className="bg-gray-900 border-gray-700 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-3">SNR (dB): {snrDb}</label>
          <Slider
            value={[snrDb]}
            onValueChange={(val) => setSnrDb(val[0])}
            min={-10}
            max={30}
            step={1}
            className="w-full"
          />
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <h4 className="text-center text-lg font-semibold text-cyan-400 mb-4">Channel Capacity vs SNR</h4>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={capacityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="snr"
              label={{ value: 'SNR (dB)', position: 'insideBottomRight', offset: -5 }}
              stroke="#999"
            />
            <YAxis
              label={{ value: 'Capacity (bits/s/Hz)', angle: -90, position: 'insideLeft' }}
              stroke="#999"
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #444' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#999' }} />
            <Line
              type="monotone"
              dataKey="siso"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name={`SISO (1×1)`}
            />
            <Line
              type="monotone"
              dataKey="mimo"
              stroke="#10b981"
              dot={false}
              strokeWidth={2}
              name={`MIMO (${txAntennas}×${rxAntennas})`}
            />
            <Line
              type="monotone"
              dataKey="theoretical"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Theoretical"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Current Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700 p-4">
          <p className="text-sm text-gray-300 font-medium">Current SNR</p>
          <p className="text-3xl font-bold text-blue-400">{snrDb} dB</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-700 p-4">
          <p className="text-sm text-gray-300 font-medium">SISO Capacity</p>
          <p className="text-3xl font-bold text-green-400">{currentCapacity.siso} bits/s/Hz</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-700 p-4">
          <p className="text-sm text-gray-300 font-medium">MIMO ({txAntennas}×{rxAntennas})</p>
          <p className="text-3xl font-bold text-purple-400">{currentCapacity.mimo} bits/s/Hz</p>
        </Card>
      </div>

      {/* Info */}
      <Card className="bg-gray-800 border-gray-700 p-4">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-cyan-400">Diversity Order:</span> {Math.min(txAntennas, rxAntennas)} |{' '}
          <span className="font-medium text-cyan-400">Multiplexing Gain:</span> {Math.min(txAntennas, rxAntennas)}
        </p>
      </Card>
    </div>
  );
};
