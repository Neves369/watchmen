import ipaddr from 'ipaddr.js';
import { Button } from '~/components/Button';
import { useCallback, useState } from 'react';
import sip from '../../../utils/shift8-ip-func';
import TcpSocket from 'react-native-tcp-socket';
import { Container } from '~/components/Container';
import { global, updateStore } from '~/store/store';
import NetInfo from '@react-native-community/netinfo';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

type GroupedScanResult = { ip: string; ports: number[] };
type ScanResult = { ip: string; port: number; status?: string };

export default function Home() {
  const store = global((state) => state);
  const portRange = store.portas;
  const customTimeout = store.timeout;
  const [totalScans, setTotalScans] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<GroupedScanResult[]>([]);

  const network_promise = new Promise(function (resolve, reject) {
    NetInfo.fetch().then((state: any) => {
      const local_ip = state.details.ipAddress;
      const local_netmask = state.details.subnet;
      const subconv = ipaddr.IPv4.parse(local_netmask).prefixLengthFromSubnetMask();
      const firstHost = ipaddr.IPv4.networkAddressFromCIDR(local_ip + '/' + subconv);
      const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(local_ip + '/' + subconv);
      const firstHostHex = sip.convertIPtoHex(firstHost);
      const lastHostHex = sip.convertIPtoHex(lastHost);
      let ipRange = sip.getIPRange(firstHostHex, lastHostHex);
      // ipRange = ipRange.slice(1); // Remove o primeiro ip do array

      resolve({
        local_ip: local_ip,
        local_netmask: local_netmask,
        subnet_conv: subconv,
        first_host: firstHost,
        last_host: lastHost,
        first_host_hex: firstHostHex,
        last_host_hex: lastHostHex,
        ip_range: ipRange,
      });
    });
  });

  // Função para verificar hosts
  const scanHost = (hostIP: string, hostPort: number): Promise<ScanResult> => {
    return new Promise<ScanResult>((resolve, reject) => {
      const client = TcpSocket.connect(
        {
          port: hostPort,
          host: hostIP,
        },
        function () {
          // Conectado com sucesso
          resolve({ ip: hostIP, port: hostPort });
          client.destroy();
        }
      );

      // Se der erro, rejeita a promise
      client.on('error', function (err: any) {
        client.destroy();
        if (
          err.code === 'ECONNREFUSED' ||
          err.code === 'EHOSTUNREACH' ||
          err.code === 'ENETUNREACH'
        ) {
          resolve({ ip: hostIP, port: hostPort, status: 'closed' }); // Porta fechada ou host inacessível
        } else {
          reject(err); // Outros erros
        }
      });

      // Timeout para evitar promessas pendentes
      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Timeout'));
      }, customTimeout);

      client.on('close', function () {
        clearTimeout(timeout);
      });
    });
  };

  const iniciar = async () => {
    setScanResult([]); // Limpa resultados anteriores
    setIsLoading(true);
    setScanProgress(0);
    setTotalScans(0);

    try {
      const response: any = await network_promise;
      const newScanResults: ScanResult[] = [];
      const promises: Promise<ScanResult>[] = [];
      const allHostsAndPorts: { ip: string; port: number }[] = [];

      for (const ip of response['ip_range']) {
        for (const port of portRange) {
          allHostsAndPorts.push({ ip, port });
        }
      }

      const total = allHostsAndPorts.length;
      setTotalScans(total);

      let completedScans = 0;

      for (const { ip, port } of allHostsAndPorts) {
        promises.push(
          scanHost(ip, port)
            .then((res: ScanResult) => {
              completedScans++;
              setScanProgress(completedScans);
              if (res.status !== 'closed') {
                newScanResults.push(res);
              }
              return res;
            })
            .catch((err) => {
              completedScans++;
              setScanProgress(completedScans);
              console.error('Error scanning host:', err);
              ToastAndroid.show(
                `Erro ao escanear ${ip}:${port}: ${err.message}`,
                ToastAndroid.SHORT
              );
              return Promise.reject(err); // Propagate the error
            })
        );
      }

      await Promise.allSettled(promises);

      const groupedResults: GroupedScanResult[] = [];
      const ipMap: { [key: string]: number[] } = {};

      newScanResults.forEach((result) => {
        if (!ipMap[result.ip]) {
          ipMap[result.ip] = [];
        }
        ipMap[result.ip].push(result.port);
      });

      for (const ip in ipMap) {
        groupedResults.push({ ip, ports: ipMap[ip].sort((a, b) => a - b) });
      }

      setScanResult(groupedResults.sort((a, b) => a.ip.localeCompare(b.ip)));

      // const newHistoryEntry: any = {
      //   timestamp: new Date().toLocaleString(),
      //   results: newScanResults,
      // };

      // updateStore((state) => {
      //   state.historico = [...state.historico, newHistoryEntry];
      // });
    } catch (err: any) {
      console.error('Network promise error:', err);
      ToastAndroid.show(`Erro ao obter informações de rede: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
    }
  };

  const scanTCPHost = (host: any, port: any) => {
    const client = TcpSocket.createConnection(port, host);
    // console.log('entrou...: ', client);
    if (client) {
      ToastAndroid.show('Socket created.', ToastAndroid.SHORT);

      // Listener para quando a conexão é estabelecida
      client.on('connect', function () {
        const newAttempt: any = {
          ip: host,
          port: port,
          timestamp: new Date().toLocaleString(),
          status: 'connected',
          message: 'Conectado com sucesso. Enviando requisição HTTP...',
        };

        updateStore((state) => {
          state.historico = [...state.historico, newAttempt];
        });

        client.write('GET / HTTP/1.0\r\n\r\n');
        ToastAndroid.show('CONNECTED : ' + host + ' ' + port, ToastAndroid.LONG);
      });

      // Listener para quando dados são recebidos
      client.on('data', function (data) {
        const newAttempt: any = {
          ip: host,
          port: port,
          timestamp: new Date().toLocaleString(),
          status: 'data_received',
          message: 'Dados recebidos: ' + data.toString().substring(0, 50) + '...',
        };

        updateStore((state) => {
          state.historico = [...state.historico, newAttempt];
        });
        ToastAndroid.show('RESPONSE: ' + data, ToastAndroid.SHORT);
      });

      // Listener para erros
      client.on('error', function (err) {
        const newAttempt: any = {
          ip: host,
          port: port,
          timestamp: new Date().toLocaleString(),
          status: 'error',
          message: 'Erro: ' + err.message,
        };
        updateStore((state) => {
          state.historico = [...state.historico, newAttempt];
        });
        console.error('Socket error:', err);
        ToastAndroid.show('ERROR: ' + err.message, ToastAndroid.SHORT);
        client.destroy();
      });

      // Listener para o timeout
      client.on('timeout', function () {
        const newAttempt: any = {
          ip: host,
          port: port,
          timestamp: new Date().toLocaleString(),
          status: 'timeout',
          message: 'Tempo limite esgotado.',
        };
        updateStore((state) => {
          state.historico = [...state.historico, newAttempt];
        });
        console.error('Socket timeout');
        ToastAndroid.show('TIMEOUT', ToastAndroid.SHORT);
        client.destroy();
      });

      // Listener para o fechamento
      client.on('close', function () {
        ToastAndroid.show('DONE', ToastAndroid.SHORT);
        client.destroy();
      });
    } else {
      ToastAndroid.show('Erro ao criar socket', ToastAndroid.SHORT);
      const newAttempt: any = {
        ip: host,
        port: port,
        timestamp: new Date().toLocaleString(),
        status: 'error',
        message: 'Falha ao criar o socket.',
      };
      updateStore((state) => {
        state.historico = [...state.historico, newAttempt];
      });
    }
  };

  const renderItem = useCallback(({ item }: { item: GroupedScanResult }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          item.ports.map((port) => scanTCPHost(item.ip, port));
        }}
        className="my-2 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-roboto text-2xl font-bold text-white">{item.ip}</Text>
          <View className="flex-row items-center">
            <View className="mr-1.5 h-2 w-2 rounded-full bg-[#00C851]" />
            <Text className="font-roboto text-sm font-medium text-[#00C851]">Disponível</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1 flex-row">
          {item.ports.map((port) => (
            <TouchableOpacity
              key={port}
              onPress={() => scanTCPHost(item.ip, port)}
              className="mr-2 items-center justify-center rounded-full border border-[#00C851] bg-[#1A1A1A] px-3 py-1.5">
              <Text className="font-roboto text-sm font-medium text-[#00C851]">{port}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </TouchableOpacity>
    );
  }, []);

  return (
    <>
      <Container>
        <View className="flex-1">
          <Button
            title="INICIAR SCAN"
            onPress={() => {
              iniciar();
            }}
            disabled={isLoading}
          />
          {isLoading && (
            <View className="mt-4 items-center">
              <ActivityIndicator size="large" color="#2196F3" />
              <Text className="font-roboto mt-2 text-white">
                Escaneando... ({scanProgress}/{totalScans})
              </Text>
            </View>
          )}
          <FlatList
            data={scanResult}
            numColumns={1}
            keyExtractor={(item) => item.ip}
            renderItem={renderItem}
            contentContainerStyle={{ width: '100%', alignSelf: 'center', paddingVertical: 20 }}
          />
        </View>
      </Container>
    </>
  );
}
