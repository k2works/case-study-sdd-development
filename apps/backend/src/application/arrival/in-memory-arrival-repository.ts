import type { ArrivalRepository } from '../../domain/arrival/arrival-repository.js';
import { Arrival } from '../../domain/arrival/arrival.js';
import { ArrivalId } from '../../domain/shared/value-objects.js';

export class InMemoryArrivalRepository implements ArrivalRepository {
  private readonly arrivals: Map<number, Arrival> = new Map();
  private nextId = 1;

  clear(): void {
    this.arrivals.clear();
    this.nextId = 1;
  }

  async save(arrival: Arrival): Promise<Arrival> {
    if (!arrival.arrivalId) {
      const id = this.nextId++;
      const saved = new Arrival({
        ...arrival,
        arrivalId: new ArrivalId(id),
      });
      this.arrivals.set(id, saved);
      return saved;
    }
    this.arrivals.set(arrival.arrivalId.value, arrival);
    return arrival;
  }
}
