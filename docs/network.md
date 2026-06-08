# Network — Varredura de Portas TCP

Escaneia dispositivos na rede local testando quais portas TCP estão
abertas, permitindo identificar serviços disponíveis em cada host.

---

## Fluxo de Scan

1. Usuário toca **"INICIAR SCAN"**
2. Detecta IP local e máscara de sub-rede via `NetInfo`
3. Calcula o range completo de IPs da sub-rede
4. Para cada IP no range, testa todas as portas configuradas
   em paralelo (até 20 workers simultâneos)
5. Resultados são agrupados por IP — cada dispositivo mostra
   quais portas estão abertas
6. Lista é exibida na tela Scan

---

## Varredura TCP

- Usa `TcpSocket.connect()` do `react-native-tcp-socket`
- Para cada par `(IP, porta)`:
  - Conexão bem-sucedida → porta marcada como **aberta**
  - `ECONNREFUSED` / `EHOSTUNREACH` / `ENETUNREACH` → porta fechada
  - Timeout (configurável) → porta considerada fechada
- Workers concorrentes garantem performance mesmo em ranges grandes

---

## Tela Scan

- Lista (`FlatList`) com cartões para cada dispositivo encontrado
- Cada cartão mostra:
  - **IP** (destacado)
  - **Badge "Disponível"** (verde) se ao menos uma porta está aberta
  - **Portas abertas** listadas individualmente com badge verde
- Dispositivos sem nenhuma porta aberta **não aparecem** na lista

---

## Histórico

- Armazena resultados de varreduras anteriores
- Cada entrada contém data/hora e lista de dispositivos encontrados
- Toque em um item do histórico expande para ver os detalhes
- Permite consultar varreduras passadas sem repetir o scan

---

## Configurações

- **Portas TCP**: campo de texto para lista separada por `;`
  (ex: `22;80;443;8080`)
  - Quanto mais portas, maior a duração da varredura
- **Timeout (ms)**: tempo limite para cada tentativa de conexão
- Botão **SALVAR** persiste as alterações

---

## Observações

- A varredura é **local** — funciona apenas na sub-rede do dispositivo
- Firewalls nos dispositivos alvo podem bloquear as conexões,
  fazendo portas abertas parecerem fechadas
- O range de IPs pode incluir o próprio dispositivo e o gateway
- Um IP presente na lista significa que o dispositivo está ativo
  **e** tem pelo menos uma porta aberta
