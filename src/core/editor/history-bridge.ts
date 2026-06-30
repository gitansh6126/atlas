interface Snapshot {
  blockId: string;
  previousState: Record<string, unknown> | null;
  operation: 'insert' | 'delete' | 'update' | 'move';
  timestamp: number;
}

export class HistoryBridge {
  private pendingSnapshots: Snapshot[] = [];
  private isGrouping: boolean = false;

  startGroup(): void {
    this.isGrouping = true
  }

  endGroup(): void {
    this.isGrouping = false
    this.flush()
  }

  recordInsert(blockId: string): void {
    this.pendingSnapshots.push({
      blockId,
      previousState: null,
      operation: 'insert',
      timestamp: Date.now(),
    })
  }

  recordDelete(blockId: string, previousState: Record<string, unknown>): void {
    this.pendingSnapshots.push({
      blockId,
      previousState,
      operation: 'delete',
      timestamp: Date.now(),
    })
  }

  recordUpdate(blockId: string, previousState: Record<string, unknown>): void {
    this.pendingSnapshots.push({
      blockId,
      previousState,
      operation: 'update',
      timestamp: Date.now(),
    })
  }

  recordMove(blockId: string, previousState: Record<string, unknown>): void {
    this.pendingSnapshots.push({
      blockId,
      previousState,
      operation: 'move',
      timestamp: Date.now(),
    })
  }

  canUndo(): boolean {
    return this.pendingSnapshots.length > 0
  }

  getPendingCount(): number {
    return this.pendingSnapshots.length
  }

  clear(): void {
    this.pendingSnapshots = []
    this.isGrouping = false
  }

  private flush(): void {
    if (!this.isGrouping && this.pendingSnapshots.length > 0) {
      this.pendingSnapshots = []
    }
  }
}
