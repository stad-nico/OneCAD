import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FrontendEvent, FrontendEventMessage, Model } from '@opentscad/types';
import { filter, map, Observable, scan } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class ModelService {
  /**
   * The socket io client that connects to the backends frontend websocket namespace.
   */
  private readonly socket: Socket = io('ws://localhost:3000/frontend', {
    transports: ['websocket'],
  });

  /**
   * An observable that emits all messages received from the backend frontend socket.
   * We use this as the source for all our signals that need to react to backend events.
   */
  private readonly socket$ = new Observable<FrontendEventMessage>((subscriber) => {
    this.socket.on('connect', () =>
      console.log('Successfully connected to backend frontend socket'),
    );
    this.socket.onAny((event: string, message: FrontendEventMessage) => subscriber.next(message));
    return () => this.socket.disconnect();
  });

  /**
   * A signal that holds the list of all models known to the frontend.
   * It updates whenever a new model update message is received from the backend.
   */
  public readonly models = toSignal(
    this.socket$.pipe(
      filter((message) => message.event === FrontendEvent.ModelUpdate),
      map(({ payload }) => payload.model),
      scan(
        (acc, model) => (acc.some((m) => m.id === model.id) ? acc : [...acc, model]),
        [] as Array<Model>,
      ),
    ),
    { initialValue: [] as Array<Model> },
  );
}
