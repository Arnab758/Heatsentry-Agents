import crypto from 'crypto';

export interface CryptoBlock {
  index: number;
  hash: string;
  previous_hash: string;
  timestamp: string;
  agent: string;
  action: string;
  target_zone?: string | null;
  reasoning: string;
  data: Record<string, any>;
}

export class CryptoAuditLedger {
  private chain: CryptoBlock[] = [];

  constructor() {
    this.createGenesisBlock();
  }

  private computeHash(block: Omit<CryptoBlock, 'hash'>): string {
    const payload = {
      index: block.index,
      timestamp: block.timestamp,
      agent: block.agent,
      action: block.action,
      reasoning: block.reasoning,
      target_zone: block.target_zone ?? null,
      data: block.data,
      previous_hash: block.previous_hash,
    };
    const raw = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  private createGenesisBlock() {
    const genesisData = {
      index: 0,
      timestamp: '2026-07-15T08:00:00.000Z',
      agent: 'Genesis',
      action: 'GENESIS_INITIALIZE',
      target_zone: null,
      reasoning: 'HeatSentry Cryptographic Root Trust Anchor initialized.',
      data: { city: 'Phoenix, AZ', zones_count: 8 },
      previous_hash: '0'.repeat(64),
    };
    const hash = this.computeHash(genesisData);
    this.chain.push({ ...genesisData, hash });
  }

  public appendEvent(
    agent: string,
    action: string,
    reasoning: string,
    target_zone: string | null = null,
    data: Record<string, any> = {}
  ): CryptoBlock {
    const prev = this.chain[this.chain.length - 1];
    const blockData = {
      index: this.chain.length,
      timestamp: new Date().toISOString(),
      agent,
      action,
      target_zone,
      reasoning,
      data,
      previous_hash: prev.hash,
    };
    const hash = this.computeHash(blockData);
    const block: CryptoBlock = { ...blockData, hash };
    this.chain.push(block);
    return block;
  }

  public verifyIntegrity(): {
    is_valid: boolean;
    total_blocks: number;
    latest_block_hash: string;
    verification_timestamp: string;
    status: string;
    error?: string;
    compromised_block?: number;
  } {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const prev = this.chain[i - 1];

      const { hash, ...rest } = current;
      const computed = this.computeHash(rest);
      if (current.hash !== computed) {
        return {
          is_valid: false,
          total_blocks: this.chain.length,
          latest_block_hash: this.chain[this.chain.length - 1].hash,
          verification_timestamp: new Date().toISOString(),
          status: 'INTEGRITY_COMPROMISED',
          error: `Corrupted hash at block index ${current.index}`,
          compromised_block: current.index,
        };
      }

      if (current.previous_hash !== prev.hash) {
        return {
          is_valid: false,
          total_blocks: this.chain.length,
          latest_block_hash: this.chain[this.chain.length - 1].hash,
          verification_timestamp: new Date().toISOString(),
          status: 'INTEGRITY_COMPROMISED',
          error: `Broken parent hash link at block index ${current.index}`,
          compromised_block: current.index,
        };
      }
    }

    return {
      is_valid: true,
      total_blocks: this.chain.length,
      latest_block_hash: this.chain[this.chain.length - 1].hash,
      verification_timestamp: new Date().toISOString(),
      status: 'CRYPTOGRAPHICALLY_VERIFIED',
    };
  }

  public getBlocks(limit = 50): CryptoBlock[] {
    return this.chain.slice(-limit);
  }
}

export const globalCryptoLedger = new CryptoAuditLedger();
