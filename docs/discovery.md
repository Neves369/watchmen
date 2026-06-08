# Discovery — Varredura de Rede Local

Descobre dispositivos conectados à mesma rede Wi-Fi usando duas técnicas
combinadas: **ARP** e **mDNS**.

---

## Fluxo de Scan

1. Usuário toca **"INICIAR SCAN"**
2. Limpa lista anterior e inicia **Fase ARP**
3. Quando ARP termina, inicia **Fase mDNS**
4. Dispositivos encontrados em ambas as fases são mesclados pelo **IP**
5. Resultado final é exibido na lista única da tela Scan

---

## Fase ARP

1. Obtém IP local e máscara de sub-rede via `NetInfo`
2. Calcula o range de IPs da sub-rede
3. Executa **ping sweep** concorrente (máx 20 hosts por vez) — tenta conectar
   na porta TCP 9 de cada IP com timeout configurável
4. Lê a tabela ARP do sistema (`/proc/net/arp`)
5. Filtra apenas entradas com flag `0x2` (resposta recebida) e MAC válido
6. Para cada MAC encontrado, consulta o fabricante em um banco local
   (`mac-vendors.json` com 2391 entradas)
7. Retorna lista de `{ IP, MAC, fabricante }`

> Dispositivos que respondem ao ping mas não aparecem na tabela ARP
> também são incluídos como candidatos.

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
- Indicador de progresso mostra fase atual (ARP ou mDNS)
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

- **Ativar ARP**: liga/desliga varredura ARP
- **Ativar mDNS**: liga/desliga varredura mDNS
- **Ativar Ping**: liga/desliga ping sweep
- **Timeout Ping**: tempo limite para cada tentativa de ping (ms)
- **Tipos de Serviço**: seleção dos tipos Bonjour a escutar
- Botão **SALVAR** persiste as alterações

---

## Observações

- A varredura ARP depende do arquivo `/proc/net/arp` — disponível apenas
  em Android/Linux. Em outros sistemas o fallback é usar apenas o ping
  sweep para detectar hosts ativos.
- mDNS só encontra dispositivos que anunciam serviços Bonjour na rede.
- Dispositivos que não respondem a ping nem anunciam serviços Bonjour
  não serão detectados.
