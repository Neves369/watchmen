# Watchmen

App de auditoria de rede local e Bluetooth desenvolvido em React Native
com Expo.

---

## Sobre

Watchmen permite escanear a rede Wi-Fi local para descobrir
dispositivos conectados, verificar portas TCP abertas e interagir
com dispositivos Bluetooth.

### Módulos

| Módulo                    | Função                                              |
| ------------------------- | --------------------------------------------------- |
| [Discovery](discovery.md) | Descobre dispositivos na rede local via ARP e mDNS  |
| [Network](network.md)     | Varre portas TCP abertas nos dispositivos da rede   |
| [Bluetooth](bluetooth.md) | Descobre e interage com dispositivos BLE e Clássico |

---

## Navegação

O app usa um **menu lateral (Drawer)** com 3 módulos mais a tela
inicial. Dentro de cada módulo há **abas inferiores** para navegar
entre Scan, Histórico (quando aplicável) e Configurações.

```
Drawer
├── Home              # Tela inicial com instruções
├── Discovery         # ARP + mDNS
│   ├── Scan          # Varredura e lista de dispositivos
│   ├── Detalhes      # Informações do dispositivo
│   └── Configurações # Ativar/desativar métodos de scan
├── Network           # Portas TCP
│   ├── Scan          # Varredura e resultados
│   ├── Histórico     # Varreduras anteriores
│   └── Configurações # Portas e timeout
└── Bluetooth         # BLE + Clássico
    ├── Scan          # Varredura e lista
    ├── Pareados      # Dispositivos pareados
    ├── Detalhes      # Serviços BLE / Terminal Serial
    └── Configurações # Tipos de scan e filtros
```

---

## Tema

Interface em tema escuro com cards `#2A2A2A` sobre fundo preto,
botões de ação na cor verde `#00C851` e indicadores de status
vermelho `#FF4444` / verde `#00C851`.
