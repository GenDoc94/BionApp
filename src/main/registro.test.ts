import { describe, expect, it } from 'vitest'
import { pickLanIPv4, summarizeDbChange } from './registro'

describe('pickLanIPv4', () => {
  it('prefers a private IPv4 over link-local', () => {
    expect(
      pickLanIPv4({
        Ethernet: [
          {
            address: '169.254.1.2',
            netmask: '255.255.0.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: false,
            cidr: '169.254.1.2/16'
          },
          {
            address: '192.168.10.22',
            netmask: '255.255.255.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: false,
            cidr: '192.168.10.22/24'
          }
        ],
        Loopback: [
          {
            address: '127.0.0.1',
            netmask: '255.0.0.0',
            family: 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: true,
            cidr: '127.0.0.1/8'
          }
        ]
      })
    ).toBe('192.168.10.22')
  })

  it('accepts numeric family 4', () => {
    expect(
      pickLanIPv4({
        WiFi: [
          {
            address: '10.1.2.3',
            netmask: '255.255.255.0',
            family: 4 as unknown as 'IPv4',
            mac: '00:00:00:00:00:00',
            internal: false,
            cidr: '10.1.2.3/24'
          }
        ]
      })
    ).toBe('10.1.2.3')
  })
})

describe('summarizeDbChange', () => {
  it('keeps identifiers and filters, skips secrets', () => {
    expect(
      summarizeDbChange({
        filters: [{ type: 'eq', column: 'NumBN', value: 12 }],
        data: { NumBN: 12, Petic: 'ABC', password_hash: 'nope', Coment_Muestra: 'nota' }
      })
    ).toBe('NumBN=12 · NumBN=12 · Petic=ABC · Coment_Muestra')
  })
})
