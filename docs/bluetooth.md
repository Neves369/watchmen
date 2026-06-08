# Bluetooth — Descoberta e Interação com Dispositivos

Descobre dispositivos Bluetooth **BLE** e **Clássico** próximos, permite
conexão e interação completa com cada tipo de transporte.

---

## Scan de Dispositivos

1. Usuário toca **"INICIAR SCAN"**
2. Solicita permissões (Android):
   - `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` (API 31+)
   - `ACCESS_FINE_LOCATION` (Android < 12)
3. Inicia scan **BLE** e **Clássico** em paralelo
4. Cada dispositivo encontrado é adicionado à lista em tempo real
5. Ao final, exibe toast com total de dispositivos encontrados
6. Lista unificada mostra ambos os tipos com ícone indicador

---

## Tela Scan

- Lista com cartões para cada dispositivo encontrado
- Cada cartão mostra:
  - **Nome** (ou "Desconhecido")
  - **Endereço MAC**
  - **Tipo**: badge "BLE" ou "Clássico"
  - **RSSI**: intensidade do sinal em dBm
  - **Serviços**: quantidade de serviços BLE anunciados
  - **Status**: bolinha verde (conectado) ou vermelha
- Botões de ação rápida:
  - **Conectar** → conecta diretamente da lista
  - **Desconectar** → desconecta
- Toque no cartão → navega para tela de **Detalhes**

---

## Dispositivos Pareados

- Lista dispositivos Clássico já pareados com o sistema
- Carregada ao entrar na aba, sem necessidade de scan
- Cada item mostra nome e MAC
- Toque → navega para tela de **Detalhes**

---

## Tela de Detalhes

Cartão principal com informações do dispositivo:
- Nome, MAC, tipo (BLE / Clássico), RSSI
- Status conectado/desconectado
- Botões **Conectar** / **Desconectar**

### Se for BLE (após conectar):

- Lista de **serviços** do dispositivo
- Cada serviço pode ser expandido para ver suas **características**
- Cada característica mostra:
  - UUID (abreviado)
  - **Propriedades**: read, write, writeWithoutResponse, notify
  - Se suporta **leitura**: botão "Ler valor" exibe o conteúdo
  - Se suporta **notificação**: subscription automática para
    receber valores em tempo real

### Se for Clássico (após conectar):

- **Terminal serial** bidirecional via RFCOMM
- Campo de texto para digitar mensagens
- Botão **Enviar** escreve no socket serial
- Área de saída com scroll exibe dados recebidos do dispositivo
- Ideal para comunicação com microcontroladores, módulos HC-05/HC-06,
  Arduino, etc.

---

## Funcionalidades BLE

| Operação | Descrição |
|---|---|
| **Conectar** | Connect + discoverAllServicesAndCharacteristics |
| **Desconectar** | Cancela conexão |
| **Ler característica** | Lê valor atual |
| **Escrever** | Com ou sem confirmação (Write / WriteWithoutResponse) |
| **Monitorar** | Subscribe a notificações com callback |

## Funcionalidades Clássico (RFCOMM)

| Operação | Descrição |
|---|---|
| **Conectar** | Socket RFCOMM pelo endereço MAC |
| **Desconectar** | Fecha socket |
| **Enviar dados** | Escreve string no socket |
| **Receber dados** | Listener de dados recebidos exibido no terminal |

---

## Configurações

- **Ativar BLE**: liga/desliga scan BLE
- **Ativar Clássico**: liga/desliga scan Clássico
- **Duração do Scan**: tempo em segundos para cada scan
- **RSSI Mínimo**: filtra dispositivos com sinal fraco
- Botão **SALVAR** persiste as alterações

---

## Observações

- As permissões são solicitadas **no momento do scan**, não na
  abertura do módulo
- BLE e Clássico compartilham a mesma lista de dispositivos,
  diferenciados pelo campo `transport`
- Dispositivos Clássico requerem pareamento prévio via sistema
  para algumas operações
- O terminal serial Clássico funciona com qualquer dispositivo
  que implemente SPP (Serial Port Profile)
