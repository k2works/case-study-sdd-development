import { Arrival } from './arrival.js';

export interface ArrivalRepository {
  save(arrival: Arrival): Promise<Arrival>;
}
