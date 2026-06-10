# Watchmen
<img width="728" height="409" alt="logo" src="https://github.com/user-attachments/assets/48078060-6fd1-4773-bcc1-9d1d2ae9157f" />

## Sobre

Watchmen é uma ferramenta que permite escanear a rede Wi-Fi local para descobrir
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
