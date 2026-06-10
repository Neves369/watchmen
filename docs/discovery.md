# Discovery — Varredura de Rede Local

Descobre dispositivos conectados à mesma rede Wi-Fi usando três técnicas
combinadas: **TCP probes**, **ICMP ping** e **mDNS**.

---

## Fluxo de Scan

1. Usuário toca **"INICIAR SCAN"**
2. Limpa lista anterior e inicia **Fase ARP/TCP/Ping**
   - **TCP probes**: tenta conectar em portas comuns + porta alta (65535)
   - **ICMP ping**: `ping -c 1` via shell nativo (não requer root)
   - **Leitura da tabela ARP**: lê `/proc/net/arp` e `ip neigh show` via native module
3. Quando ARP termina, inicia **Fase mDNS**
4. Dispositivos encontrados em ambas as fases são mesclados pelo **IP**
5. Resultado final é exibido na lista única da tela Scan

---

## Fase ARP/TCP/Ping

1. Obtém IP local e máscara de sub-rede via `NetInfo`
2. Calcula o range de IPs da sub-rede
3. Executa **TCP probes** concorrentes (máx 20 hosts por vez):
   - Tenta conectar em portas comuns (80, 443, 22, 445, 139, 548, 5000, 631,
     8080, 9, 3000, 8443, 5900, 5353) com timeout configurável
   - Tenta conectar na porta 65535 de cada IP (probe de host)
4. Executa **ICMP ping sweep** (máx 30 hosts por vez) via native module
   - Usa `/system/bin/ping -c 1 -W <timeout>` — **não requer root**
5. Lê a tabela ARP via native module (`/proc/net/arp`) — resolve restrições
   de segurança do Android 11+
6. Lê fallback `ip neigh show` para capturar MACs adicionais
7. Merge: IPs vivos de TCP probes + ICMP ping + tabela ARP são unificados
8. Para cada MAC encontrado, consulta o fabricante em um banco local
   (`mac-vendors.json`)

> O **ICMP ping** é o método mais confiável para detectar hosts com firewall
> ativo, já que a maioria dos dispositivos responde a ping mesmo com portas
> bloqueadas.

---

## Fase mDNS

1. Itera sobre uma lista de tipos de serviço Bonjour configuráveis
   (http, https, ssh, ipp, printer, airplay, raop, smb, afpovertcp,
   ftp, rdp, sftp, sip)
2. Para cada tipo, executa `Scanner.scanFor()` por 3 segundos usando
   `@dawidzawada/bonjour-zeroconf`
3. Coleta serviços encontrados com hostname, IP, porta e tipo
4. Resultados são mesclados por IP com os dados da fase ARP —
   um dispositivo pode ganhar hostname, serviços descobertos e portas
   adicionais

---

## Tela Scan

- Lista (`FlatList`) com cartões para cada dispositivo encontrado
- Cada cartão mostra:
  - **IP** (destacado)
  - **Fabricante** (se disponível)
  - **Hostname** (se descoberto via mDNS)
  - **Indicador online/offline** (bolinha verde ou vermelha)
  - **Tipo de descoberta**: badge "ARP", "mDNS" ou "Ping"
  - **Serviços encontrados**: badges com ícone (ex: HTTP, SSH, AirPlay)
- Toque em um cartão → navega para tela de **Detalhes**
- Indicador de progresso mostra fase atual com sub-fase (TCP, probe, ping, mDNS)
- Mensagem "Nenhum dispositivo encontrado" quando lista vazia

---

## Tela de Detalhes

- Informações completas do dispositivo:
  - Nome/IP, MAC, fabricante, hostname
  - Última vez visto
  - Método de descoberta
  - Portas abertas (coletadas via mDNS)
- Botão para voltar à lista

---

## Configurações

- **Ativar ARP**: liga/desliga varredura TCP + ARP + Ping
- **Ativar mDNS**: liga/desliga varredura mDNS
- **Ativar Ping**: liga/desliga ICMP ping sweep
- **Timeout Ping**: tempo limite para cada tentativa de ping (ms)
- **Tipos de Serviço**: seleção dos tipos Bonjour a escutar
- Botão **SALVAR** persiste as alterações

---

## Native Module (Android)

O módulo nativo `WatchmenNetwork` (Kotlin) expõe três métodos:

| Método | Descrição |
|---|---|
| `ping(ip, timeoutMs)` | Executa `ping -c 1` via shell |
| `readArpTable()` | Lê `/proc/net/arp` com `BufferedReader` |
| `readIpNeigh()` | Executa `ip neigh show` para MACs adicionais |

---

## Observações

- A leitura da tabela ARP é feita via native module (não via `fetch`) para
  contornar restrições de segurança do Android 11+
- ICMP ping via `/system/bin/ping` não requer root
- mDNS só encontra dispositivos que anunciam serviços Bonjour na rede
- Dispositivos que não respondem a ping, TCP probes nem ARP não serão detectados
