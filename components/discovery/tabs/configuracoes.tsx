import { useState } from 'react';
import { View, Text, Switch, Button, TextInput } from 'react-native';
import { defaultConfig } from '~/store/discovery-store';

export default function DiscoveryConfig() {
  const [config, setConfig] = useState({ ...defaultConfig });
  const [servicesText, setServicesText] = useState(defaultConfig.serviceTypes.join('; '));
  const [timeoutText, setTimeoutText] = useState(defaultConfig.pingTimeout.toString());

  const handleSave = () => {
    const serviceArray = servicesText
      .split(';')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0);

    const newConfig = {
      ...config,
      serviceTypes: serviceArray,
      pingTimeout: parseInt(timeoutText, 10) || 2000,
    };

    setConfig(newConfig);
  };

  const toggleArp = () => setConfig((c) => ({ ...c, enableArp: !c.enableArp }));
  const toggleMdns = () => setConfig((c) => ({ ...c, enableMdns: !c.enableMdns }));
  const togglePing = () => setConfig((c) => ({ ...c, enablePing: !c.enablePing }));

  return (
    <View className="flex-1 gap-6 bg-black p-5">
      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Métodos de Descoberta</Text>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-white">ARP Scan</Text>
            <Text className="text-sm text-gray-400">
              Escaneia tabela ARP para encontrar IP + MAC
            </Text>
          </View>
          <Switch
            value={config.enableArp}
            onValueChange={toggleArp}
            trackColor={{ false: '#555', true: '#00C851' }}
            thumbColor={config.enableArp ? '#fff' : '#ccc'}
          />
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-white">ICMP Ping</Text>
            <Text className="text-sm text-gray-400">
              Envia ping para cada IP (detecta hosts com firewall)
            </Text>
          </View>
          <Switch
            value={config.enablePing}
            onValueChange={togglePing}
            trackColor={{ false: '#555', true: '#00C851' }}
            thumbColor={config.enablePing ? '#fff' : '#ccc'}
          />
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base font-medium text-white">mDNS / Bonjour</Text>
            <Text className="text-sm text-gray-400">
              Descobre dispositivos que anunciam serviços na rede
            </Text>
          </View>
          <Switch
            value={config.enableMdns}
            onValueChange={toggleMdns}
            trackColor={{ false: '#555', true: '#00C851' }}
            thumbColor={config.enableMdns ? '#fff' : '#ccc'}
          />
        </View>
      </View>

      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Serviços mDNS</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={servicesText}
          onChangeText={setServicesText}
          placeholder="http; https; ssh; airplay"
          placeholderTextColor="#888"
        />
        <Text className="text-sm text-gray-500">Separe os serviços por ponto e vírgula (;)</Text>
      </View>

      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Timeout (ms)</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={timeoutText}
          onChangeText={setTimeoutText}
          placeholder="2000"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <Text className="text-sm text-gray-500">Tempo limite para cada tentativa de ping</Text>
      </View>

      <Button title="SALVAR" onPress={handleSave} color="#00C851" />
    </View>
  );
}
