import ipaddr from 'ipaddr.js';
import { Button } from '~/components/Button';
import { useCallback, useState } from 'react';
import sip from '../../../utils/shift8-ip-func';
import TcpSocket from 'react-native-tcp-socket';
import { Container } from '~/components/Container';
import NetInfo from '@react-native-community/netinfo';
import { FlatList, TouchableOpacity, View, Text, ScrollView, ToastAndroid } from 'react-native';

export default function Home() {
  const portRange = [22, 80, 443, 50];
  type ScanResult = { ip: string; port: number };
  type GroupedScanResult = { ip: string; ports: number[] };
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
      ipRange = ipRange.slice(1); // Remove o primeiro ip do array

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
        // Porta fechada ou host inacessível
        client.destroy();
        reject(err);
      });

      // Timeout para evitar promessas pendentes
      const timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Timeout'));
      }, 5000);

      client.on('close', function () {
        clearTimeout(timeout);
      });
    });
  };

  const iniciar = () => {
    setScanResult([]); // Limpa resultados anteriores
    network_promise
      .then((response: any) => {
        const newScanResults: ScanResult[] = [];
        const promises: Promise<ScanResult>[] = [];

        for (let i = 0; i < response['ip_range'].length; i++) {
          for (let j = 0; j < portRange.length; j++) {
            promises.push(
              scanHost(response['ip_range'][i], portRange[j])
                .then((res: ScanResult) => {
                  newScanResults.push(res);
                  return res;
                })
                .catch((err) => {
                  console.error('Error scanning host:', err);
                  return Promise.reject(err); // Propagate the error
                })
            );
          }
        }

        Promise.allSettled(promises).then(() => {
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
        });
      })
      .catch((err) => {
        console.error('Network promise error:', err);
      });
  };

  const scanTCPHost = (host: any, port: any) => {
    const client = TcpSocket.createConnection(port, host);
    // console.log('Socket created:', client);
    if (client) {
      ToastAndroid.show('Socket created.', ToastAndroid.SHORT);
      client
        .on('data', function (data) {
          //Registra a resposta do servidor
          ToastAndroid.show('RESPONSE: ' + data, ToastAndroid.SHORT);
        })
        .on('connect', function () {
          //Escreve manualmente um solicitação HTTP
          client.write('GET / HTTP/1.0\r\n\r\n');
          ToastAndroid.show('CONNECTED : ' + host + ' ' + port, ToastAndroid.LONG);
        })
        .on('close', function () {
          ToastAndroid.show('DONE', ToastAndroid.SHORT);
          client.destroy();
        })
        .on('error', function (err) {
          console.error('Socket error:', err);
          ToastAndroid.show('ERROR: ' + err.message, ToastAndroid.SHORT);
        })
        .on('timeout', function () {
          console.error('Socket timeout');
          ToastAndroid.show('TIMEOUT', ToastAndroid.SHORT);
        });
    } else {
    }
  };

  const renderItem = useCallback(({ item }: { item: GroupedScanResult }) => {
    return (
      <View className="my-2 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
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
              className="mr-2 items-center justify-center rounded-full border border-[#2196F3] bg-[#1A1A1A] px-3 py-1.5">
              <Text className="font-roboto text-sm font-medium text-[#2196F3]">{port}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }, []);

  return (
    <>
      <Container>
        <View className="flex-1 bg-black pt-5">
          <Button
            title="INICIAR SCAN"
            onPress={() => {
              iniciar();
            }}
          />
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
