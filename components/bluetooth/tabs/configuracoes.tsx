import { useState } from 'react';
import { View, Text, Switch, TextInput, Button } from 'react-native';
import { defaultConfig } from '~/store/bluetooth-store';

export default function BluetoothConfigTab() {
  const [config, setConfig] = useState({ ...defaultConfig });
  const [durationText, setDurationText] = useState(defaultConfig.scanDuration.toString());
  const [rssiText, setRssiText] = useState(defaultConfig.minRssi.toString());

  const handleSave = () => {
    const newConfig = {
      ...config,
      scanDuration: Math.max(1000, parseInt(durationText, 10) || 5000),
      minRssi: Math.min(0, parseInt(rssiText, 10) || -100),
    };
    setConfig(newConfig);
  };

  const toggleBle = () => setConfig((c) => ({ ...c, enableBle: !c.enableBle }));
  const toggleClassic = () => setConfig((c) => ({ ...c, enableClassic: !c.enableClassic }));

  return (
    <View className="flex-1 gap-6 bg-black p-5">
      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Métodos de Descoberta</Text>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-white">BLE (Bluetooth Low Energy)</Text>
            <Text className="text-sm text-gray-400">Dispositivos BLE como sensores, tags</Text>
          </View>
          <Switch
            value={config.enableBle}
            onValueChange={toggleBle}
            trackColor={{ false: '#555', true: '#00C851' }}
            thumbColor={config.enableBle ? '#fff' : '#ccc'}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-white">Bluetooth Clássico</Text>
            <Text className="text-sm text-gray-400">Dispositivos Bluetooth tradicionais</Text>
          </View>
          <Switch
            value={config.enableClassic}
            onValueChange={toggleClassic}
            trackColor={{ false: '#555', true: '#00C851' }}
            thumbColor={config.enableClassic ? '#fff' : '#ccc'}
          />
        </View>
      </View>

      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Duração do Scan (ms)</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={durationText}
          onChangeText={setDurationText}
          placeholder="5000"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <Text className="text-sm text-gray-500">Tempo de varredura para BLE e Clássico</Text>
      </View>

      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">RSSI Mínimo (dBm)</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={rssiText}
          onChangeText={setRssiText}
          placeholder="-100"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <Text className="text-sm text-gray-500">
          Filtra dispositivos com sinal mais fraco que este valor
        </Text>
      </View>

      <Button title="SALVAR" onPress={handleSave} color="#00C851" />
    </View>
  );
}
