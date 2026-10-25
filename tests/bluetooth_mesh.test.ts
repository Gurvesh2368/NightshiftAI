import { describe, it, expect, beforeEach } from 'vitest';
import {
  bluetoothMesh,
  DEFAULT_MESH_NODES,
  BluetoothEmergencyPacket
} from '../src/lib/bluetoothMesh';

describe('NightShift AI — Bluetooth Mesh Relay Chain & Higher Authority Escalation', () => {
  beforeEach(() => {
    bluetoothMesh.reset();
  });

  it('creates an offline emergency packet with origin worker node and 0 initial hops', () => {
    const coords = { lat: 19.0680, lng: 72.8745 };
    const packet = bluetoothMesh.createEmergencyPacket(coords, 'BKC Interchange');

    expect(packet.packetId.startsWith('BLE_SOS_')).toBe(true);
    expect(packet.originWorker.name).toBe('Gurvesh Patil');
    expect(packet.originWorker.phone).toBe('+91 98765 43210');
    expect(packet.hopCount).toBe(0);
    expect(packet.status).toBe('BROADCASTING');
    expect(packet.chain.length).toBe(1);
    expect(packet.chain[0].role).toBe('origin');
    expect(packet.escalatedToAuthority).toBe(false);
  });

  it('maintains a list of default transit and gateway mesh nodes', () => {
    expect(DEFAULT_MESH_NODES.length).toBeGreaterThanOrEqual(3);
    const peerNode = DEFAULT_MESH_NODES.find(n => n.role === 'worker_peer');
    const transitNode = DEFAULT_MESH_NODES.find(n => n.role === 'transit_relay');
    const chowkiNode = DEFAULT_MESH_NODES.find(n => n.role === 'chowki_beacon');

    expect(peerNode).toBeDefined();
    expect(transitNode).toBeDefined();
    expect(chowkiNode).toBeDefined();
    expect(chowkiNode?.isOnline).toBe(true);
  });

  it('correctly escalates to Higher Authority and attaches official dispatch receipt', async () => {
    const packet = bluetoothMesh.createEmergencyPacket();
    await bluetoothMesh.dispatchToHigherAuthority(packet);

    expect(packet.status).toBe('DISPATCHED_TO_AUTHORITY');
    expect(packet.escalatedToAuthority).toBe(true);
    expect(packet.authorityReceipt).toBeDefined();
    expect(packet.authorityReceipt?.agency).toContain('112');
    expect(packet.authorityReceipt?.dispatchUnit).toContain('PCR Van');
    expect(packet.authorityReceipt?.etaMinutes).toBeGreaterThan(0);
    expect(packet.authorityReceipt?.referenceId).toBeDefined();
    expect(packet.chain[packet.chain.length - 1].role).toBe('higher_authority');
  });

  it('ignores duplicate incoming packets to prevent mesh relay broadcast storms', () => {
    const packet: BluetoothEmergencyPacket = {
      packetId: 'BLE_TEST_DUPLICATE_99',
      originWorker: {
        name: 'Gurvesh Patil',
        phone: '+91 98765 43210',
        bloodGroup: 'O+',
        allergies: 'None'
      },
      incidentTimestamp: '02:30:00 AM',
      coords: { lat: 19.068, lng: 72.874 },
      locationName: 'BKC',
      trackingUrl: 'http://localhost:5173',
      hopCount: 1,
      maxHops: 5,
      chain: [],
      status: 'CHAIN_RELAYING',
      escalatedToAuthority: false
    };

    bluetoothMesh.handleIncomingMeshPacket(packet);
    const initialHops = packet.hopCount;

    // Send the exact same packet again
    bluetoothMesh.handleIncomingMeshPacket(packet);

    // Should not increment or loop
    expect(packet.hopCount).toBe(initialHops);
  });
});
